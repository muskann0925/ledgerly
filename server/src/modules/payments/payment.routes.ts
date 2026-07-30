import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * Payment Management Endpoints
 */

// Create Payment
router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  paymentController.createPayment
);

// List Payments (Paginated, Search, Filters, Sorting)
router.get("/", authenticate, paymentController.getPayments);

// Get All Payments for an Invoice
router.get("/invoice/:invoiceId", authenticate, paymentController.getPaymentsByInvoiceId);

// Get Single Payment Details
router.get("/:id", authenticate, paymentController.getPaymentById);

// Get Payment Receipt PDF
router.get("/:id/pdf", authenticate, paymentController.getPdf);

// Update Payment
router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  paymentController.updatePayment
);

// Soft Delete Payment
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  paymentController.deletePayment
);

// Restore Soft-Deleted Payment
router.patch(
  "/:id/restore",
  authenticate,
  authorize("OWNER", "ADMIN"),
  paymentController.restorePayment
);

// Email Payment Receipt to Client
router.post(
  "/:id/email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  paymentController.sendEmail
);
router.post(
  "/:id/send-email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  paymentController.sendEmail
);

// Retry / Refresh Payment Status
router.post(
  "/:id/retry",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  paymentController.retryPayment
);

export default router;
