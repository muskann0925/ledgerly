import { prisma } from "../../lib/prisma";
import { VALID_ISSUED_STATUSES } from "../analytics/analytics.service";
import type { InvoiceStatus, Prisma, PaymentMethod } from "@prisma/client";
import type { InvoiceQueryParams } from "./invoice.types";
import type { AppliedTaxSnapshot } from "../../shared/utils/taxCalculator";

const parsePaymentMethod = (method?: string): PaymentMethod => {
  if (!method) return "OTHER";
  const upper = method.toUpperCase().replace(/\s+/g, "_");
  if (upper.includes("RAZORPAY") || upper.includes("CARD")) return "CREDIT_CARD";
  if (upper.includes("UPI") || upper.includes("GPAY") || upper.includes("PHONEPE")) return "UPI";
  if (upper.includes("BANK") || upper.includes("WIRE") || upper.includes("NEFT") || upper.includes("IMPS")) return "BANK_TRANSFER";
  if (upper.includes("CASH")) return "CASH";
  if (upper.includes("CHEQUE") || upper.includes("CHECK")) return "CHEQUE";
  return "OTHER";
};

import { sequenceService } from "../../shared/services/sequence.service";

export class InvoiceRepository {
  /**
   * Delegates to centralized SequenceService for guaranteed unique, sequential, concurrency-safe invoice numbers
   */
  async generateNextInvoiceNumber(tx?: Prisma.TransactionClient): Promise<string> {
    return sequenceService.generateNextNumber("INVOICE", tx);
  }

  /**
   * Create new invoice with line items inside a transaction
   */
  async create(data: {
    number: string;
    clientId: string;
    issueDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
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
    notes?: string;
    terms?: string;
    createdBy?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      lineAmount: number;
      appliedTaxes: AppliedTaxSnapshot[];
      discount: number;
      total: number;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      return tx.invoice.create({
        data: {
          number: data.number,
          clientId: data.clientId,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          status: data.status,
          currency: data.currency,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.totalAdditiveTax,
          totalAdditiveTax: data.totalAdditiveTax,
          totalDeductionTax: data.totalDeductionTax,
          grandTotal: data.grandTotal,
          netPayable: data.netPayable,
          total: data.total,
          amountPaid: data.amountPaid,
          balanceDue: data.balanceDue,
          notes: data.notes,
          terms: data.terms,
          createdBy: data.createdBy,
          items: {
            create: data.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineAmount: item.lineAmount,
              appliedTaxes: JSON.parse(JSON.stringify(item.appliedTaxes)),
              discount: item.discount,
              total: item.total,
            })),
          },
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
              state: true,
            },
          },
          items: true,
          payments: true,
        },
      });
    });
  }

  /**
   * Find single invoice by ID
   */
  async findById(id: string, includeDeleted: boolean = false) {
    return prisma.invoice.findFirst({
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
            state: true,
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Find single invoice by invoice number
   */
  async findByNumber(number: string) {
    return prisma.invoice.findUnique({
      where: { number },
      include: {
        client: true,
        items: true,
        payments: true,
      },
    });
  }

  /**
   * Find paginated invoices with search, filters, sorting
   */
  async findAll(params: InvoiceQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const isDeleted = params.isDeleted ?? false;

    const where: Prisma.InvoiceWhereInput = {
      isDeleted,
    };

    // Filter by Status
    if (params.status && params.status !== "ALL") {
      where.status = params.status as InvoiceStatus;
    }

    // Filter by Client ID
    if (params.clientId) {
      where.clientId = params.clientId;
    }

    // Filter by Issue Date range
    if (params.startDate || params.endDate) {
      where.issueDate = {};
      if (params.startDate) where.issueDate.gte = new Date(params.startDate);
      if (params.endDate) where.issueDate.lte = new Date(params.endDate);
    }

    // Filter by Due Date range
    if (params.dueStartDate || params.dueEndDate) {
      where.dueDate = {};
      if (params.dueStartDate) where.dueDate.gte = new Date(params.dueStartDate);
      if (params.dueEndDate) where.dueDate.lte = new Date(params.dueEndDate);
    }

    // Search query (number, client company, contact, notes)
    if (params.search) {
      const query = params.search.trim();
      where.OR = [
        { number: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        {
          client: {
            OR: [
              { companyName: { contains: query, mode: "insensitive" } },
              { contactPerson: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
              phone: true,
              state: true,
            },
          },
          items: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      invoices,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update invoice and replace line items inside transaction
   */
  async update(
    id: string,
    data: {
      clientId?: string;
      issueDate?: Date;
      dueDate?: Date;
      status?: InvoiceStatus;
      currency?: string;
      subtotal?: number;
      discount?: number;
      tax?: number;
      totalAdditiveTax?: number;
      totalDeductionTax?: number;
      grandTotal?: number;
      netPayable?: number;
      total?: number;
      amountPaid?: number;
      balanceDue?: number;
      notes?: string;
      terms?: string;
      items?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        lineAmount: number;
        appliedTaxes: AppliedTaxSnapshot[];
        discount: number;
        total: number;
      }>;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      return tx.invoice.update({
        where: { id },
        data: {
          ...(data.clientId && { clientId: data.clientId }),
          ...(data.issueDate && { issueDate: data.issueDate }),
          ...(data.dueDate && { dueDate: data.dueDate }),
          ...(data.status && { status: data.status }),
          ...(data.currency && { currency: data.currency }),
          ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
          ...(data.discount !== undefined && { discount: data.discount }),
          ...(data.tax !== undefined && { tax: data.tax }),
          ...(data.totalAdditiveTax !== undefined && { totalAdditiveTax: data.totalAdditiveTax }),
          ...(data.totalDeductionTax !== undefined && { totalDeductionTax: data.totalDeductionTax }),
          ...(data.grandTotal !== undefined && { grandTotal: data.grandTotal }),
          ...(data.netPayable !== undefined && { netPayable: data.netPayable }),
          ...(data.total !== undefined && { total: data.total }),
          ...(data.amountPaid !== undefined && { amountPaid: data.amountPaid }),
          ...(data.balanceDue !== undefined && { balanceDue: data.balanceDue }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.terms !== undefined && { terms: data.terms }),
          ...(data.items && {
            items: {
              create: data.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineAmount: item.lineAmount,
                appliedTaxes: JSON.parse(JSON.stringify(item.appliedTaxes)),
                discount: item.discount,
                total: item.total,
              })),
            },
          }),
        },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              email: true,
              state: true,
            },
          },
          items: true,
          payments: true,
        },
      });
    });
  }

  /**
   * Soft delete invoice
   */
  async softDelete(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore soft-deleted invoice
   */
  async restore(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        items: true,
      },
    });
  }

  /**
   * Create payment record & update invoice payment state
   */
  async addPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: string,
    newAmountPaid: number,
    newBalanceDue: number,
    newStatus: InvoiceStatus
  ) {
    const validMethod = parsePaymentMethod(paymentMethod);

    return prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod: validMethod,
        },
      });

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
        include: {
          client: true,
          items: true,
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });
  }

  /**
   * Dashboard Invoice Overview
   */
  async getDashboardSummary() {
    const [
      totalCount,
      issuedSummary,
      pendingSummary,
      overdueSummary,
      recentInvoices,
    ] = await Promise.all([
      prisma.invoice.count({ where: { isDeleted: false } }),
      prisma.invoice.aggregate({
        _sum: { netPayable: true, total: true },
        where: { status: { in: [...VALID_ISSUED_STATUSES] }, isDeleted: false },
      }),
      prisma.invoice.aggregate({
        _sum: { balanceDue: true },
        where: { status: { in: [...VALID_ISSUED_STATUSES] }, isDeleted: false },
      }),
      prisma.invoice.aggregate({
        _sum: { balanceDue: true },
        where: { status: "OVERDUE", isDeleted: false },
      }),
      prisma.invoice.findMany({
        where: { isDeleted: false },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: { companyName: true, contactPerson: true, email: true },
          },
        },
      }),
    ]);

    return {
      totalInvoices: totalCount,
      totalRevenue: issuedSummary._sum.netPayable ?? issuedSummary._sum.total ?? 0,
      outstandingAmount: pendingSummary._sum.balanceDue ?? 0,
      overdueAmount: overdueSummary._sum.balanceDue ?? 0,
      recentInvoices,
    };
  }
}

export const invoiceRepository = new InvoiceRepository();
