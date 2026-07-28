import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("User is not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `User role '${req.user.role}' is not authorized to access this route`
        )
      );
    }

    next();
  };
};
