import { prisma } from "../../lib/prisma";
import type { Prisma, QuotationStatus } from "@prisma/client";
import type {
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationQueryOptions,
} from "./quotation.types";
import { sequenceService } from "../../shared/services/sequence.service";

export interface QuotationCalculatedTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface CalculatedQuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

export class QuotationRepository {
  /**
   * Delegates to centralized SequenceService for guaranteed unique, sequential, concurrency-safe quotation numbers
   */
  async generateNextQuotationNumber(tx?: Prisma.TransactionClient): Promise<string> {
    return sequenceService.generateNextNumber("QUOTATION", tx);
  }

  /**
   * Find single quotation by ID with client & line items
   */
  async findById(id: string, includeDeleted: boolean = false) {
    return prisma.quotation.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true,
            gstNumber: true,
            panNumber: true,
            billingAddress: true,
            shippingAddress: true,
          },
        },
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * Find paginated list of quotations with search, filters & sorting
   */
  async findAll(options: QuotationQueryOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(
      1,
      Math.min(100, options.pageSize || options.limit || 10)
    );
    const skip = (page - 1) * limit;
    const isDeleted = options.isDeleted ?? false;

    const where: Prisma.QuotationWhereInput = {
      isDeleted,
    };

    // Filter by Status
    if (options.status && options.status !== "ALL") {
      where.status = options.status as QuotationStatus;
    }

    // Filter by Client ID
    if (options.clientId && options.clientId !== "ALL") {
      where.clientId = options.clientId;
    }

    // Filter by Expired Status
    if (options.isExpired) {
      where.expiryDate = { lt: new Date() };
    }

    // Filter by Issue Date Range
    if (options.startDate || options.endDate) {
      where.issueDate = {};
      if (options.startDate) where.issueDate.gte = new Date(options.startDate);
      if (options.endDate) where.issueDate.lte = new Date(options.endDate);
    }

    // Search Query (Quotation Number, Client Company Name, Status)
    if (options.search && options.search.trim() !== "") {
      const query = options.search.trim();
      where.OR = [
        { quotationNumber: { contains: query, mode: "insensitive" } },
        {
          client: {
            companyName: { contains: query, mode: "insensitive" },
          },
        },
      ];
    }

    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";

    const [quotations, total] = await prisma.$transaction([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              email: true,
            },
          },
          items: {
            select: { id: true, description: true, total: true },
          },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return { quotations, total, limit };
  }

  /**
   * Create new Quotation & line items in a transaction
   */
  async createQuotation(
    dto: CreateQuotationDto,
    totals: QuotationCalculatedTotals,
    calculatedItems: CalculatedQuotationItem[],
    createdBy?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const quotationNumber = await this.generateNextQuotationNumber(tx);

      return tx.quotation.create({
        data: {
          quotationNumber,
          clientId: dto.clientId,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
          expiryDate: new Date(dto.expiryDate),
          status: dto.status || "DRAFT",
          currency: dto.currency || "INR",
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
          notes: dto.notes || null,
          terms: dto.terms || null,
          createdBy: createdBy || null,
          isDeleted: false,
          items: {
            create: calculatedItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              discount: item.discount,
              total: item.total,
            })),
          },
        },
        include: {
          client: {
            select: { id: true, companyName: true, email: true },
          },
          items: true,
        },
      });
    });
  }

  /**
   * Update quotation & line items in a transaction
   */
  async updateQuotation(
    id: string,
    dto: UpdateQuotationDto,
    totals?: QuotationCalculatedTotals,
    calculatedItems?: CalculatedQuotationItem[]
  ) {
    return prisma.$transaction(async (tx) => {
      if (calculatedItems) {
        await tx.quotationItem.deleteMany({
          where: { quotationId: id },
        });
      }

      return tx.quotation.update({
        where: { id },
        data: {
          ...(dto.clientId && { clientId: dto.clientId }),
          ...(dto.issueDate && { issueDate: new Date(dto.issueDate) }),
          ...(dto.expiryDate && { expiryDate: new Date(dto.expiryDate) }),
          ...(dto.status && { status: dto.status }),
          ...(dto.currency && { currency: dto.currency }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.terms !== undefined && { terms: dto.terms }),
          ...(totals && {
            subtotal: totals.subtotal,
            discount: totals.discount,
            tax: totals.tax,
            total: totals.total,
          }),
          ...(calculatedItems && {
            items: {
              create: calculatedItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                discount: item.discount,
                total: item.total,
              })),
            },
          }),
        },
        include: {
          client: { select: { id: true, companyName: true, email: true } },
          items: true,
        },
      });
    });
  }

  /**
   * Soft delete quotation
   */
  async softDelete(id: string) {
    return prisma.quotation.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore soft-deleted quotation
   */
  async restore(id: string) {
    return prisma.quotation.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * Approve quotation
   */
  async approveQuotation(id: string, approvedBy?: string) {
    return prisma.quotation.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: approvedBy || "System User",
      },
      include: { client: true, items: true },
    });
  }

  /**
   * Reject quotation
   */
  async rejectQuotation(id: string, rejectionReason?: string) {
    return prisma.quotation.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || "Not specified",
      },
      include: { client: true, items: true },
    });
  }

  /**
   * Update quotation status
   */
  async updateStatus(id: string, status: QuotationStatus) {
    return prisma.quotation.update({
      where: { id },
      data: { status },
      include: { client: true, items: true },
    });
  }

  /**
   * Convert Quotation to Invoice in a single Prisma transaction
   */
  async convertToInvoiceTransaction(
    quotationId: string,
    invoiceData: {
      number: string;
      clientId: string;
      dueDate: Date;
      status: any;
      currency: string;
      subtotal: number;
      discount: number;
      tax: number;
      totalAdditiveTax: number;
      totalDeductionTax: number;
      grandTotal: number;
      netPayable: number;
      total: number;
      amountPaid: number;
      balanceDue: number;
      notes?: string | null;
      terms?: string | null;
      createdBy?: string | null;
    },
    itemsData: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      lineAmount: number;
      appliedTaxes: any;
      discount: number;
      total: number;
    }>
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Invoice & Items
      const createdInvoice = await tx.invoice.create({
        data: {
          number: invoiceData.number,
          clientId: invoiceData.clientId,
          issueDate: new Date(),
          dueDate: invoiceData.dueDate,
          status: invoiceData.status,
          currency: invoiceData.currency,
          subtotal: invoiceData.subtotal,
          discount: invoiceData.discount,
          tax: invoiceData.tax,
          totalAdditiveTax: invoiceData.totalAdditiveTax,
          totalDeductionTax: invoiceData.totalDeductionTax,
          grandTotal: invoiceData.grandTotal,
          netPayable: invoiceData.netPayable,
          total: invoiceData.total,
          amountPaid: invoiceData.amountPaid,
          balanceDue: invoiceData.balanceDue,
          notes: invoiceData.notes || null,
          terms: invoiceData.terms || null,
          createdBy: invoiceData.createdBy || null,
          isDeleted: false,
          items: {
            create: itemsData.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineAmount: item.lineAmount,
              appliedTaxes: item.appliedTaxes || [],
              discount: item.discount,
              total: item.total,
            })),
          },
        },
        include: {
          client: true,
          items: true,
        },
      });

      // 2. Update Quotation status & link convertedInvoiceId
      const updatedQuotation = await tx.quotation.update({
        where: { id: quotationId },
        data: {
          status: "CONVERTED",
          convertedInvoiceId: createdInvoice.id,
        },
        include: {
          client: true,
          items: true,
        },
      });

      return { invoice: createdInvoice, quotation: updatedQuotation };
    });
  }
}

export const quotationRepository = new QuotationRepository();
