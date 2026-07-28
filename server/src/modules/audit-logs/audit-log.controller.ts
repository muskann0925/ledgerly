import { Request, Response, NextFunction } from "express";
import { auditLogService } from "./audit-log.service";
import { AuditStatus } from "@prisma/client";

export class AuditLogController {
  /**
   * GET /audit-logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const moduleFilter = req.query.module as string;
      const action = req.query.action as string;
      const userId = req.query.userId as string;
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const status = req.query.status as AuditStatus;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as "asc" | "desc";

      const result = await auditLogService.getAuditLogs({
        page,
        limit,
        search,
        module: moduleFilter,
        action,
        userId,
        entityType,
        entityId,
        status,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /audit-logs/export
   */
  async exportAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const moduleFilter = req.query.module as string;
      const action = req.query.action as string;
      const userId = req.query.userId as string;
      const status = req.query.status as AuditStatus;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const csvData = await auditLogService.exportAuditLogs({
        search,
        module: moduleFilter,
        action,
        userId,
        status,
        startDate,
        endDate,
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`
      );
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /audit-logs/:id
   */
  async getAuditLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const log = await auditLogService.getAuditLogById(id);
      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /audit-logs/entity/:entityType/:entityId
   */
  async getEntityHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      const logs = await auditLogService.getEntityHistory(entityType, entityId);
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const auditLogController = new AuditLogController();
