import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseQueryOptions,
  PaginatedResult,
} from "./expense.types";

import { sequenceService } from "../../shared/services/sequence.service";

export class ExpenseRepository {
  /**
   * Delegates to centralized SequenceService for guaranteed unique, sequential, concurrency-safe expense numbers
   */
  async generateNextExpenseNumber(tx?: Prisma.TransactionClient): Promise<string> {
    return sequenceService.generateNextNumber("EXPENSE", tx);
  }

  /**
   * Find single expense by ID with relations and audit logs
   */
  async findById(id: string, includeDeleted = false) {
    return prisma.expense.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gstNumber: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Find duplicate expense with same reference number or title for vendor on date
   */
  async findDuplicate(
    vendorId: string | undefined,
    referenceNumber: string | undefined,
    title: string,
    expenseDate: Date,
    excludeId?: string
  ) {
    if (!referenceNumber && !vendorId) return null;

    const startOfDay = new Date(expenseDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(expenseDate);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.expense.findFirst({
      where: {
        isDeleted: false,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          ...(referenceNumber
            ? [{ referenceNumber: { equals: referenceNumber, mode: "insensitive" as const } }]
            : []),
          ...(vendorId
            ? [
                {
                  vendorId,
                  title: { equals: title, mode: "insensitive" as const },
                  expenseDate: { gte: startOfDay, lte: endOfDay },
                },
              ]
            : []),
        ],
      },
    });
  }

  /**
   * Paginated find with filters, search, and sorting
   */
  async findAll(options: ExpenseQueryOptions): Promise<PaginatedResult<any>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {
      ...(options.includeDeleted ? {} : { isDeleted: false }),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.vendorId ? { vendorId: options.vendorId } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.paymentMethod ? { paymentMethod: options.paymentMethod } : {}),
      ...(options.minAmount || options.maxAmount
        ? {
            totalAmount: {
              ...(options.minAmount !== undefined ? { gte: options.minAmount } : {}),
              ...(options.maxAmount !== undefined ? { lte: options.maxAmount } : {}),
            },
          }
        : {}),
      ...(options.startDate || options.endDate
        ? {
            expenseDate: {
              ...(options.startDate ? { gte: new Date(options.startDate) } : {}),
              ...(options.endDate ? { lte: new Date(options.endDate) } : {}),
            },
          }
        : {}),
      ...(options.search
        ? {
            OR: [
              { title: { contains: options.search, mode: "insensitive" } },
              { expenseNumber: { contains: options.search, mode: "insensitive" } },
              { referenceNumber: { contains: options.search, mode: "insensitive" } },
              { notes: { contains: options.search, mode: "insensitive" } },
              { category: { name: { contains: options.search, mode: "insensitive" } } },
              { vendor: { name: { contains: options.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const sortBy = options.sortBy || "expenseDate";
    const sortOrder = options.sortOrder || "desc";

    const [total, data] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const startRecord = total === 0 ? 0 : skip + 1;
    const endRecord = Math.min(skip + limit, total);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        startRecord,
        endRecord,
      },
    };
  }

  /**
   * Create expense record with audit log in Prisma transaction
   */
  async create(
    expenseData: {
      expenseNumber: string;
      title: string;
      categoryId: string;
      vendorId?: string | null;
      amount: number;
      taxRate: number;
      taxAmount: number;
      isTaxInclusive: boolean;
      totalAmount: number;
      paymentMethod: any;
      status: any;
      expenseDate: Date;
      dueDate?: Date | null;
      paidAt?: Date | null;
      referenceNumber?: string | null;
      notes?: string | null;
      receiptUrl?: string | null;
      receiptPublicId?: string | null;
      receiptOriginalName?: string | null;
      receiptMimeType?: string | null;
      receiptSize?: number | null;
      createdBy?: string | null;
    },
    performedBy?: string,
    userRole?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: expenseData,
        include: {
          category: { select: { id: true, name: true, color: true } },
          vendor: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId: expense.id,
          action: "CREATED",
          details: `Expense ${expense.expenseNumber} created with total amount ${expense.totalAmount}`,
          performedBy: performedBy || "System",
          userRole: userRole || "ADMIN",
        },
      });

      return expense;
    });
  }

  /**
   * Update expense record with audit log in Prisma transaction
   */
  async update(
    id: string,
    data: Prisma.ExpenseUpdateInput,
    actionName: string,
    details: string,
    performedBy?: string,
    userRole?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data,
        include: {
          category: { select: { id: true, name: true, color: true } },
          vendor: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId: id,
          action: actionName,
          details,
          performedBy: performedBy || "System",
          userRole: userRole || "ADMIN",
        },
      });

      return updatedExpense;
    });
  }

  /**
   * Soft delete expense
   */
  async softDelete(id: string, performedBy?: string, userRole?: string) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.expense.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId: id,
          action: "DELETED",
          details: `Expense ${deleted.expenseNumber} was soft-deleted`,
          performedBy: performedBy || "System",
          userRole: userRole || "ADMIN",
        },
      });

      return deleted;
    });
  }

  /**
   * Restore soft-deleted expense
   */
  async restore(id: string, performedBy?: string, userRole?: string) {
    return prisma.$transaction(async (tx) => {
      const restored = await tx.expense.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });

      await tx.expenseAuditLog.create({
        data: {
          expenseId: id,
          action: "RESTORED",
          details: `Expense ${restored.expenseNumber} was restored`,
          performedBy: performedBy || "System",
          userRole: userRole || "ADMIN",
        },
      });

      return restored;
    });
  }
}
