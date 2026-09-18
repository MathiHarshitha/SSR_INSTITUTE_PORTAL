import { NextFunction, Request, Response } from "express";
import { sanitize } from "express-mongo-sanitize";

/**
 * express-mongo-sanitize@2's own middleware does `req.query = ...`, which
 * throws in Express 5 (req.query has no setter). Worse, `req.query` is a
 * getter that recomputes a brand-new object from the URL on *every* access —
 * it is never cached — so mutating the object returned by one read of
 * req.query (as `sanitize()` does in place) is silently discarded the next
 * time anything reads req.query. req.body/req.params are plain stored
 * properties, so in-place mutation works fine for those; req.query needs its
 * sanitized result written back via defineProperty (configurable per request)
 * so later reads (validateQuery, controllers) see it.
 */
export function mongoSanitize(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) {
    const cleaned = sanitize(req.query);
    Object.defineProperty(req, "query", {
      value: cleaned,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
}
