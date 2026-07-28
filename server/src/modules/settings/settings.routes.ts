import { Router } from "express";
import { settingsController } from "./settings.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

// Read settings (accessible to all authenticated staff members)
router.get("/", authenticate, settingsController.getSettings);

// Update Company Settings (OWNER, ADMIN)
router.put(
  "/company",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.updateCompany
);

// Update Invoice Preferences (OWNER, ADMIN)
router.put(
  "/invoice",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.updateInvoice
);

// Update Email Preferences (OWNER, ADMIN)
router.put(
  "/email",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.updateEmail
);

// Update Reminder Preferences (OWNER, ADMIN)
router.put(
  "/reminders",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.updateReminders
);

// Update Appearance Preferences (OWNER, ADMIN)
router.put(
  "/appearance",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.updateAppearance
);

// Reset Section Defaults (OWNER, ADMIN)
router.post(
  "/reset/:section",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.resetSection
);

// Send Test Email (OWNER, ADMIN)
router.post(
  "/test-email",
  authenticate,
  authorize("OWNER", "ADMIN"),
  settingsController.testEmail
);

export default router;
