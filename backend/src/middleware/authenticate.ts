import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";
import { Role, UserStatus } from "../constants/enums";

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

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }
  return null;
}

/** Verifies the JWT and re-checks the user's live status on every request — a status change (block/suspend) takes effect immediately, not just on next login. */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw ApiError.unauthorized("Authentication token is missing");
    }

    const payload = verifyAccessToken(token);

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
