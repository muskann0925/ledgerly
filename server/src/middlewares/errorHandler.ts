import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
    return;
  }

  // Handle Known Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Resource already exists with unique constraint field",
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }
  }

  // Unhandled / Internal Server Errors
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
