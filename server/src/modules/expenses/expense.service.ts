import { ExpenseRepository } from "./expense.repository";
import { CategoryRepository } from "./category.repository";
import { VendorRepository } from "./vendor.repository";
import { AppError } from "../../utils/AppError";
import { saveLocalFile, deleteLocalFile, getLocalFilePath } from "../../utils/localStorage";
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  UpdateExpenseStatusDto,
  ExpenseQueryOptions,
} from "./expense.types";
import { ExpenseStatus } from "@prisma/client";
import { auditLogService } from "../audit-logs/audit-log.service";

export class ExpenseService {
  private expenseRepo: ExpenseRepository;
  private categoryRepo: CategoryRepository;
  private vendorRepo: VendorRepository;

  constructor() {
    this.expenseRepo = new ExpenseRepository();
    this.categoryRepo = new CategoryRepository();
    this.vendorRepo = new VendorRepository();
  }

  /**
   * Calculate tax and total amounts based on inclusive/exclusive settings
   */
  public calculateTaxes(amount: number, taxRate: number = 0, isTaxInclusive: boolean = false) {
    const rate = Math.max(0, taxRate);
    const base = Math.max(0, amount);

    let taxAmount = 0;
    let totalAmount = base;

    if (rate > 0) {
      if (isTaxInclusive) {
        totalAmount = base;
        taxAmount = base - base / (1 + rate / 100);
      } else {
        taxAmount = base * (rate / 100);
        totalAmount = base + taxAmount;
      }
    }

    return {
      amount: Math.round(base * 100) / 100,
      taxRate: Math.round(rate * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      isTaxInclusive,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  async getExpenseById(id: string, includeDeleted = false) {
    const expense = await this.expenseRepo.findById(id, includeDeleted);
    if (!expense) {
      throw AppError.notFound(`Expense with ID '${id}' not found`);
    }
    return expense;
  }

  async getAllExpenses(options: ExpenseQueryOptions) {
    return this.expenseRepo.findAll(options);
  }

  async createExpense(
    data: CreateExpenseDto,
    fileBuffer?: Buffer,
    fileOriginalName?: string,
    fileMimeType?: string,
    fileSize?: number,
    performedBy?: string,
    userRole?: string
  ) {
    // 1. Verify Category exists
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category) {
      throw AppError.badRequest(`Expense category with ID '${data.categoryId}' not found`);
    }

    // 2. Verify Vendor if provided
    if (data.vendorId) {
      const vendor = await this.vendorRepo.findById(data.vendorId);
      if (!vendor) {
        throw AppError.badRequest(`Vendor with ID '${data.vendorId}' not found`);
      }
    }

    // 3. Duplicate Prevention Check
    const expenseDateObj = data.expenseDate ? new Date(data.expenseDate) : new Date();
    const duplicate = await this.expenseRepo.findDuplicate(
      data.vendorId || undefined,
      data.referenceNumber || undefined,
      data.title,
      expenseDateObj
    );

    if (duplicate) {
      throw AppError.conflict(
        `A potential duplicate expense already exists with reference number '${duplicate.referenceNumber}' or same title/vendor on this date.`
      );
    }

    // 4. Tax Calculation
    const taxCalc = this.calculateTaxes(
      data.amount,
      data.taxRate || 0,
      data.isTaxInclusive || false
    );

    // 5. Local File Upload if receipt buffer provided
    let receiptUrl: string | undefined;
    let receiptPublicId: string | undefined;

    if (fileBuffer) {
      const uploadRes = await saveLocalFile(
        fileBuffer,
        fileOriginalName || "receipt"
      );
      receiptPublicId = uploadRes.filename;
    }

    // 6. Generate Expense Number
    const expenseNumber = await this.expenseRepo.generateNextExpenseNumber();

    const status = data.status || ExpenseStatus.PENDING;
    const paidAt = status === ExpenseStatus.PAID ? new Date() : null;

    const newExpense = await this.expenseRepo.create(
      {
        expenseNumber,
        title: data.title,
        categoryId: data.categoryId,
        vendorId: data.vendorId || null,
        amount: taxCalc.amount,
        taxRate: taxCalc.taxRate,
        taxAmount: taxCalc.taxAmount,
        isTaxInclusive: taxCalc.isTaxInclusive,
        totalAmount: taxCalc.totalAmount,
        paymentMethod: data.paymentMethod || "CASH",
        status,
        expenseDate: expenseDateObj,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paidAt,
        referenceNumber: data.referenceNumber || null,
        notes: data.notes || null,
        receiptUrl: receiptPublicId ? `/expenses/${expenseNumber}/receipt/view` : null,
        receiptPublicId: receiptPublicId || null,
        receiptOriginalName: fileOriginalName || null,
        receiptMimeType: fileMimeType || null,
        receiptSize: fileSize || null,
        createdBy: performedBy || null,
      },
      performedBy,
      userRole
    );

    await auditLogService.logAction({
      userId: performedBy,
      role: userRole,
      action: "CREATE_EXPENSE",
      module: "EXPENSES",
      entityType: "Expense",
      entityId: newExpense.id,
      entityName: newExpense.title,
      description: `Created expense record '${newExpense.title}' (#${newExpense.expenseNumber}) for amount ${newExpense.totalAmount.toFixed(2)}`,
      newValue: {
        expenseNumber: newExpense.expenseNumber,
        title: newExpense.title,
        amount: newExpense.amount,
        totalAmount: newExpense.totalAmount,
        status: newExpense.status,
      },
      status: "SUCCESS",
    });

    return newExpense;
  }

  async updateExpense(
    id: string,
    data: UpdateExpenseDto,
    fileBuffer?: Buffer,
    fileOriginalName?: string,
    fileMimeType?: string,
    fileSize?: number,
    performedBy?: string,
    userRole?: string
  ) {
    const existing = await this.getExpenseById(id);

    // Category check
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw AppError.badRequest(`Category with ID '${data.categoryId}' not found`);
      }
    }

    // Vendor check
    if (data.vendorId && data.vendorId !== existing.vendorId) {
      const vendor = await this.vendorRepo.findById(data.vendorId);
      if (!vendor) {
        throw AppError.badRequest(`Vendor with ID '${data.vendorId}' not found`);
      }
    }

    // Duplicate check if reference number or title/vendor updated
    if (data.referenceNumber || data.title || data.vendorId) {
      const titleToCheck = data.title || existing.title;
      const vendorToCheck = data.vendorId !== undefined ? (data.vendorId || undefined) : (existing.vendorId || undefined);
      const refToCheck = data.referenceNumber !== undefined ? (data.referenceNumber || undefined) : (existing.referenceNumber || undefined);
      const dateToCheck = data.expenseDate ? new Date(data.expenseDate) : existing.expenseDate;

      const duplicate = await this.expenseRepo.findDuplicate(
        vendorToCheck,
        refToCheck,
        titleToCheck,
        dateToCheck,
        id
      );

      if (duplicate) {
        throw AppError.conflict(
          `Another expense already exists with reference number '${duplicate.referenceNumber}' or title/vendor.`
        );
      }
    }

    // Recalculate taxes if amount, taxRate, or isTaxInclusive changed
    const amountToUse = data.amount !== undefined ? data.amount : existing.amount;
    const rateToUse = data.taxRate !== undefined ? data.taxRate : existing.taxRate;
    const incToUse = data.isTaxInclusive !== undefined ? data.isTaxInclusive : existing.isTaxInclusive;

    const taxCalc = this.calculateTaxes(amountToUse, rateToUse, incToUse);

    // Local file upload if new file buffer provided
    let receiptUrl = existing.receiptUrl;
    let receiptPublicId = existing.receiptPublicId;
    let receiptOriginalName = existing.receiptOriginalName;
    let receiptMimeType = existing.receiptMimeType;
    let receiptSize = existing.receiptSize;

    if (fileBuffer) {
      // Delete old local file if existed
      if (existing.receiptPublicId) {
        await deleteLocalFile(existing.receiptPublicId);
      }

      const uploadRes = await saveLocalFile(
        fileBuffer,
        fileOriginalName || "receipt"
      );
      receiptPublicId = uploadRes.filename;
      receiptUrl = `/expenses/${id}/receipt/view`;
      receiptOriginalName = fileOriginalName || null;
      receiptMimeType = fileMimeType || null;
      receiptSize = fileSize || null;
    }

    const updatedData: any = {
      ...(data.title ? { title: data.title } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.vendorId !== undefined ? { vendorId: data.vendorId } : {}),
      amount: taxCalc.amount,
      taxRate: taxCalc.taxRate,
      taxAmount: taxCalc.taxAmount,
      isTaxInclusive: taxCalc.isTaxInclusive,
      totalAmount: taxCalc.totalAmount,
      ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.expenseDate ? { expenseDate: new Date(data.expenseDate) } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
        : {}),
      ...(data.paidAt !== undefined
        ? { paidAt: data.paidAt ? new Date(data.paidAt) : null }
        : {}),
      ...(data.referenceNumber !== undefined ? { referenceNumber: data.referenceNumber } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      receiptUrl,
      receiptPublicId,
      receiptOriginalName,
      receiptMimeType,
      receiptSize,
    };

    if (data.status === ExpenseStatus.PAID && !existing.paidAt && !data.paidAt) {
      updatedData.paidAt = new Date();
    }

    return this.expenseRepo.update(
      id,
      updatedData,
      "UPDATED",
      `Expense details updated. New total amount: ${taxCalc.totalAmount}`,
      performedBy,
      userRole
    );
  }

  async updateExpenseStatus(
    id: string,
    dto: UpdateExpenseStatusDto,
    performedBy?: string,
    userRole?: string
  ) {
    const existing = await this.getExpenseById(id);

    const paidAt =
      dto.status === ExpenseStatus.PAID
        ? dto.paidAt
          ? new Date(dto.paidAt)
          : new Date()
        : null;

    return this.expenseRepo.update(
      id,
      {
        status: dto.status,
        paidAt,
      },
      "STATUS_CHANGED",
      `Expense status changed from ${existing.status} to ${dto.status}`,
      performedBy,
      userRole
    );
  }

  async deleteExpense(id: string, performedBy?: string, userRole?: string) {
    await this.getExpenseById(id);
    return this.expenseRepo.softDelete(id, performedBy, userRole);
  }

  async restoreExpense(id: string, performedBy?: string, userRole?: string) {
    await this.getExpenseById(id, true);
    return this.expenseRepo.restore(id, performedBy, userRole);
  }

  async removeReceipt(id: string, performedBy?: string, userRole?: string) {
    const existing = await this.getExpenseById(id);

    if (!existing.receiptPublicId && !existing.receiptUrl) {
      throw AppError.badRequest("Expense does not have an attached receipt");
    }

    if (existing.receiptPublicId) {
      await deleteLocalFile(existing.receiptPublicId);
    }

    return this.expenseRepo.update(
      id,
      {
        receiptUrl: null,
        receiptPublicId: null,
        receiptOriginalName: null,
        receiptMimeType: null,
        receiptSize: null,
      },
      "RECEIPT_REMOVED",
      "Receipt attachment was removed from expense",
      performedBy,
      userRole
    );
  }

  /**
   * Retrieves local file path and metadata for authorized streaming / downloading
   */
  async getReceiptFile(id: string) {
    const expense = await this.getExpenseById(id);
    if (!expense.receiptPublicId) {
      throw AppError.notFound("No receipt file attached to this expense");
    }

    const fullPath = getLocalFilePath(expense.receiptPublicId);
    return {
      fullPath,
      mimeType: expense.receiptMimeType || "application/octet-stream",
      originalName: expense.receiptOriginalName || expense.receiptPublicId,
    };
  }
}
