import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { sendError } from "../utils/apiResponse";

const handler = (message: string) =>
  function rateLimitHandler(_req: unknown, res: Parameters<typeof sendError>[0]) {
    sendError(res, 429, message);
  };

/** General API traffic. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many requests. Please try again later."),
});

/** Tighter limit for auth endpoints to slow down credential stuffing / brute force. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many attempts. Please try again later."),
});

/** Per-account login limit: counts only failed attempts against one email, so a distributed
 * attack (many IPs) on a single account is still slowed down. Keyed by the normalized email in
 * the body, so it must run after body parsing; falls back to the IP when there's no email.
 * Uses the default in-memory store — per process, reset on restart. A shared store (e.g. Redis)
 * is needed for this to hold across multiple instances. */
export const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body as { email?: unknown } | undefined)?.email;
    if (typeof email === "string" && email.trim()) return `login:${email.trim().toLowerCase()}`;
    return `ip:${ipKeyGenerator(req.ip ?? "")}`;
  },
  handler: handler("Too many failed login attempts for this account. Please try again later."),
});

/** Token refresh — looser than login (every tab refreshes on load and on expiry), but bounded. */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many requests. Please try again later."),
});

/** Per-user limit for expensive/abusable authenticated actions (code grading, uploads).
 * Keyed by the authenticated user id, so it must run after `authenticate`. */
export function perUserLimiter(windowMs: number, limit: number, message: string) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `user:${(req as { user?: { id: string } }).user?.id ?? "anonymous"}`,
    handler: handler(message),
  });
}

export const codingSubmitLimiter = perUserLimiter(
  60 * 1000,
  10,
  "Too many code submissions. Please wait a minute and try again."
);

export const uploadLimiter = perUserLimiter(60 * 60 * 1000, 30, "Upload limit reached. Please try again later.");

/** Very tight limit for OTP / password-reset requests. */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many requests. Please wait before trying again."),
});
