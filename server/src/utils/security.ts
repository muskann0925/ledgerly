import crypto from "crypto";

/**
 * Generates a cryptographically secure random token (64 hex chars / 32 bytes)
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Computes a SHA-256 hash of a string token or OTP
 */
export const hashToken = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

/**
 * Generates a cryptographically secure 6-digit numeric OTP (100000 - 999999)
 */
export const generateNumericOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Masks an email address for safe 2FA / verification UI display
 * e.g. "john.doe@example.com" -> "j***e@example.com"
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes("@")) return "***@***.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local.charAt(0)}*@${domain}`;
  }
  return `${local.charAt(0)}${"*".repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
};
