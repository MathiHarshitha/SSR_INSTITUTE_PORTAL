import rateLimit from "express-rate-limit";
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

/** Very tight limit for OTP / password-reset requests. */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many requests. Please wait before trying again."),
});
