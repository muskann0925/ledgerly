import { prisma } from "../../lib/prisma";
import type { Prisma, PaymentMethod } from "@prisma/client";
import { sequenceService } from "../../shared/services/sequence.service";
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryOptions,
} from "./payment.types";

export class PaymentRepository {
  /**
   * Find single payment by ID
   */
  async findById(id: string, includeDeleted: boolean = false) {
    return prisma.payment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            currency: true,
            total: true,
            amountPaid: true,
            balanceDue: true,
            dueDate: true,
            client: {
              select: {
                id: true,
                companyName: true,
                contactPerson: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find all non-deleted payments for an invoice
   */
  async findByInvoiceId(invoiceId: string) {
    return prisma.payment.findMany({
      where: {
        invoiceId,
        isDeleted: false,
      },
      orderBy: { paymentDate: "desc" },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            currency: true,
            total: true,
            amountPaid: true,
            balanceDue: true,
          },
        },
      },
    });
  }

  /**
   * Find paginated list of payments with search, filters & sorting
   */
  async findAll(options: PaymentQueryOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;
    const isDeleted = options.isDeleted ?? false;

    const where: Prisma.PaymentWhereInput = {
      isDeleted,
    };

    // Filter by Payment Method
    if (options.paymentMethod && options.paymentMethod !== "ALL") {
      where.paymentMethod = options.paymentMethod as PaymentMethod;
    }

    // Filter by Payment Status
    if (options.status && options.status !== "ALL") {
      where.status = options.status as any;
    }

    // Filter by Payment Date range
    if (options.startDate || options.endDate) {
      where.paymentDate = {};
      if (options.startDate) where.paymentDate.gte = new Date(options.startDate);
      if (options.endDate) where.paymentDate.lte = new Date(options.endDate);
    }

    // Search query (Invoice Number, Client Name, Reference Number)
    if (options.search && options.search.trim() !== "") {
      const query = options.search.trim();
      where.OR = [
        { referenceNumber: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        { failureReason: { contains: query, mode: "insensitive" } },
        {
          invoice: {
            OR: [
              { number: { contains: query, mode: "insensitive" } },
              {
                client: {
                  companyName: { contains: query, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ];
    }

    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              status: true,
              currency: true,
              total: true,
              client: {
                select: {
                  id: true,
                  companyName: true,
                  contactPerson: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  /**
   * Compute sum of active SUCCESS payments for an invoice inside a transaction client
   */
  async calculateActivePaymentsSum(
    invoiceId: string,
    excludePaymentId?: string,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || prisma;
    const aggregate = await client.payment.aggregate({
      _sum: { amount: true },
      where: {
        invoiceId,
        isDeleted: false,
        status: "SUCCESS",
        ...(excludePaymentId ? { id: { not: excludePaymentId } } : {}),
      },
    });

    return aggregate._sum.amount ?? 0;
  }

  /**
   * Create payment & update invoice in a single Prisma transaction
   */
  async createPaymentWithInvoiceUpdate(
    paymentData: CreatePaymentDto & { createdBy?: string },
    invoiceUpdate: { amountPaid: number; balanceDue: number; status: any }
  ) {
    return prisma.$transaction(async (tx) => {
      // Generate unique payment sequence number
      const paymentNumber = await sequenceService.generateNextNumber("PAYMENT", tx);
      const referenceNumber = paymentData.referenceNumber?.trim() || paymentNumber;
      const status = paymentData.status || "SUCCESS";

      const payment = await tx.payment.create({
        data: {
          invoiceId: paymentData.invoiceId,
          amount: paymentData.amount,
          paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
          paymentMethod: paymentData.paymentMethod,
          status,
          failureReason: paymentData.failureReason || null,
          referenceNumber,
          notes: paymentData.notes || null,
          createdBy: paymentData.createdBy || null,
          isDeleted: false,
        },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              status: true,
              currency: true,
              total: true,
              clientId: true,
              client: {
                select: { id: true, companyName: true, contactPerson: true },
              },
            },
          },
        },
      });

      await tx.invoice.update({
        where: { id: paymentData.invoiceId },
        data: {
          amountPaid: invoiceUpdate.amountPaid,
          balanceDue: invoiceUpdate.balanceDue,
          status: invoiceUpdate.status,
        },
      });

      if (payment.invoice?.clientId) {
        await tx.clientActivity.create({
          data: {
            clientId: payment.invoice.clientId,
            action: status === "SUCCESS" ? "PAYMENT_RECEIVED" : `PAYMENT_${status}`,
            description: status === "SUCCESS"
              ? `Recorded payment of ₹${paymentData.amount.toLocaleString("en-IN")} (Ref: ${referenceNumber}) for Invoice #${payment.invoice.number}`
              : `Payment attempt of ₹${paymentData.amount.toLocaleString("en-IN")} (${status}) for Invoice #${payment.invoice.number}`,
            performedBy: paymentData.createdBy || "System",
          },
        });
      }

      return payment;
    });
  }

  /**
   * Update payment & update invoice in a single Prisma transaction
   */
  async updatePaymentWithInvoiceUpdate(
    paymentId: string,
    paymentData: UpdatePaymentDto,
    invoiceId: string,
    invoiceUpdate: { amountPaid: number; balanceDue: number; status: any }
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          ...(paymentData.amount !== undefined && { amount: paymentData.amount }),
          ...(paymentData.paymentDate !== undefined && {
            paymentDate: new Date(paymentData.paymentDate),
          }),
          ...(paymentData.paymentMethod !== undefined && {
            paymentMethod: paymentData.paymentMethod,
          }),
          ...(paymentData.status !== undefined && {
            status: paymentData.status,
          }),
          ...(paymentData.failureReason !== undefined && {
            failureReason: paymentData.failureReason,
          }),
          ...(paymentData.referenceNumber !== undefined && {
            referenceNumber: paymentData.referenceNumber,
          }),
          ...(paymentData.notes !== undefined && { notes: paymentData.notes }),
        },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              status: true,
              currency: true,
              total: true,
              client: {
                select: { id: true, companyName: true },
              },
            },
          },
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: invoiceUpdate.amountPaid,
          balanceDue: invoiceUpdate.balanceDue,
          status: invoiceUpdate.status,
        },
      });

      return updatedPayment;
    });
  }

  /**
   * Soft delete payment & update invoice in a single Prisma transaction
   */
  async softDeleteWithInvoiceUpdate(
    paymentId: string,
    invoiceId: string,
    invoiceUpdate: { amountPaid: number; balanceDue: number; status: any }
  ) {
    return prisma.$transaction(async (tx) => {
      const deletedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: invoiceUpdate.amountPaid,
          balanceDue: invoiceUpdate.balanceDue,
          status: invoiceUpdate.status,
        },
      });

      return deletedPayment;
    });
  }

  /**
   * Restore soft-deleted payment & update invoice in a single Prisma transaction
   */
  async restoreWithInvoiceUpdate(
    paymentId: string,
    invoiceId: string,
    invoiceUpdate: { amountPaid: number; balanceDue: number; status: any }
  ) {
    return prisma.$transaction(async (tx) => {
      const restoredPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: invoiceUpdate.amountPaid,
          balanceDue: invoiceUpdate.balanceDue,
          status: invoiceUpdate.status,
        },
      });

      return restoredPayment;
    });
  }
}

export const paymentRepository = new PaymentRepository();
