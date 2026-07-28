import { userRepository } from "./user.repository";
import type {
  CreateUserDto,
  UpdateUserDto,
  UserQueryOptions,
} from "./user.types";
import { AppError } from "../../utils/AppError";
import { hashPassword } from "../../utils/password";
import { Role } from "@prisma/client";
import { auditLogService } from "../audit-logs/audit-log.service";
import { emailService } from "../../shared/email.service";

export class UserService {
  /**
   * Create new user account with hashed password
   */
  async createUser(data: CreateUserDto, actorUserId?: string, actorRole: Role = "OWNER") {
    // Permission check: Only OWNER can assign OWNER role
    if (data.role === "OWNER" && actorRole !== "OWNER") {
      throw AppError.forbidden("Only an Owner can create or assign the OWNER role");
    }

    const existing = await userRepository.findByEmail(data.email.toLowerCase().trim());
    if (existing) {
      throw AppError.badRequest(`A user with email '${data.email}' already exists`);
    }

    const passwordHash = await hashPassword(data.password);

    const newUser = await userRepository.create({
      ...data,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      createdBy: actorUserId,
    });

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "CREATE_USER",
      module: "USERS",
      entityType: "User",
      entityId: newUser.id,
      entityName: newUser.name,
      description: `Created new user account '${newUser.name}' (${newUser.email}) with role ${newUser.role}`,
      newValue: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        isActive: newUser.isActive,
      },
      status: "SUCCESS",
    });

    return newUser;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }
    return user;
  }

  /**
   * Get paginated users list with search & filters
   */
  async getUsers(options: UserQueryOptions) {
    return userRepository.findAll(options);
  }

  /**
   * Update user details
   */
  async updateUser(id: string, data: UpdateUserDto, actorRole: Role = "OWNER", actorUserId?: string) {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }

    // Protection rule: Only OWNER can modify an OWNER account
    if (targetUser.role === "OWNER" && actorRole !== "OWNER") {
      throw AppError.forbidden("Only an Owner can modify an Owner account");
    }

    // Validate email uniqueness if changing email
    if (data.email && data.email.toLowerCase().trim() !== targetUser.email) {
      const existingEmail = await userRepository.findByEmail(data.email.toLowerCase().trim());
      if (existingEmail) {
        throw AppError.badRequest(`Email '${data.email}' is already in use`);
      }
      data.email = data.email.toLowerCase().trim();
    }

    const updatedUser = await userRepository.update(id, data);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "UPDATE_USER",
      module: "USERS",
      entityType: "User",
      entityId: updatedUser.id,
      entityName: updatedUser.name,
      description: `Updated profile details for user '${updatedUser.name}'`,
      oldValue: {
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        department: targetUser.department,
        isActive: targetUser.isActive,
      },
      newValue: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        department: updatedUser.department,
        isActive: updatedUser.isActive,
      },
      status: "SUCCESS",
    });

    return updatedUser;
  }

  /**
   * Change user role
   */
  async changeRole(id: string, newRole: Role, actorUserId: string, actorRole: Role = "OWNER") {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }

    // Protection: Non-Owner cannot change an Owner's role or grant Owner role
    if ((targetUser.role === "OWNER" || newRole === "OWNER") && actorRole !== "OWNER") {
      throw AppError.forbidden("Only an Owner can modify or grant the OWNER role");
    }

    // Prevent demoting the last active owner
    if (targetUser.role === "OWNER" && newRole !== "OWNER") {
      const ownerCount = await userRepository.countActiveOwners();
      if (ownerCount <= 1) {
        throw AppError.badRequest("Cannot demote the last active Owner account");
      }
    }

    const updated = await userRepository.updateRole(id, newRole);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "CHANGE_USER_ROLE",
      module: "USERS",
      entityType: "User",
      entityId: updated.id,
      entityName: updated.name,
      description: `Changed role of user '${updated.name}' from ${targetUser.role} to ${newRole}`,
      oldValue: { role: targetUser.role },
      newValue: { role: newRole },
      status: "SUCCESS",
    });

    return updated;
  }

  /**
   * Change active/inactive status
   */
  async changeStatus(id: string, isActive: boolean, actorUserId: string, actorRole: Role = "OWNER") {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }

    // Protection: Non-Owner cannot deactivate an Owner account
    if (targetUser.role === "OWNER" && actorRole !== "OWNER") {
      throw AppError.forbidden("Only an Owner can change the status of an Owner account");
    }

    // Prevent self-deactivation
    if (id === actorUserId && !isActive) {
      throw AppError.badRequest("You cannot deactivate your own active account");
    }

    // Prevent deactivating the last active owner
    if (targetUser.role === "OWNER" && !isActive) {
      const ownerCount = await userRepository.countActiveOwners();
      if (ownerCount <= 1) {
        throw AppError.badRequest("Cannot deactivate the last active Owner account");
      }
    }

    const updated = await userRepository.updateStatus(id, isActive);
    const actionName = isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER";

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: actionName,
      module: "USERS",
      entityType: "User",
      entityId: updated.id,
      entityName: updated.name,
      description: `User account '${updated.name}' set to ${isActive ? "ACTIVE" : "INACTIVE"}`,
      oldValue: { isActive: targetUser.isActive },
      newValue: { isActive: updated.isActive },
      status: "SUCCESS",
    });

    return updated;
  }

  /**
   * Toggle Two-Factor Authentication (2FA) status
   */
  async toggle2FA(id: string, twoFactorEnabled: boolean, actorUserId?: string, actorRole: Role = "OWNER") {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }

    if (targetUser.role === "OWNER" && actorRole !== "OWNER" && id !== actorUserId) {
      throw AppError.forbidden("Only an Owner can modify 2FA settings for an Owner account");
    }

    const updated = await userRepository.update2FA(id, twoFactorEnabled);

    try {
      await emailService.send2FaStatusEmail(updated.email, twoFactorEnabled);
    } catch (err) {
      console.error("[UserService] Failed to send 2FA status email:", err);
    }

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "TOGGLE_USER_2FA",
      module: "USERS",
      entityType: "User",
      entityId: updated.id,
      entityName: updated.name,
      description: `Two-Factor Authentication for user '${updated.name}' set to ${twoFactorEnabled ? "ENABLED" : "DISABLED"}`,
      oldValue: { twoFactorEnabled: targetUser.twoFactorEnabled },
      newValue: { twoFactorEnabled: updated.twoFactorEnabled },
      status: "SUCCESS",
    });

    return updated;
  }

  /**
   * Reset user password
   */
  async resetPassword(id: string, newPassword: string, actorRole: Role = "OWNER", actorUserId?: string) {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }

    if (targetUser.role === "OWNER" && actorRole !== "OWNER") {
      throw AppError.forbidden("Only an Owner can reset an Owner's password");
    }

    const passwordHash = await hashPassword(newPassword);

    await userRepository.updatePassword(id, passwordHash);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "RESET_USER_PASSWORD",
      module: "USERS",
      entityType: "User",
      entityId: targetUser.id,
      entityName: targetUser.name,
      description: `Reset account password for user '${targetUser.name}' (${targetUser.email})`,
      status: "SUCCESS",
    });

    return { success: true, message: "User password updated successfully" };
  }

  /**
   * Delete user account
   */
  async deleteUser(id: string, actorUserId: string, actorRole: Role = "OWNER") {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw AppError.notFound(`User with ID '${id}' not found`);
    }

    // Protection: Cannot delete self
    if (id === actorUserId) {
      throw AppError.badRequest("You cannot delete your own account");
    }

    // Protection: Only OWNER can delete an account, and non-Owner cannot delete Owner
    if (actorRole !== "OWNER") {
      throw AppError.forbidden("Only an Owner can delete user accounts");
    }

    if (targetUser.role === "OWNER") {
      const ownerCount = await userRepository.countActiveOwners();
      if (ownerCount <= 1) {
        throw AppError.badRequest("Cannot delete the last active Owner account");
      }
    }

    await userRepository.delete(id);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "DELETE_USER",
      module: "USERS",
      entityType: "User",
      entityId: id,
      entityName: targetUser.name,
      description: `Deleted user account '${targetUser.name}' (${targetUser.email})`,
      oldValue: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      status: "SUCCESS",
    });

    return { success: true, message: "User account deleted successfully" };
  }
}

export const userService = new UserService();
