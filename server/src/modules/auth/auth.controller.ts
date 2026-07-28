import { Request, Response, NextFunction } from "express";
import { authService, AuthService } from "./auth.service";
import { createApiResponse } from "../../utils/apiResponse";
import { AppError } from "../../utils/AppError";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      const data = await this.service.register(req.body, ipAddress, userAgent);
      res
        .status(201)
        .json(createApiResponse(true, "User registered successfully", data));
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      const data = await this.service.login(req.body, ipAddress, userAgent);

      if ("requires2FA" in data && data.requires2FA) {
        res
          .status(200)
          .json(
            createApiResponse(
              true,
              "Verification OTP sent to your email",
              data
            )
          );
        return;
      }

      res
        .status(200)
        .json(createApiResponse(true, "Login successful", data));
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      const result = await this.service.forgotPassword(req.body, ipAddress, userAgent);
      res
        .status(200)
        .json(createApiResponse(true, result.message));
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      const result = await this.service.resetPassword(req.body, ipAddress, userAgent);
      res
        .status(200)
        .json(createApiResponse(true, result.message));
    } catch (error) {
      next(error);
    }
  };

  sendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { mfaToken } = req.body;
      const result = await this.service.sendOtp(mfaToken);
      res
        .status(200)
        .json(createApiResponse(true, result.message));
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      const result = await this.service.resendOtp(req.body, ipAddress, userAgent);
      res
        .status(200)
        .json(createApiResponse(true, result.message));
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      const data = await this.service.verifyOtp(req.body, ipAddress, userAgent);
      res
        .status(200)
        .json(createApiResponse(true, "Authentication successful", data));
    } catch (error) {
      next(error);
    }
  };

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("User is not authenticated");
      }
      const data = await this.service.getMe(req.user.userId);
      res
        .status(200)
        .json(createApiResponse(true, "User profile retrieved successfully", data));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.service.refreshToken(refreshToken);
      res
        .status(200)
        .json(createApiResponse(true, "Token refreshed successfully", tokens));
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
      const userAgent = req.headers["user-agent"];
      await this.service.logout(req.user?.userId, ipAddress, userAgent);
      res
        .status(200)
        .json(createApiResponse(true, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
