import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/apiResponse";
import { env } from "../config/env";
import { logger } from "../utils/logger";

interface MongoServerErrorLike extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

/** Centralized error middleware. Must be registered last, after all routes. */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = "Validation failed";
    errors = err.issues;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  } else if (isMongoDuplicateKeyError(err)) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    message = `A record with this ${field} already exists`;
  } else if (isJwtError(err)) {
    statusCode = 401;
    message = "Invalid or expired authentication token";
  } else if (err instanceof Error) {
    message = env.isProduction ? message : err.message;
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  } else {
    logger.warn(
      `${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`,
      errors.length ? { errors } : undefined
    );
  }

  sendError(res, statusCode, message, errors);
}

function isMongoDuplicateKeyError(err: unknown): err is MongoServerErrorLike {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

function isJwtError(err: unknown): boolean {
  return (
    err instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(err.name)
  );
}
