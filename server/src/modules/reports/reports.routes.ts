import { Router } from "express";
import { ReportsController } from "./reports.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();
const controller = new ReportsController();

// All analytics & reports endpoints require authentication & authorized role
router.use(authenticate);

router.get("/dashboard", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.getDashboardSummary);
router.get("/revenue", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.getRevenueReport);
router.get("/invoices", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.getInvoiceReport);
router.get("/tax", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.getTaxReport);
router.get("/profit-loss", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.getProfitAndLossReport);
router.get("/clients", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.getClientPerformanceReport);
router.get("/export/:type", authorize("OWNER", "ADMIN", "FINANCE", "SALES"), controller.exportReport);

export default router;
export { router as reportRoutes };
