import multer from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "../utils/AppError";

// Memory storage: files are kept in memory as Buffer before saving
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      AppError.badRequest(
        "Invalid file format. Only PDF, JPG, JPEG, PNG, and WEBP files are allowed for receipt upload."
      ) as unknown as null,
      false
    );
  }
};

export const receiptUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});
