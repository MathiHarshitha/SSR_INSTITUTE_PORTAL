import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { Role } from "../constants/enums";

/** Never trust a role sent by the client — this only checks req.user, set by `authenticate` from the verified JWT + a fresh DB lookup. */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden("You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
