import { TaxRepository } from "./tax.repository";
import { AppError } from "../../utils/AppError";
import {
  CreateTaxInput,
  UpdateTaxInput,
  TaxQueryFilters,
  TaxCalculateInput,
} from "./tax.types";
import { calculateInvoiceTaxes, TaxDefinition } from "../../shared/utils/taxCalculator";
import { auditLogService } from "../audit-logs/audit-log.service";

export class TaxService {
  private repository: TaxRepository;

  constructor() {
    this.repository = new TaxRepository();
  }

  async createTax(data: CreateTaxInput, userId?: string) {
    const existingCode = await this.repository.findByCode(data.code);
    if (existingCode) {
      throw AppError.badRequest(`Tax with code '${data.code}' already exists`);
    }

    const newTax = await this.repository.create(data, userId);

    await auditLogService.logAction({
      userId,
      action: "CREATE_TAX",
      module: "TAXES",
      entityType: "Tax",
      entityId: newTax.id,
      entityName: newTax.name,
      description: `Created tax rate '${newTax.name}' (${newTax.code}) at ${newTax.rate}%`,
      newValue: {
        code: newTax.code,
        name: newTax.name,
        rate: newTax.rate,
        type: newTax.type,
        isDefault: newTax.isDefault,
      },
      status: "SUCCESS",
    });

    return newTax;
  }

  async updateTax(id: string, data: UpdateTaxInput, userId?: string) {
    const existingTax = await this.repository.findById(id);
    if (!existingTax) {
      throw AppError.notFound("Tax rate not found");
    }

    if (data.code && data.code.toUpperCase() !== existingTax.code.toUpperCase()) {
      const duplicateCode = await this.repository.findByCode(data.code);
      if (duplicateCode) {
        throw AppError.badRequest(`Tax with code '${data.code}' already exists`);
      }
    }

    const updated = await this.repository.update(id, data, userId);
    const isSettingDefault = data.isDefault && !existingTax.isDefault;
    const actionName = isSettingDefault ? "SET_DEFAULT_TAX" : "UPDATE_TAX";

    await auditLogService.logAction({
      userId,
      action: actionName,
      module: "TAXES",
      entityType: "Tax",
      entityId: updated.id,
      entityName: updated.name,
      description: isSettingDefault
        ? `Set '${updated.name}' (${updated.rate}%) as the system default tax`
        : `Updated tax rate '${updated.name}' (${updated.code})`,
      oldValue: {
        name: existingTax.name,
        rate: existingTax.rate,
        isActive: existingTax.isActive,
        isDefault: existingTax.isDefault,
      },
      newValue: {
        name: updated.name,
        rate: updated.rate,
        isActive: updated.isActive,
        isDefault: updated.isDefault,
      },
      status: "SUCCESS",
    });

    return updated;
  }

  async getTaxById(id: string) {
    const tax = await this.repository.findById(id);
    if (!tax) {
      throw AppError.notFound("Tax rate not found");
    }
    return tax;
  }

  async getAllTaxes(filters: TaxQueryFilters) {
    return this.repository.findAll(filters);
  }

  async getActiveTaxes() {
    return this.repository.findActiveTaxes();
  }

  async toggleTaxStatus(id: string, isActive: boolean, userId?: string) {
    const tax = await this.repository.findById(id);
    if (!tax) {
      throw AppError.notFound("Tax rate not found");
    }
    const updated = await this.repository.toggleStatus(id, isActive, userId);

    await auditLogService.logAction({
      userId,
      action: isActive ? "ACTIVATE_TAX" : "DEACTIVATE_TAX",
      module: "TAXES",
      entityType: "Tax",
      entityId: updated.id,
      entityName: updated.name,
      description: `Set tax rate '${updated.name}' to ${isActive ? "ACTIVE" : "INACTIVE"}`,
      oldValue: { isActive: tax.isActive },
      newValue: { isActive: updated.isActive },
      status: "SUCCESS",
    });

    return updated;
  }

  async softDeleteTax(id: string, userId?: string) {
    const tax = await this.repository.findById(id);
    if (!tax) {
      throw AppError.notFound("Tax rate not found");
    }
    const deleted = await this.repository.softDelete(id, userId);

    await auditLogService.logAction({
      userId,
      action: "DELETE_TAX",
      module: "TAXES",
      entityType: "Tax",
      entityId: tax.id,
      entityName: tax.name,
      description: `Deleted tax rate '${tax.name}' (${tax.code})`,
      oldValue: { code: tax.code, name: tax.name, rate: tax.rate },
      status: "SUCCESS",
    });

    return deleted;
  }

  /**
   * Centralized, reusable tax calculation calculation based on Tax engine.
   */
  async calculateTaxes(params: TaxCalculateInput) {
    const { items = [], taxIds = [] } = params;

    // Collect all tax IDs
    const allTaxIds = new Set<string>(taxIds);
    items.forEach((i) => {
      if (i.taxIds) i.taxIds.forEach((id) => allTaxIds.add(id));
    });

    const dbTaxes = await this.repository.findTaxesByIds(Array.from(allTaxIds));
    const taxMap = new Map<string, TaxDefinition>();

    dbTaxes.forEach((t) => {
      taxMap.set(t.id, {
        id: t.id,
        name: t.name,
        code: t.code,
        type: t.type,
        category: t.category,
        rate: t.rate,
        valueType: t.valueType,
        calculationType: t.calculationType,
        country: t.country,
        state: t.state,
        isActive: t.isActive,
      });
    });

    const lineItemsInput = items.map((i) => ({
      description: i.description || "",
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      taxIds: i.taxIds || taxIds,
    }));

    return calculateInvoiceTaxes(lineItemsInput, taxMap);
  }
}
