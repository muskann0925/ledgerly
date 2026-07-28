import { TaxType, TaxValueType, TaxCalculationType } from "@prisma/client";

export interface CreateTaxInput {
  name: string;
  code: string;
  type?: TaxType;
  category?: string | null;
  valueType?: TaxValueType;
  calculationType?: TaxCalculationType;
  rate: number;
  country?: string | null;
  state?: string | null;
  description?: string | null;
  isDefault?: boolean;
  effectiveFrom?: string | Date | null;
  effectiveTo?: string | Date | null;
  applicableModules?: string[];
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
  effectiveFrom?: string | Date | null;
  effectiveTo?: string | Date | null;
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

export interface TaxItemInput {
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxIds?: string[];
}

export interface TaxCalculateInput {
  items?: TaxItemInput[];
  taxIds?: string[];
}

export interface IndividualTaxBreakdown {
  taxId?: string;
  name: string;
  code: string;
  type: string;
  rate: number;
  valueType: TaxValueType;
  calculationType: TaxCalculationType;
  amount: number;
}

export interface TaxCalculateResult {
  subtotal: number;
  totalAdditiveTax: number;
  totalDeductionTax: number;
  grandTotal: number;
  netPayable: number;
  individualTaxes: IndividualTaxBreakdown[];
}
