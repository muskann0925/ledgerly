export type UserRole = "OWNER" | "ADMIN" | "SALES" | "FINANCE" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  role: UserRole;
  department?: string | null;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
  emailVerified: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersApiResponse {
  success: boolean;
  data: User[];
  pagination: UserPagination;
}

export interface SingleUserApiResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  profileImage?: string | null;
  role?: UserRole;
  department?: string | null;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  profileImage?: string | null;
  department?: string | null;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UserQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  department?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
