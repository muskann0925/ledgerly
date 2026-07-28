import { User, Prisma, PasswordResetToken, EmailOtp } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // Password Reset Token Methods
  async invalidateUserResetTokens(userId: string): Promise<void> {
    await prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
  }

  async createPasswordResetToken(data: {
    userId: string;
    hashedToken: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data,
    });
  }

  async findPasswordResetTokenByHash(hashedToken: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { hashedToken },
    });
  }

  async markResetTokenUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    });
  }

  // Email OTP Methods
  async invalidateUserOtps(userId: string): Promise<void> {
    await prisma.emailOtp.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
  }

  async createEmailOtp(data: {
    userId: string;
    hashedOtp: string;
    expiresAt: Date;
  }): Promise<EmailOtp> {
    return prisma.emailOtp.create({
      data,
    });
  }

  async findLatestActiveOtp(userId: string): Promise<EmailOtp | null> {
    return prisma.emailOtp.findFirst({
      where: { userId, used: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async incrementOtpAttempts(id: string): Promise<EmailOtp> {
    return prisma.emailOtp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async markOtpUsed(id: string): Promise<void> {
    await prisma.emailOtp.update({
      where: { id },
      data: { used: true },
    });
  }
}

export const authRepository = new AuthRepository();

