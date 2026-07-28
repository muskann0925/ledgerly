import { Router } from "express";
import { invoiceController } from "./invoice.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * Invoice Management Endpoints
 */

// Invoice Dashboard Summary
router.get("/dashboard", authenticate, invoiceController.getDashboardSummary);

// Create Invoice
router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.createInvoice
);

// List Invoices (Paginated, Search, Filters, Sorting)
router.get("/", authenticate, invoiceController.getInvoices);

// Get Invoice PDF Document
router.get("/:id/pdf", authenticate, invoiceController.getPdf);

// Get Single Invoice Details
router.get("/:id", authenticate, invoiceController.getInvoiceById);

// Update Invoice
router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.updateInvoice
);

// Soft Delete Invoice
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  invoiceController.deleteInvoice
);

// Restore Soft Deleted Invoice
router.patch(
  "/:id/restore",
  authenticate,
  authorize("OWNER", "ADMIN"),
  invoiceController.restoreInvoice
);

// Duplicate Invoice
router.post(
  "/:id/duplicate",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.duplicateInvoice
);

// Update Invoice Status
router.patch(
  "/:id/status",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.updateStatus
);

// Mark Fully Paid
router.patch(
  "/:id/mark-paid",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE"),
  invoiceController.markPaid
);

// Mark Partial Payment
router.patch(
  "/:id/mark-partial",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE"),
  invoiceController.markPartial
);

// Email Invoice to Client
router.post(
  "/:id/email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.sendEmail
);
router.post(
  "/:id/send-email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.sendEmail
);

// Mark Invoice Viewed
router.post(
  "/:id/view",
  authenticate,
  invoiceController.markViewed
);

// Send Payment Reminder
router.post(
  "/:id/reminder",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  invoiceController.sendReminder
);

export default router;
