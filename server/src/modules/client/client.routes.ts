import { Router } from "express";
import { clientController } from "./client.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * Client Management Endpoints
 */

// Create client
router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES"),
  clientController.createClient
);

// List clients (with pagination, search, status filter, sorting)
router.get("/", authenticate, clientController.getClients);

// Get single client by ID
router.get("/:id", authenticate, clientController.getClientById);

// Get client statement PDF
router.get(
  "/:id/statement/pdf",
  authenticate,
  authorize("OWNER", "ADMIN", "FINANCE", "SALES"),
  clientController.getStatementPdf
);

// Update client
router.patch(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES"),
  clientController.updateClient
);

// Soft delete client
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  clientController.deleteClient
);

// Restore soft deleted client
router.patch(
  "/:id/restore",
  authenticate,
  authorize("OWNER", "ADMIN"),
  clientController.restoreClient
);

// Email Client Statement / Message
router.post(
  "/:id/email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  clientController.sendEmail
);
router.post(
  "/:id/send-email",
  authenticate,
  authorize("OWNER", "ADMIN", "SALES", "FINANCE"),
  clientController.sendEmail
);

export default router;
