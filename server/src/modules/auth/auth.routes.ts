import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "./auth.validator";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit 5 password reset requests per 15 minutes
  message: {
    success: false,
    message: "Too many password reset requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit 5 OTP verification/resend requests per 5 minutes
  message: {
    success: false,
    message: "Too many OTP verification requests, please try again after 5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration & Authentication routes
router.get("/registration-status", authController.getRegistrationStatus);
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/refresh", authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authenticate, authController.logout);

// Forgot Password Endpoints
router.post("/forgot-password", resetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", resetLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Email OTP 2FA Endpoints
router.post("/send-otp", otpLimiter, validate(resendOtpSchema), authController.sendOtp);
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);

export default router;
