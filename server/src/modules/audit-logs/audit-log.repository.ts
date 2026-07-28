import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type { CreateAuditLogInput, AuditLogQueryFilters } from "./audit-log.types";

export class AuditLogRepository {
  /**
   * Create an audit log entry in PostgreSQL
   */
  async create(data: CreateAuditLogInput) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        userName: data.userName || null,
        userEmail: data.userEmail || null,
        role: data.role || null,
        action: data.action,
        module: data.module.toUpperCase(),
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        entityName: data.entityName || null,
        description: data.description,
        oldValue: data.oldValue ? (data.oldValue as Prisma.InputJsonValue) : {},
        newValue: data.newValue ? (data.newValue as Prisma.InputJsonValue) : {},
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        status: data.status || "SUCCESS",
      },
    });
  }

  /**
   * Find audit log by ID
   */
  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
      },
    });
  }

  /**
   * Find paginated list of audit logs with search & filters
   */
  async findAll(filters: AuditLogQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(200, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { description: { contains: q, mode: "insensitive" } },
        { action: { contains: q, mode: "insensitive" } },
        { userName: { contains: q, mode: "insensitive" } },
        { userEmail: { contains: q, mode: "insensitive" } },
        { entityName: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filters.module) {
      where.module = filters.module.toUpperCase();
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get entity history trail
   */
  async findByEntity(entityType: string, entityId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
