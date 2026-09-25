import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../constants/enums";

export interface JwtPayload {
  sub: string;
  /** Session id — the token is only honoured while this session is live (see authenticate). */
  sid: string;
  role: Role;
  status: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret as Secret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  // Pin the algorithm so a token can never pick its own verification method.
  return jwt.verify(token, env.jwtSecret as Secret, { algorithms: ["HS256"] }) as JwtPayload;
}
