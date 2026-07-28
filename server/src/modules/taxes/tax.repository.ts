import { prisma } from "../../lib/prisma";
import { Tax, Prisma } from "@prisma/client";
import { CreateTaxInput, UpdateTaxInput, TaxQueryFilters } from "./tax.types";

export class TaxRepository {
  async create(data: CreateTaxInput, createdBy?: string): Promise<Tax> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.tax.updateMany({
          where: { isDefault: true, isDeleted: false },
          data: { isDefault: false },
        });
      }

      const tax = await tx.tax.create({
        data: {
          name: data.name,
          code: data.code,
          type: data.type,
          category: data.category,
          valueType: data.valueType,
          calculationType: data.calculationType,
          rate: data.rate,
          country: data.country ?? "India",
          state: data.state,
          description: data.description,
          isDefault: data.isDefault ?? false,
          effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : null,
          effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
          applicableModules: data.applicableModules ?? ["INVOICE", "QUOTATION", "EXPENSE", "CREDIT_NOTE"],
          createdBy,
          updatedBy: createdBy,
        },
      });

      await tx.taxAuditLog.create({
        data: {
          taxId: tax.id,
          action: "CREATE",
          details: `Created tax '${tax.name}' (${tax.code}) with rate ${tax.rate} [${tax.calculationType}]`,
          performedBy: createdBy,
        },
      });

      return tax;
    });
  }

  async update(id: string, data: UpdateTaxInput, updatedBy?: string): Promise<Tax> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.tax.updateMany({
          where: { id: { not: id }, isDefault: true, isDeleted: false },
          data: { isDefault: false },
        });
      }

      const updatedTax = await tx.tax.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.code && { code: data.code }),
          ...(data.type && { type: data.type }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.valueType && { valueType: data.valueType }),
          ...(data.calculationType && { calculationType: data.calculationType }),
          ...(data.rate !== undefined && { rate: data.rate }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          ...(data.effectiveFrom !== undefined && { effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : null }),
          ...(data.effectiveTo !== undefined && { effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null }),
          ...(data.applicableModules && { applicableModules: data.applicableModules }),
          updatedBy,
        },
      });

      await tx.taxAuditLog.create({
        data: {
          taxId: id,
          action: "UPDATE",
          details: `Updated tax details: ${JSON.stringify(data)}`,
          performedBy: updatedBy,
        },
      });

      return updatedTax;
    });
  }

  async findById(id: string): Promise<Tax | null> {
    return prisma.tax.findFirst({
      where: { id, isDeleted: false },
      include: {
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  }

  async findByCode(code: string): Promise<Tax | null> {
    return prisma.tax.findFirst({
      where: {
        code: { equals: code, mode: "insensitive" },
        isDeleted: false,
      },
    });
  }

  async findAll(filters: TaxQueryFilters) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      calculationType,
      isActive,
      module,
      country,
      state,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TaxWhereInput = {
      isDeleted: false,
      ...(type && { type }),
      ...(calculationType && { calculationType }),
      ...(isActive !== undefined && { isActive }),
      ...(country && { country: { equals: country, mode: "insensitive" } }),
      ...(state && { state: { equals: state, mode: "insensitive" } }),
      ...(module && {
        applicableModules: {
          has: module.toUpperCase(),
        },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [taxes, total] = await Promise.all([
      prisma.tax.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.tax.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      taxes,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findActiveTaxes(): Promise<Tax[]> {
    return prisma.tax.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: { name: "asc" },
    });
  }

  async toggleStatus(id: string, isActive: boolean, updatedBy?: string): Promise<Tax> {
    return prisma.$transaction(async (tx) => {
      const tax = await tx.tax.update({
        where: { id },
        data: { isActive, updatedBy },
      });

      await tx.taxAuditLog.create({
        data: {
          taxId: id,
          action: "STATUS_CHANGE",
          details: `Tax status changed to ${isActive ? "ACTIVE" : "INACTIVE"}`,
          performedBy: updatedBy,
        },
      });

      return tax;
    });
  }

  async softDelete(id: string, deletedBy?: string): Promise<Tax> {
    return prisma.$transaction(async (tx) => {
      const tax = await tx.tax.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: deletedBy,
        },
      });

      await tx.taxAuditLog.create({
        data: {
          taxId: id,
          action: "DELETE",
          details: `Soft deleted tax '${tax.name}' (${tax.code})`,
          performedBy: deletedBy,
        },
      });

      return tax;
    });
  }

  async findTaxesByIds(ids: string[]): Promise<Tax[]> {
    return prisma.tax.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
      },
    });
  }
}
