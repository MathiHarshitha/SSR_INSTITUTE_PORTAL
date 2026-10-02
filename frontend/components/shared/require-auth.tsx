"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser, roleHomePath } from "@/hooks/useAuth";
import { isDefinitiveAuthFailure, refreshAccessToken } from "@/lib/api-client";
import { Role } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { BrandLoader } from "@/components/shared/brand-loader";

interface RequireAuthProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

/**
 * Client-side gate for role-restricted layouts — UX only; the backend's `authenticate` +
 * `authorize()` middleware is the actual enforcement. The access token lives only in memory,
 * so after a reload we first try to restore the session from the httpOnly refresh cookie.
 * Only a definitive "session ended" answer from the server sends the user to /login; if the
 * server is unreachable (network, cold start) we offer a retry and keep them signed in.
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const storedUser = useAuthStore((s) => s.user);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [serverUnreachable, setServerUnreachable] = useState(false);
  const restoring = useRef(false);
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();

  const effectiveUser = user ?? storedUser;
  const meUnreachable = isError && !isDefinitiveAuthFailure(error);

  useEffect(() => {
    if (!isHydrated || accessToken || restoring.current || restoreFailed || serverUnreachable) return;
    restoring.current = true;
    refreshAccessToken()
      .then((token) => {
        if (token) {
          setAccessToken(token);
        } else {
          clearAuth();
          setRestoreFailed(true);
        }
      })
      .catch(() => setServerUnreachable(true))
      .finally(() => {
        restoring.current = false;
      });
  }, [isHydrated, accessToken, restoreFailed, serverUnreachable, setAccessToken, clearAuth]);

  useEffect(() => {
    if (!isHydrated) return;

    if (restoreFailed || (isError && !meUnreachable)) {
      router.replace("/login");
      return;
    }

    if (accessToken && effectiveUser && !allowedRoles.includes(effectiveUser.role)) {
      router.replace(roleHomePath(effectiveUser.role));
    }
  }, [isHydrated, accessToken, restoreFailed, isError, meUnreachable, effectiveUser, allowedRoles, router]);

  if (serverUnreachable || meUnreachable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h2 className="text-lg font-semibold text-foreground">Can&apos;t reach the server</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;re still signed in. Check your connection and try again — the server may take a
            moment to wake up.
          </p>
          <Button
            onClick={() => {
              if (serverUnreachable) setServerUnreachable(false);
              else void refetch();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!isHydrated || !accessToken || isLoading || !effectiveUser) {
    return <BrandLoader />;
  }

  if (!allowedRoles.includes(effectiveUser.role)) {
    return null;
  }

  return <>{children}</>;
}
