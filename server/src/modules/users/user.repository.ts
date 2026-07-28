import { prisma } from "../../lib/prisma";
import type { Prisma, Role } from "@prisma/client";
import type {
  CreateUserDto,
  UpdateUserDto,
  UserQueryOptions,
} from "./user.types";

export class UserRepository {
  /**
   * Create a new user in PostgreSQL
   */
  async create(data: CreateUserDto & { passwordHash: string; createdBy?: string }) {
    const { passwordHash, password, ...rest } = data;
    return prisma.user.create({
      data: {
        ...rest,
        password: passwordHash,
        role: data.role || "SALES",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        department: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        department: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find paginated list of users with search, role filter, status filter, department filter
   */
  async findAll(options: UserQueryOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (options.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
      ];
    }

    if (options.role) {
      where.role = options.role;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.department?.trim()) {
      where.department = { equals: options.department.trim(), mode: "insensitive" };
    }

    const orderByField = options.sortBy || "createdAt";
    const orderDirection = options.sortOrder || "desc";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderDirection },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          role: true,
          department: true,
          isActive: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          emailVerified: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update user details
   */
  async update(id: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        department: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        department: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update active/inactive status
   */
  async updateStatus(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        department: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update 2FA status
   */
  async update2FA(id: string, twoFactorEnabled: boolean) {
    return prisma.user.update({
      where: { id },
      data: { twoFactorEnabled },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        role: true,
        department: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update password hash
   */
  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { password: passwordHash },
      select: { id: true },
    });
  }

  /**
   * Delete user by ID
   */
  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Count active users with role OWNER
   */
  async countActiveOwners(): Promise<number> {
    return prisma.user.count({
      where: {
        role: "OWNER",
        isActive: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
