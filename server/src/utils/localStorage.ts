import fs from "fs";
import path from "path";
import { AppError } from "./AppError";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "receipts");

// Ensure upload directory exists on module load
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface LocalUploadResult {
  filename: string;
  relativePath: string;
  bytes: number;
  originalName: string;
}

/**
 * Sanitize original filename to prevent header injection & special char issues
 */
export function sanitizeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${base}${ext}`;
}

/**
 * Safely resolve absolute path to file in receipts upload directory with path traversal protection
 */
export function getLocalFilePath(filename: string): string {
  const safeFilename = path.basename(filename);
  const fullPath = path.resolve(UPLOAD_DIR, safeFilename);

  // Path traversal check
  if (!fullPath.startsWith(UPLOAD_DIR)) {
    throw AppError.badRequest("Invalid file path specified");
  }

  return fullPath;
}

/**
 * Saves a buffer to server/uploads/receipts directory with unique filename
 */
export async function saveLocalFile(
  buffer: Buffer,
  originalName: string = "receipt"
): Promise<LocalUploadResult> {
  try {
    const sanitizedName = sanitizeFilename(originalName);
    const uniquePrefix = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${uniquePrefix}_${sanitizedName}`;
    const fullPath = path.resolve(UPLOAD_DIR, filename);

    await fs.promises.writeFile(fullPath, buffer);

    return {
      filename,
      relativePath: `uploads/receipts/${filename}`,
      bytes: buffer.length,
      originalName,
    };
  } catch (error: any) {
    throw AppError.internal(`Failed to save file to local storage: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Safely delete a local receipt file by filename
 */
export async function deleteLocalFile(filename: string): Promise<boolean> {
  try {
    const fullPath = getLocalFilePath(filename);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
    return true;
  } catch (error) {
    console.error("Failed to delete local receipt file:", error);
    return false;
  }
}
