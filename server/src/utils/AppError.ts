export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(message: string, statusCode: number = 500, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, errors?: unknown[]): AppError {
    return new AppError(message, 400, errors);
  }

  public static unauthorized(message: string = "Unauthorized"): AppError {
    return new AppError(message, 401);
  }

  public static forbidden(message: string = "Forbidden access"): AppError {
    return new AppError(message, 403);
  }

  public static notFound(message: string = "Resource not found"): AppError {
    return new AppError(message, 404);
  }

  public static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  public static tooManyRequests(message: string = "Too many requests"): AppError {
    return new AppError(message, 429);
  }

  public static internal(message: string = "Internal server error"): AppError {
    return new AppError(message, 500);
  }
}
