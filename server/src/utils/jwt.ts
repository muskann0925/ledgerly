import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./AppError";

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, options);
};

export const generateRefreshToken = (payload: JwtTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, options);
};

export const verifyAccessToken = (token: string): JwtTokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET as Secret
    ) as JwtTokenPayload;
    return decoded;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Access token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized("Invalid access token");
    }
    throw AppError.unauthorized("Could not verify access token");
  }
};

export const verifyRefreshToken = (token: string): JwtTokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET as Secret
    ) as JwtTokenPayload;
    return decoded;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Refresh token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized("Invalid refresh token");
    }
    throw AppError.unauthorized("Could not verify refresh token");
  }
};

export interface MfaTokenPayload {
  userId: string;
  email: string;
  purpose: "2fa_verification";
}

export const generateMfaToken = (userId: string, email: string): string => {
  const payload: MfaTokenPayload = {
    userId,
    email,
    purpose: "2fa_verification",
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {
    expiresIn: "5m",
  });
};

export const verifyMfaToken = (token: string): MfaTokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET as Secret
    ) as MfaTokenPayload;
    if (decoded.purpose !== "2fa_verification") {
      throw AppError.unauthorized("Invalid verification token purpose");
    }
    return decoded;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Verification session has expired. Please log in again.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized("Invalid verification token");
    }
    throw AppError.unauthorized("Could not verify session");
  }
};

