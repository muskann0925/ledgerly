export type TaxType = "GST" | "CGST" | "SGST" | "IGST" | "TDS" | "VAT" | "CUSTOM";
export type TaxValueType = "PERCENTAGE" | "FIXED";
export type TaxCalculationType = "ADD" | "DEDUCT";

export interface TaxAuditLog {
  id: string;
  taxId: string;
  action: string;
  details: string;
  performedBy?: string | null;
  userRole?: string | null;
  createdAt: string;
}

export interface Tax {
  id: string;
  name: string;
  code: string;
  type: TaxType;
  category?: string | null;
  valueType: TaxValueType;
  calculationType: TaxCalculationType;
  rate: number;
  country?: string | null;
  state?: string | null;
  description?: string | null;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  applicableModules: string[];
  createdBy?: string | null;
  updatedBy?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  auditLogs?: TaxAuditLog[];
}

export interface CreateTaxInput {
  name: string;
  code: string;
  type: TaxType;
  category?: string | null;
  valueType: TaxValueType;
  calculationType: TaxCalculationType;
  rate: number;
  country?: string | null;
  state?: string | null;
  description?: string;
  isDefault?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  applicableModules: string[];
}

export interface UpdateTaxInput {
  name?: string;
  code?: string;
  type?: TaxType;
  category?: string | null;
  valueType?: TaxValueType;
  calculationType?: TaxCalculationType;
  rate?: number;
  country?: string | null;
  state?: string | null;
  description?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  applicableModules?: string[];
}

export interface TaxQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: TaxType;
  calculationType?: TaxCalculationType;
  isActive?: boolean;
  module?: string;
  country?: string;
  state?: string;
  sortBy?: "name" | "code" | "rate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TaxListResponse {
  taxes: Tax[];
  pagination: PaginationMeta;
}
