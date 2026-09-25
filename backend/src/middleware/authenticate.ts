import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";
import { Role, UserStatus } from "../constants/enums";
import { isSessionActive } from "../services/session.service";

export interface AuthUser {
  id: string;
  role: Role;
  status: UserStatus;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Bearer header only. Deliberately no cookie fallback: an ambient cookie credential would make
 * every state-changing route CSRF-able. */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

/** Verifies the JWT, then re-checks the session and the user's live role/status on every
 * request — logout, password reset, block and suspend all take effect immediately. */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw ApiError.unauthorized("Authentication token is missing");
    }

    const payload = verifyAccessToken(token);
    if (!payload.sid || !(await isSessionActive(payload.sid, payload.sub))) {
      throw ApiError.unauthorized("Session has ended. Please log in again.");
    }

    const user = await User.findById(payload.sub).select("role status").lean();
    if (!user) {
      throw ApiError.unauthorized("Account no longer exists");
    }
    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden(`Account is ${user.status.toLowerCase()}`);
    }

    req.user = { id: String(user._id), role: user.role, status: user.status };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}
