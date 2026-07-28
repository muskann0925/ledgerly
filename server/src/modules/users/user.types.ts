import { Role } from "@prisma/client";

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  profileImage?: string | null;
  role?: Role;
  department?: string | null;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string | null;
  profileImage?: string | null;
  department?: string | null;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface ChangeUserRoleDto {
  role: Role;
}

export interface ChangeUserStatusDto {
  isActive: boolean;
}

export interface ResetUserPasswordDto {
  newPassword: string;
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  department?: string;
  sortBy?: "name" | "email" | "role" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  role: Role;
  department?: string | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date | null;
  emailVerified: boolean;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
