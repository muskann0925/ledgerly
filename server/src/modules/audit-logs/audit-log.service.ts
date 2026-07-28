import { auditLogRepository, AuditLogRepository } from "./audit-log.repository";
import type { CreateAuditLogInput, AuditLogQueryFilters } from "./audit-log.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "newpassword",
  "currentpassword",
  "apikey",
];

export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository = auditLogRepository) {}

  /**
   * Deep sanitize object to redact sensitive keys like passwords and tokens
   */
  private sanitizeData(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeData(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else if (value && typeof value === "object") {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Log action across system modules
   */
  async logAction(input: CreateAuditLogInput) {
    try {
      let userId = input.userId;
      let userName = input.userName;
      let userEmail = input.userEmail;
      let role = input.role;

      // Fill user snapshot if userId is provided, or clear userId if user does not exist
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true, role: true },
        });
        if (user) {
          userName = userName || user.name;
          userEmail = userEmail || user.email;
          role = role || user.role;
        } else {
          // Prevent FK constraint violation P2003 when userId is 'SYSTEM' or invalid
          userId = undefined;
        }
      }

      const sanitizedOld = input.oldValue ? this.sanitizeData(input.oldValue) : null;
      const sanitizedNew = input.newValue ? this.sanitizeData(input.newValue) : null;

      return await this.repository.create({
        ...input,
        userId,
        userName,
        userEmail,
        role,
        oldValue: sanitizedOld,
        newValue: sanitizedNew,
      });
    } catch (error) {
      console.error("Audit log error:", error);
      // Non-blocking log creation fallback to prevent breaking business transactions
      return null;
    }
  }

  /**
   * Get paginated list of audit logs
   */
  async getAuditLogs(filters: AuditLogQueryFilters) {
    return this.repository.findAll(filters);
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string) {
    const log = await this.repository.findById(id);
    if (!log) {
      throw AppError.notFound(`Audit log with ID '${id}' not found`);
    }
    return log;
  }

  /**
   * Get history trail for a specific entity
   */
  async getEntityHistory(entityType: string, entityId: string) {
    return this.repository.findByEntity(entityType, entityId);
  }

  /**
   * Export audit logs to CSV format
   */
  async exportAuditLogs(filters: AuditLogQueryFilters): Promise<string> {
    const { logs } = await this.repository.findAll({
      ...filters,
      page: 1,
      limit: 10000,
    });

    const headers = [
      "Timestamp",
      "Action",
      "Module",
      "User Name",
      "User Email",
      "Role",
      "Status",
      "Entity Type",
      "Entity ID",
      "Entity Name",
      "Description",
      "IP Address",
      "User Agent",
    ];

    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      `"${(log.action || "").replace(/"/g, '""')}"`,
      `"${(log.module || "").replace(/"/g, '""')}"`,
      `"${(log.userName || "System").replace(/"/g, '""')}"`,
      `"${(log.userEmail || "").replace(/"/g, '""')}"`,
      `"${(log.role || "").replace(/"/g, '""')}"`,
      log.status,
      `"${(log.entityType || "").replace(/"/g, '""')}"`,
      `"${(log.entityId || "").replace(/"/g, '""')}"`,
      `"${(log.entityName || "").replace(/"/g, '""')}"`,
      `"${(log.description || "").replace(/"/g, '""')}"`,
      `"${(log.ipAddress || "").replace(/"/g, '""')}"`,
      `"${(log.userAgent || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}

export const auditLogService = new AuditLogService();
