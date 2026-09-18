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

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as unknown as Request["query"];
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
