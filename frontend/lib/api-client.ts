import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { ApiErrorResponse } from "@/types/auth";

// Centralized API base URL — every API call in the app (axios client below, and any plain
// `fetch` in server components that can't use the browser-oriented axios client) resolves the
// backend origin from here, so there's exactly one place that needs to change per environment.
//
// NEXT_PUBLIC_API_URL always wins when set (e.g. to point a deployment at a staging backend).
// Absent that, the default depends on how the app was built: a production build (`next build`,
// which is what `next dev` never runs) defaults to the actual deployed backend — not localhost,
// which can never be reached from a real visitor's browser — so the app works correctly on
// Vercel even if that project's dashboard never gets the variable configured. Local dev keeps
// defaulting to localhost.
const PRODUCTION_API_URL = "https://ssr-institute-portal.onrender.com/api/v1";
const LOCAL_API_URL = "http://localhost:5000/api/v1";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : LOCAL_API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Separate instance for the refresh call so its own 401s don't recurse into the interceptor below.
const refreshClient = axios.create({ baseURL: API_URL, withCredentials: true });

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

/** True when the server definitively rejected the request (the session is really gone), as
 * opposed to a network error, timeout, 5xx (e.g. the API waking from a cold start) or 429. */
export function isDefinitiveAuthFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error) || !error.response) return false;
  const { status } = error.response;
  return status >= 400 && status < 500 && status !== 408 && status !== 429;
}

const REFRESH_RETRY_DELAYS_MS = [1000, 3000, 8000];

async function requestRefresh(): Promise<string | null> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await refreshClient.post<{ data: { accessToken: string } }>("/auth/refresh-token");
      return res.data.data.accessToken;
    } catch (error) {
      if (isDefinitiveAuthFailure(error)) return null;
      if (attempt >= REFRESH_RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, REFRESH_RETRY_DELAYS_MS[attempt]));
    }
  }
}

/** Exchanges the httpOnly refresh cookie for a new in-memory access token (deduplicated across
 * concurrent callers). Resolves to null only when the server says there is no live session;
 * rejects when the server couldn't be reached, so a temporary outage never logs the user out. */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      let newToken: string | null;
      try {
        newToken = await refreshAccessToken();
      } catch (refreshError) {
        // Server unreachable — fail this request with the network error (not the 401, which
        // callers would read as "signed out") and keep the user signed in.
        return Promise.reject(refreshError);
      }

      if (newToken) {
        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }

      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        // Outside the React tree here (axios interceptor) — no router instance available.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

interface ZodLikeIssue {
  path?: (string | number)[];
  message?: string;
}

function firstIssueDetail(errors: unknown[]): string | null {
  const first = errors[0] as ZodLikeIssue | undefined;
  if (!first?.message) return null;
  const field = first.path?.join(".");
  return field ? `${field}: ${first.message}` : first.message;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.errors?.length) {
      const detail = firstIssueDetail(data.errors);
      if (detail) return detail;
    }
    return data?.message ?? error.message ?? "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
