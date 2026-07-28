import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

// Require authentication for all user endpoints
router.use(authenticate);

// GET /users - Restricted to OWNER, ADMIN
router.get("/", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.getUsers(req, res, next)
);

// GET /users/:id - Restricted to OWNER, ADMIN
router.get("/:id", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.getUserById(req, res, next)
);

// POST /users - Create user (OWNER, ADMIN)
router.post("/", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.createUser(req, res, next)
);

// PUT /users/:id - Update user (OWNER, ADMIN)
router.put("/:id", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.updateUser(req, res, next)
);

// PATCH /users/:id/role - Change role (OWNER, ADMIN)
router.patch("/:id/role", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.changeRole(req, res, next)
);

// PATCH /users/:id/status - Toggle active/inactive status (OWNER, ADMIN)
router.patch("/:id/status", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.changeStatus(req, res, next)
);

// PATCH /users/:id/2fa - Toggle 2FA status (Authenticated users for own account, or OWNER/ADMIN)
router.patch("/:id/2fa", (req, res, next) =>
  userController.toggle2FA(req, res, next)
);

// PATCH /users/:id/reset-password - Reset password (OWNER, ADMIN)
router.patch("/:id/reset-password", authorize("OWNER", "ADMIN"), (req, res, next) =>
  userController.resetPassword(req, res, next)
);

// DELETE /users/:id - Delete user (OWNER only)
router.delete("/:id", authorize("OWNER"), (req, res, next) =>
  userController.deleteUser(req, res, next)
);

export default router;
