import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../constants/enums";

export interface JwtPayload {
  sub: string;
  role: Role;
  status: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret as Secret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

export function signRefreshToken(payload: Pick<JwtPayload, "sub">): string {
  return jwt.sign(payload, env.jwtRefreshSecret as Secret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret as Secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtRefreshSecret as Secret) as { sub: string };
}
