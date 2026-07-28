import { authRepository, AuthRepository } from "./auth.repository";
import {
  RegisterInput,
  LoginInput,
  LoginResult,
  AuthResponseData,
  UserResponse,
  AuthTokens,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyOtpInput,
  ResendOtpInput,
} from "./auth.types";
import {
  hashPassword,
  comparePassword,
  validatePasswordPolicy,
  PASSWORD_POLICY_MESSAGE,
} from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateMfaToken,
  verifyMfaToken,
} from "../../utils/jwt";
import {
  generateSecureToken,
  hashToken,
  generateNumericOtp,
  maskEmail,
} from "../../utils/security";
import { emailService } from "../../shared/email.service";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { User } from "@prisma/client";
import { auditLogService } from "../audit-logs/audit-log.service";

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  private sanitizeUser(user: User): UserResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private generateUserTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async register(
    input: RegisterInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseData> {
    const existingUser = await this.repository.findByEmail(input.email.toLowerCase().trim());
    if (existingUser) {
      throw AppError.conflict("User with this email already exists");
    }

    const policy = validatePasswordPolicy(input.password);
    if (!policy.isValid) {
      throw AppError.badRequest(policy.errors.join(". "));
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await this.repository.createUser({
      name: input.name,
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      role: input.role,
    });

    const tokens = this.generateUserTokens(user);
    const sanitizedUser = this.sanitizeUser(user);

    await auditLogService.logAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: "REGISTER",
      module: "AUTH",
      entityType: "User",
      entityId: user.id,
      entityName: user.name,
      description: `Registered new account '${user.name}' (${user.email})`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return {
      user: sanitizedUser,
      tokens,
    };
  }

  async login(
    input: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResult> {
    const normalizedEmail = input.email ? input.email.toLowerCase().trim() : "";
    const user = await this.repository.findByEmail(normalizedEmail);
    if (!user) {
      await auditLogService.logAction({
        userEmail: normalizedEmail,
        action: "FAILED_LOGIN",
        module: "AUTH",
        description: `Failed login attempt for email: ${normalizedEmail} (User not found)`,
        ipAddress,
        userAgent,
        status: "FAILED",
      });
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      await auditLogService.logAction({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        action: "FAILED_LOGIN",
        module: "AUTH",
        entityType: "User",
        entityId: user.id,
        description: `Failed login attempt for deactivated account '${user.email}'`,
        ipAddress,
        userAgent,
        status: "FAILED",
      });
      throw AppError.forbidden(
        "Account is deactivated. Please contact an administrator."
      );
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      await auditLogService.logAction({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        action: "FAILED_LOGIN",
        module: "AUTH",
        entityType: "User",
        entityId: user.id,
        description: `Failed login attempt for email '${user.email}' (Invalid password)`,
        ipAddress,
        userAgent,
        status: "FAILED",
      });
      throw AppError.unauthorized("Invalid email or password");
    }

    // 2FA Verification Flow (Active when user.twoFactorEnabled is true)
    if (user.twoFactorEnabled) {
      // Invalidate previous OTPs for user
      await this.repository.invalidateUserOtps(user.id);

      // Generate cryptographically secure 6-digit OTP
      const otp = generateNumericOtp();
      const hashedOtp = hashToken(otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store ONLY hashed OTP in DB
      await this.repository.createEmailOtp({
        userId: user.id,
        hashedOtp,
        expiresAt,
      });

      // Send OTP via Email Service
      await emailService.sendOtpEmail(user.email, otp, 5);

      const mfaToken = generateMfaToken(user.id, user.email);

      await auditLogService.logAction({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        action: "OTP_SENT",
        module: "AUTH",
        entityType: "User",
        entityId: user.id,
        description: `2FA OTP code sent to '${maskEmail(user.email)}'`,
        ipAddress,
        userAgent,
        status: "SUCCESS",
      });

      return {
        requires2FA: true,
        mfaToken,
        email: maskEmail(user.email),
      };
    }

    // Direct Login without 2FA
    await this.repository.updateLastLogin(user.id);
    const tokens = this.generateUserTokens(user);
    const sanitizedUser = this.sanitizeUser(user);

    await auditLogService.logAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: "LOGIN",
      module: "AUTH",
      entityType: "User",
      entityId: user.id,
      entityName: user.name,
      description: `User '${user.name}' logged in successfully`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return {
      user: sanitizedUser,
      tokens,
    };
  }

  async forgotPassword(
    input: ForgotPasswordInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const normalizedEmail = input.email ? input.email.toLowerCase().trim() : "";
    const user = await this.repository.findByEmail(normalizedEmail);

    const genericMessage = "If an account exists, password reset instructions have been sent.";

    if (user && user.isActive) {
      // Invalidate all previous unused password reset tokens for user
      await this.repository.invalidateUserResetTokens(user.id);

      // Generate raw secure token & store SHA-256 hash only
      const rawToken = generateSecureToken();
      const hashedToken = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.repository.createPasswordResetToken({
        userId: user.id,
        hashedToken,
        expiresAt,
      });

      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

      // Send email asynchronously
      await emailService.sendPasswordResetEmail(user.email, resetUrl, 15);

      await auditLogService.logAction({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        action: "FORGOT_PASSWORD_REQUEST",
        module: "AUTH",
        entityType: "User",
        entityId: user.id,
        description: `Password reset link requested for '${user.email}'`,
        ipAddress,
        userAgent,
        status: "SUCCESS",
      });
    } else {
      // User enumeration defense: log attempt internally without revealing account existence
      await auditLogService.logAction({
        userEmail: normalizedEmail,
        action: "FORGOT_PASSWORD_REQUEST",
        module: "AUTH",
        description: `Password reset requested for non-existent/deactivated email '${normalizedEmail}'`,
        ipAddress,
        userAgent,
        status: "FAILED",
      });
    }

    return { message: genericMessage };
  }

  async resetPassword(
    input: ResetPasswordInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const hashedSubmittedToken = hashToken(input.token);

    const resetTokenRecord = await this.repository.findPasswordResetTokenByHash(
      hashedSubmittedToken
    );

    if (
      !resetTokenRecord ||
      resetTokenRecord.used ||
      resetTokenRecord.expiresAt < new Date()
    ) {
      throw AppError.badRequest("Invalid, expired, or already used password reset link.");
    }

    const user = await this.repository.findById(resetTokenRecord.userId);
    if (!user || !user.isActive) {
      throw AppError.badRequest("Associated user account is invalid or deactivated.");
    }

    // Enforce password policy
    const policy = validatePasswordPolicy(input.newPassword);
    if (!policy.isValid) {
      throw AppError.badRequest(policy.errors.join(". "));
    }

    // Hash new password using bcrypt (work factor 12)
    const hashedPassword = await hashPassword(input.newPassword);

    // Update password in DB
    await this.repository.updateUserPassword(user.id, hashedPassword);

    // Mark reset token as used
    await this.repository.markResetTokenUsed(resetTokenRecord.id);

    // Invalidate any other active reset tokens for user
    await this.repository.invalidateUserResetTokens(user.id);

    // Invalidate active 2FA OTPs
    await this.repository.invalidateUserOtps(user.id);

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email, userAgent, ipAddress);

    await auditLogService.logAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: "RESET_PASSWORD_SUCCESS",
      module: "AUTH",
      entityType: "User",
      entityId: user.id,
      description: `Password was successfully reset for user '${user.email}'`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return { message: "Password has been successfully updated. Please sign in with your new password." };
  }

  async sendOtp(mfaToken: string): Promise<{ message: string }> {
    const payload = verifyMfaToken(mfaToken);
    const user = await this.repository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw AppError.forbidden("Account is deactivated or invalid.");
    }

    // Generate new OTP
    await this.repository.invalidateUserOtps(user.id);
    const otp = generateNumericOtp();
    const hashedOtp = hashToken(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.repository.createEmailOtp({
      userId: user.id,
      hashedOtp,
      expiresAt,
    });

    await emailService.sendOtpEmail(user.email, otp, 5);

    return { message: `Verification code sent to ${maskEmail(user.email)}` };
  }

  async resendOtp(
    input: ResendOtpInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const payload = verifyMfaToken(input.mfaToken);
    const user = await this.repository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw AppError.forbidden("Account is deactivated or invalid.");
    }

    // Rate Limit / Cooldown Check (60 seconds)
    const latestOtp = await this.repository.findLatestActiveOtp(user.id);
    if (latestOtp) {
      const timeElapsedSec = (Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000;
      if (timeElapsedSec < 60) {
        const remainingSec = Math.ceil(60 - timeElapsedSec);
        throw AppError.tooManyRequests(
          `Please wait ${remainingSec} seconds before requesting a new OTP.`
        );
      }
    }

    // Invalidate previous OTPs
    await this.repository.invalidateUserOtps(user.id);

    // Generate new OTP
    const otp = generateNumericOtp();
    const hashedOtp = hashToken(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.repository.createEmailOtp({
      userId: user.id,
      hashedOtp,
      expiresAt,
    });

    await emailService.sendOtpEmail(user.email, otp, 5);

    await auditLogService.logAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: "RESEND_OTP",
      module: "AUTH",
      entityType: "User",
      entityId: user.id,
      description: `Resent 2FA OTP code to '${maskEmail(user.email)}'`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return { message: "A new OTP verification code has been sent to your email." };
  }

  async verifyOtp(
    input: VerifyOtpInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseData> {
    const payload = verifyMfaToken(input.mfaToken);
    const user = await this.repository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw AppError.forbidden("Account is deactivated or invalid.");
    }

    const latestOtp = await this.repository.findLatestActiveOtp(user.id);
    if (!latestOtp) {
      throw AppError.badRequest("No active OTP found. Please request a new code.");
    }

    // Check expiration
    if (new Date() > latestOtp.expiresAt) {
      await this.repository.markOtpUsed(latestOtp.id);
      throw AppError.badRequest("OTP code has expired. Please request a new code.");
    }

    // Check retry limit (max 5 attempts)
    if (latestOtp.attempts >= 5) {
      await this.repository.markOtpUsed(latestOtp.id);
      throw AppError.badRequest("Maximum verification attempts exceeded. Please request a new OTP code.");
    }

    const submittedOtpHash = hashToken(input.otp);
    if (latestOtp.hashedOtp !== submittedOtpHash) {
      await this.repository.incrementOtpAttempts(latestOtp.id);
      const remainingAttempts = 5 - (latestOtp.attempts + 1);
      if (remainingAttempts <= 0) {
        await this.repository.markOtpUsed(latestOtp.id);
        throw AppError.badRequest("Maximum verification attempts exceeded. Please request a new OTP code.");
      }
      throw AppError.badRequest(
        `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
      );
    }

    // Success! Mark OTP as used
    await this.repository.markOtpUsed(latestOtp.id);
    await this.repository.updateLastLogin(user.id);

    const tokens = this.generateUserTokens(user);
    const sanitizedUser = this.sanitizeUser(user);

    await auditLogService.logAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: "LOGIN_2FA_SUCCESS",
      module: "AUTH",
      entityType: "User",
      entityId: user.id,
      entityName: user.name,
      description: `User '${user.name}' successfully verified 2FA OTP and logged in`,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return {
      user: sanitizedUser,
      tokens,
    };
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Account is deactivated");
    }

    return this.sanitizeUser(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await this.repository.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized("Invalid token payload: User no longer exists");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Account is deactivated");
    }

    return this.generateUserTokens(user);
  }

  async logout(userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    if (userId) {
      await auditLogService.logAction({
        userId,
        action: "LOGOUT",
        module: "AUTH",
        description: `User logged out`,
        ipAddress,
        userAgent,
        status: "SUCCESS",
      });
    }
    return;
  }
}

export const authService = new AuthService();
