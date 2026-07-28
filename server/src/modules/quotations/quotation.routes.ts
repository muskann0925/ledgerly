import { Router } from "express";
import { quotationController } from "./quotation.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * Quotation Management Endpoints
 */

// Create Quotation
router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  quotationController.createQuotation
);

// List Quotations (Paginated, Search, Filters, Sorting)
router.get("/", authenticate, quotationController.getQuotations);

// Get Single Quotation Details
router.get("/:id", authenticate, quotationController.getQuotationById);

// Download Quotation PDF
router.get("/:id/pdf", authenticate, quotationController.downloadPdf);

// Update Quotation
router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  quotationController.updateQuotation
);

// Soft Delete Quotation
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  quotationController.deleteQuotation
);

// Restore Soft-Deleted Quotation
router.patch(
  "/:id/restore",
  authenticate,
  authorize("OWNER", "ADMIN"),
  quotationController.restoreQuotation
);

// Duplicate Quotation
router.post(
  "/:id/duplicate",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  quotationController.duplicateQuotation
);

// Approve Quotation
router.patch(
  "/:id/approve",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE"),
  quotationController.approveQuotation
);

// Reject Quotation
router.patch(
  "/:id/reject",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE"),
  quotationController.rejectQuotation
);

// Convert Quotation to Invoice
router.post(
  "/:id/convert",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  quotationController.convertToInvoice
);

// Email Quotation to Client
router.post(
  "/:id/email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  quotationController.sendEmail
);
router.post(
  "/:id/send-email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  quotationController.sendEmail
);

export default router;
