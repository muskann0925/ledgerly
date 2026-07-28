import { Router } from "express";
import { ExpenseController } from "./expense.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { receiptUpload } from "../../middlewares/upload";

const router = Router();
const controller = new ExpenseController();

// All expense routes require authentication
router.use(authenticate);

// ==========================================
// Reports & Dashboard APIs
// ==========================================
router.get("/reports/total", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getReportsTotal);
router.get("/reports/by-category", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getReportsByCategory);
router.get("/reports/by-vendor", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getReportsByVendor);
router.get("/reports/monthly-trend", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getReportsMonthlyTrend);
router.get("/reports/tax-summary", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getReportsTaxSummary);
router.get("/reports/date-range", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getReportsDateRange);
router.get("/reports/dashboard", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getDashboardSummary);

// ==========================================
// Category Routes
// ==========================================
router.get("/categories", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getAllCategories);
router.get("/categories/:id", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getCategoryById);
router.post("/categories", authorize("OWNER", "ADMIN", "FINANCE"), controller.createCategory);
router.put("/categories/:id", authorize("OWNER", "ADMIN", "FINANCE"), controller.updateCategory);
router.delete("/categories/:id", authorize("OWNER", "ADMIN"), controller.deleteCategory);
router.patch("/categories/:id/restore", authorize("OWNER", "ADMIN"), controller.restoreCategory);

// ==========================================
// Vendor Routes
// ==========================================
router.get("/vendors", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getAllVendors);
router.get("/vendors/:id", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getVendorById);
router.post("/vendors", authorize("OWNER", "ADMIN", "FINANCE"), controller.createVendor);
router.put("/vendors/:id", authorize("OWNER", "ADMIN", "FINANCE"), controller.updateVendor);
router.delete("/vendors/:id", authorize("OWNER", "ADMIN"), controller.deleteVendor);
router.patch("/vendors/:id/restore", authorize("OWNER", "ADMIN"), controller.restoreVendor);

// ==========================================
// Expense Routes
// ==========================================
router.get("/", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getAllExpenses);
router.get("/:id", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.getExpenseById);
router.post(
  "/",
  authorize("OWNER", "ADMIN", "FINANCE", "SALES"),
  receiptUpload.single("receipt"),
  controller.createExpense
);
router.put(
  "/:id",
  authorize("OWNER", "ADMIN", "FINANCE"),
  receiptUpload.single("receipt"),
  controller.updateExpense
);
router.patch(
  "/:id/status",
  authorize("OWNER", "ADMIN", "FINANCE"),
  controller.updateExpenseStatus
);
router.delete("/:id", authorize("OWNER", "ADMIN"), controller.deleteExpense);
router.patch("/:id/restore", authorize("OWNER", "ADMIN"), controller.restoreExpense);
router.delete("/:id/receipt", authorize("OWNER", "ADMIN", "FINANCE"), controller.removeReceipt);
router.get("/:id/receipt/view", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.viewReceipt);
router.get("/:id/receipt/download", authorize("OWNER", "ADMIN", "FINANCE", "SALES", "VIEWER"), controller.downloadReceipt);

export default router;
export { router as expenseRoutes };
