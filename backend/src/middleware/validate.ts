import { NextFunction, Request, Response } from "express";
import { ZodType, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/** Validates and replaces req.body with the parsed (and coerced/trimmed) data. */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.unprocessable("Validation failed", error.issues));
        return;
      }
      next(error);
    }
  };
}

/**
 * Express 5 makes req.query a getter with no setter (`req.query = x` throws
 * "Cannot set property query of #<IncomingMessage> which has only a getter").
 * It's defined per-request as a configurable own property, so redefining it
 * via defineProperty works where plain assignment doesn't.
 */
export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      Object.defineProperty(req, "query", {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.unprocessable("Invalid query parameters", error.issues));
        return;
      }
      next(error);
    }
  };
}

/** Validates route params (e.g. that `:id` is a well-formed ObjectId) before the handler runs. */
export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.unprocessable("Invalid route parameters", error.issues));
        return;
      }
      next(error);
    }
  };
}
