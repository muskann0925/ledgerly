import { Router } from "express";
import { auditLogController } from "./audit-log.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

// Protect all audit log endpoints: Require Authentication & OWNER/ADMIN Role
router.use(authenticate);
router.use(authorize("OWNER", "ADMIN"));

router.get("/export", (req, res, next) => auditLogController.exportAuditLogs(req, res, next));
router.get("/entity/:entityType/:entityId", (req, res, next) =>
  auditLogController.getEntityHistory(req, res, next)
);
router.get("/:id", (req, res, next) => auditLogController.getAuditLogById(req, res, next));
router.get("/", (req, res, next) => auditLogController.getAuditLogs(req, res, next));

export default router;
