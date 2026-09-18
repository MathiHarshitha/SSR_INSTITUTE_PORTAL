import { NextFunction, Request, Response } from "express";
import { sanitize } from "express-mongo-sanitize";

/**
 * express-mongo-sanitize@2's own middleware does `req.query = ...`, which
 * throws in Express 5 (req.query is now a getter with no setter). Its
 * `sanitize()` helper mutates the target object's keys in place and returns
 * the same reference, so calling it for its side effect — without ever
 * reassigning req.query/req.body/req.params — sidesteps that entirely.
 */
export function mongoSanitize(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);
  next();
}
