import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * GET /dashboard
 * Protected route returning real database dashboard analytics.
 */
router.get(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"),
  dashboardController.getDashboardMetrics
);

/**
 * GET /dashboard/export/analytics/csv
 * Export dashboard financial analytics as a CSV file download.
 */
router.get(
  "/export/analytics/csv",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE"),
  dashboardController.exportAnalyticsCsv
);

/**
 * GET /dashboard/export/csv
 * Export real database invoices as a CSV file download.
 */
router.get(
  "/export/csv",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE"),
  dashboardController.exportCsv
);

export default router;
