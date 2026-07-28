import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { Role } from "@prisma/client";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      AppError.unauthorized("Authentication token is missing or invalid")
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(AppError.unauthorized("Authentication token is missing"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };
    next();
  } catch (error) {
    next(error);
  }
};
