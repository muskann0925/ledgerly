import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z
  .object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    FRONTEND_URL: z.string().default("http://localhost:5173"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters long")
      .optional(),
    JWT_ACCESS_SECRET: z
      .string()
      .min(32, "JWT_ACCESS_SECRET must be at least 32 characters long")
      .optional(),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, "JWT_REFRESH_SECRET must be at least 32 characters long")
      .optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z
      .union([z.boolean(), z.string().transform((val) => val.toLowerCase() === "true")])
      .optional()
      .default(false),
    SMTP_FROM: z.string().optional().default("MarTechAdda Ledgerly <crm.test@martechadda.com>"),
    ENABLE_REGISTRATION: z
      .union([z.boolean(), z.string().transform((val) => val.toLowerCase() === "true")])
      .optional()
      .default(false),
  })
  .transform((data) => {
    const accessSecret = data.JWT_ACCESS_SECRET || data.JWT_SECRET;
    const refreshSecret = data.JWT_REFRESH_SECRET || data.JWT_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error(
        "FATAL: JWT_ACCESS_SECRET/JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables"
      );
    }

    return {
      ...data,
      JWT_ACCESS_SECRET: accessSecret,
      JWT_REFRESH_SECRET: refreshSecret,
    };
  });

export const env = envSchema.parse(process.env);