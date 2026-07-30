import { paymentRepository, PaymentRepository } from "./payment.repository";
import { invoiceRepository } from "../invoices/invoice.repository";
import { generatePaymentReceiptPdfBuffer } from "./payment.pdf";
import { AppError } from "../../utils/AppError";
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryOptions,
  PaginatedPaymentsResult,
  Payment,
} from "./payment.types";
import { NotificationType, InvoiceStatus } from "@prisma/client";
import { notificationService } from "../notifications/notification.service";
import { auditLogService } from "../audit-logs/audit-log.service";
import { emailService } from "../../shared/email.service";

export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository = paymentRepository
  ) { }

  /**
   * Recalculate invoice status and payment totals using stored netPayable / total
   */
  private calculateInvoiceStatusAndTotals(
    invoiceNetPayable: number,
    invoiceDueDate: Date,
    currentInvoiceStatus: InvoiceStatus,
    sumOfActivePayments: number
  ): { amountPaid: number; balanceDue: number; status: InvoiceStatus } {
    const amountPaid = Math.round(sumOfActivePayments * 100) / 100;
    const balanceDue = Math.max(0, Math.round((invoiceNetPayable - amountPaid) * 100) / 100);

    let status: InvoiceStatus;

    if (balanceDue <= 0 || amountPaid >= invoiceNetPayable) {
      status = "PAID";
    } else if (amountPaid > 0) {
      status = "PARTIALLY_PAID";
    } else {
      if (["PAID", "PARTIALLY_PAID"].includes(currentInvoiceStatus)) {
        status = new Date() > new Date(invoiceDueDate) ? "OVERDUE" : "SENT";
      } else if (
        new Date() > new Date(invoiceDueDate) &&
        ["PENDING", "SENT", "VIEWED"].includes(currentInvoiceStatus)
      ) {
        status = "OVERDUE";
      } else {
        status = currentInvoiceStatus;
      }
    }

    return { amountPaid, balanceDue, status };
  }

  /**
   * Create payment & update invoice status/amounts
   */
  async createPayment(
    data: CreatePaymentDto,
    createdBy?: string
  ): Promise<Payment> {
    const invoice = await invoiceRepository.findById(data.invoiceId);
    if (!invoice || invoice.isDeleted) {
      throw AppError.notFound("Invoice not found or deleted");
    }

    if (!invoice.client || (invoice.client as any).isDeleted) {
      throw AppError.badRequest("Associated client not found or deleted");
    }

    if (invoice.status === "CANCELLED" || invoice.status === "REFUNDED") {
      throw AppError.badRequest(
        `Cannot record payment for an invoice with status '${invoice.status}'`
      );
    }

    if (data.amount <= 0) {
      throw AppError.badRequest("Payment amount must be greater than 0");
    }

    const netPayable = invoice.netPayable || invoice.total;
    const currentActiveSum = await this.repository.calculateActivePaymentsSum(
      data.invoiceId
    );
    const remainingBalance =
      Math.round((netPayable - currentActiveSum) * 100) / 100;

    if (invoice.status === "PAID" || remainingBalance <= 0) {
      throw AppError.badRequest("Invoice is already fully paid");
    }

    if (data.amount > remainingBalance) {
      throw AppError.badRequest(
        `Payment amount (${data.amount}) cannot exceed remaining invoice balance due (${remainingBalance})`
      );
    }

    const newActiveSum = currentActiveSum + data.amount;
    const invoiceUpdate = this.calculateInvoiceStatusAndTotals(
      netPayable,
      invoice.dueDate,
      invoice.status,
      newActiveSum
    );

    const payment = await this.repository.createPaymentWithInvoiceUpdate(
      { ...data, createdBy },
      invoiceUpdate
    );

    const clientName = invoice.client?.companyName || invoice.client?.contactPerson || "Client";
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: invoice.currency || "INR",
    }).format(data.amount);

    await notificationService.notifyUsersForEvent(
      NotificationType.PAYMENT_RECEIVED,
      `Payment Received: ${formattedAmount}`,
      `Payment of ${formattedAmount} received for Invoice ${invoice.number} (${clientName}).`,
      "Payment",
      payment.id,
      {
        paymentId: payment.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        amount: data.amount,
        clientName,
      }
    );

    await auditLogService.logAction({
      userId: createdBy,
      action: "CREATE_PAYMENT",
      module: "PAYMENTS",
      entityType: "Payment",
      entityId: payment.id,
      entityName: invoice.number,
      description: `Recorded payment of ${invoice.currency} ${data.amount.toFixed(2)} for invoice #${invoice.number}`,
      newValue: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      },
      status: "SUCCESS",
    });

    return payment;
  }

  /**
   * Get single payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw AppError.notFound(`Payment with ID '${id}' not found`);
    }
    return payment;
  }

  /**
   * Get payments for a specific invoice
   */
  async getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice || invoice.isDeleted) {
      throw AppError.notFound("Invoice not found or deleted");
    }
    return this.repository.findByInvoiceId(invoiceId);
  }

  /**
   * Get paginated list of payments with search, filter & sort
   */
  async getPayments(
    options: PaymentQueryOptions
  ): Promise<PaginatedPaymentsResult<Payment>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));

    const { payments, total } = await this.repository.findAll(options);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update payment & recalculate invoice status/amounts
   */
  async updatePayment(
    id: string,
    data: UpdatePaymentDto
  ): Promise<Payment> {
    const existingPayment = await this.repository.findById(id);
    if (!existingPayment || existingPayment.isDeleted) {
      throw AppError.notFound(`Payment with ID '${id}' not found`);
    }

    const invoice = await invoiceRepository.findById(existingPayment.invoiceId);
    if (!invoice || invoice.isDeleted) {
      throw AppError.notFound("Associated invoice not found or deleted");
    }

    if (invoice.status === "CANCELLED" || invoice.status === "REFUNDED") {
      throw AppError.badRequest(
        `Cannot modify payment for an invoice with status '${invoice.status}'`
      );
    }

    const newAmount =
      data.amount !== undefined ? data.amount : existingPayment.amount;

    if (newAmount <= 0) {
      throw AppError.badRequest("Payment amount must be greater than 0");
    }

    const netPayable = invoice.netPayable || invoice.total;
    const otherPaymentsSum = await this.repository.calculateActivePaymentsSum(
      existingPayment.invoiceId,
      existingPayment.id
    );
    const remainingLimit =
      Math.round((netPayable - otherPaymentsSum) * 100) / 100;

    if (newAmount > remainingLimit) {
      throw AppError.badRequest(
        `Payment amount (${newAmount}) cannot exceed remaining invoice balance limit (${remainingLimit})`
      );
    }

    const proposedTotalSum = otherPaymentsSum + newAmount;
    const invoiceUpdate = this.calculateInvoiceStatusAndTotals(
      netPayable,
      invoice.dueDate,
      invoice.status,
      proposedTotalSum
    );

    return this.repository.updatePaymentWithInvoiceUpdate(
      id,
      data,
      existingPayment.invoiceId,
      invoiceUpdate
    );
  }

  /**
   * Soft delete payment & recalculate invoice status/amounts
   */
  async deletePayment(id: string): Promise<Payment> {
    const existingPayment = await this.repository.findById(id);
    if (!existingPayment || existingPayment.isDeleted) {
      throw AppError.notFound(`Payment with ID '${id}' not found`);
    }

    const invoice = await invoiceRepository.findById(existingPayment.invoiceId);
    if (!invoice) {
      throw AppError.notFound("Associated invoice not found");
    }

    const netPayable = invoice.netPayable || invoice.total;
    const remainingPaymentsSum =
      await this.repository.calculateActivePaymentsSum(
        existingPayment.invoiceId,
        existingPayment.id
      );

    const invoiceUpdate = this.calculateInvoiceStatusAndTotals(
      netPayable,
      invoice.dueDate,
      invoice.status,
      remainingPaymentsSum
    );

    return this.repository.softDeleteWithInvoiceUpdate(
      id,
      existingPayment.invoiceId,
      invoiceUpdate
    );
  }

  /**
   * Restore soft-deleted payment & recalculate invoice status/amounts
   */
  async restorePayment(id: string): Promise<Payment> {
    const existingPayment = await this.repository.findById(id, true);
    if (!existingPayment || !existingPayment.isDeleted) {
      throw AppError.notFound(
        `Soft-deleted payment with ID '${id}' not found`
      );
    }

    const invoice = await invoiceRepository.findById(existingPayment.invoiceId);
    if (!invoice || invoice.isDeleted) {
      throw AppError.notFound("Associated invoice not found or deleted");
    }

    if (invoice.status === "CANCELLED" || invoice.status === "REFUNDED") {
      throw AppError.badRequest(
        `Cannot restore payment for an invoice with status '${invoice.status}'`
      );
    }

    const netPayable = invoice.netPayable || invoice.total;
    const activePaymentsSum =
      await this.repository.calculateActivePaymentsSum(
        existingPayment.invoiceId
      );
    const proposedTotalSum = activePaymentsSum + existingPayment.amount;

    if (proposedTotalSum > netPayable) {
      throw AppError.badRequest(
        `Restoring this payment of ${existingPayment.amount} would exceed the net payable invoice amount (${netPayable})`
      );
    }

    const invoiceUpdate = this.calculateInvoiceStatusAndTotals(
      netPayable,
      invoice.dueDate,
      invoice.status,
      proposedTotalSum
    );

    return this.repository.restoreWithInvoiceUpdate(
      id,
      existingPayment.invoiceId,
      invoiceUpdate
    );
  }

  /**
   * Generate Payment Receipt PDF Buffer
   */
  async generatePdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const payment = await this.repository.findById(id);
    if (!payment || payment.isDeleted) {
      throw AppError.notFound(`Payment with ID '${id}' not found`);
    }

    const invoice = await invoiceRepository.findById(payment.invoiceId);
    if (!invoice) {
      throw AppError.notFound("Associated invoice not found");
    }

    const netPayable = invoice.netPayable || invoice.total;
    const activePaymentsSum = await this.repository.calculateActivePaymentsSum(payment.invoiceId);
    const remainingBalance = Math.max(0, Math.round((netPayable - activePaymentsSum) * 100) / 100);

    const receiptNumber = `REC-${payment.id.slice(-6).toUpperCase()}`;
    const pdfBuffer = await generatePaymentReceiptPdfBuffer({
      receiptNumber,
      paymentDate: payment.paymentDate,
      amountPaid: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.referenceNumber,
      invoiceNumber: invoice.number,
      remainingBalance,
      notes: payment.notes,
      client: {
        companyName: invoice.client.companyName,
        contactPerson: invoice.client.contactPerson,
        email: invoice.client.email,
        phone: invoice.client.phone,
      },
    });

    return {
      buffer: pdfBuffer,
      filename: `Receipt-${receiptNumber}.pdf`,
    };
  }

  /**
   * Send Payment Receipt via Email with PDF attachment
   */
  async sendPaymentReceiptEmail(
    id: string,
    payload: { recipientEmail?: string; subject?: string; message?: string },
    actorUserId?: string
  ) {
    const payment = await this.repository.findById(id);
    if (!payment || payment.isDeleted) {
      throw AppError.notFound(`Payment with ID '${id}' not found`);
    }

    const toEmail = payload.recipientEmail?.trim() || payment.invoice?.client?.email;

    if (!toEmail) {
      throw AppError.badRequest("Client does not have a valid email address.");
    }

    const { buffer: pdfBuffer } = await this.generatePdf(id);
    const receiptNum = payment.referenceNumber || payment.id.slice(-6).toUpperCase();

    await emailService.sendPaymentReceiptEmail(
      toEmail,
      payload.subject || `Payment Receipt #${receiptNum} from  Ledgerly`,
      payload.message || "",
      payment,
      pdfBuffer
    );

    if (actorUserId) {
      await notificationService.createNotification({
        userId: actorUserId,
        type: "PAYMENT_RECEIVED",
        title: "Payment Receipt Emailed",
        message: `Payment receipt #${receiptNum} emailed to ${toEmail}`,
        entityType: "Payment",
        entityId: payment.id,
      });
    }

    return {
      success: true,
      message: `Payment receipt #${receiptNum} successfully emailed to ${toEmail}`,
      payment,
    };
  }
}

export const paymentService = new PaymentService();
