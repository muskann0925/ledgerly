import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import {
  createUserSchema,
  updateUserSchema,
  changeRoleSchema,
  changeStatusSchema,
  toggle2FaSchema,
  resetPasswordSchema,
} from "./user.validator";
import { Role } from "@prisma/client";

export class UserController {
  /**
   * GET /users
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const role = req.query.role as Role;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
      const department = req.query.department as string;
      const sortBy = req.query.sortBy as any;
      const sortOrder = req.query.sortOrder as any;

      const result = await userService.getUsers({
        page,
        limit,
        search,
        role,
        isActive,
        department,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await userService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createUserSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      const actorRole = req.user?.role || "OWNER";

      const newUser = await userService.createUser(validated, actorUserId, actorRole);
      res.status(201).json({
        success: true,
        message: "User account created successfully",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = updateUserSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      const actorRole = req.user?.role || "OWNER";

      const updatedUser = await userService.updateUser(id, validated, actorRole, actorUserId);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id/role
   */
  async changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = changeRoleSchema.parse(req.body);
      const actorUserId = req.user?.userId || "";
      const actorRole = req.user?.role || "OWNER";

      const updatedUser = await userService.changeRole(
        id,
        validated.role,
        actorUserId,
        actorRole
      );

      res.status(200).json({
        success: true,
        message: `User role changed to ${validated.role}`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id/status
   */
  async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = changeStatusSchema.parse(req.body);
      const actorUserId = req.user?.userId || "";
      const actorRole = req.user?.role || "OWNER";

      const updatedUser = await userService.changeStatus(
        id,
        validated.isActive,
        actorUserId,
        actorRole
      );

      res.status(200).json({
        success: true,
        message: `User account ${validated.isActive ? "activated" : "deactivated"} successfully`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id/2fa
   */
  async toggle2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = toggle2FaSchema.parse(req.body);
      const actorUserId = req.user?.userId || "";
      const actorRole = req.user?.role || "OWNER";

      const updatedUser = await userService.toggle2FA(
        id,
        validated.twoFactorEnabled,
        actorUserId,
        actorRole
      );

      res.status(200).json({
        success: true,
        message: `Two-factor authentication ${validated.twoFactorEnabled ? "enabled" : "disabled"} successfully`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = resetPasswordSchema.parse(req.body);
      const actorRole = req.user?.role || "OWNER";

      const result = await userService.resetPassword(
        id,
        validated.newPassword,
        actorRole
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const actorUserId = req.user?.userId || "";
      const actorRole = req.user?.role || "OWNER";

      const result = await userService.deleteUser(id, actorUserId, actorRole);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
