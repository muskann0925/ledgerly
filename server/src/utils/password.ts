import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  plainText: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, hashed);
};

export interface PasswordPolicyResult {
  isValid: boolean;
  errors: string[];
}

export const validatePasswordPolicy = (password: string): PasswordPolicyResult => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character (e.g. !@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.";

