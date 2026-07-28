import { invoiceRepository, InvoiceRepository } from "./invoice.repository";
import { clientRepository } from "../client/client.repository";
import { TaxRepository } from "../taxes/tax.repository";
import { generateInvoicePdfBuffer } from "./invoice.pdf";
import type {
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceQueryParams,
  InvoiceItemPayload,
  MarkPaidPayload,
  MarkPartialPayload,
} from "./invoice.types";
import { InvoiceStatus, NotificationType } from "@prisma/client";
import { notificationService } from "../notifications/notification.service";
import { emailService } from "../../shared/email.service";
import { AppError } from "../../utils/AppError";
import {
  calculateInvoiceTaxes,
  TaxDefinition,
  AppliedTaxSnapshot,
} from "../../shared/utils/taxCalculator";

import { auditLogService } from "../audit-logs/audit-log.service";

export class InvoiceService {
  private taxRepository: TaxRepository;

  constructor(
    private readonly repository: InvoiceRepository = invoiceRepository
  ) {
    this.taxRepository = new TaxRepository();
  }

  /**
   * Status transition state machine validator
   */
  private validateStatusTransition(currentStatus: InvoiceStatus, newStatus: InvoiceStatus) {
    if (currentStatus === newStatus) return;

    const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      DRAFT: ["PENDING", "SENT", "CANCELLED"],
      PENDING: ["SENT", "VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      SENT: ["VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      VIEWED: ["PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      PARTIALLY_PAID: ["PAID", "OVERDUE", "REFUNDED", "CANCELLED"],
      PAID: ["REFUNDED"],
      OVERDUE: ["PARTIALLY_PAID", "PAID", "CANCELLED"],
      CANCELLED: ["DRAFT"],
      REFUNDED: [],
    };

    const validNextStates = allowedTransitions[currentStatus] || [];
    if (!validNextStates.includes(newStatus)) {
      throw AppError.badRequest(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Pure server-side financial calculations powered by the Tax Module.
   */
  private async calculateInvoiceFinancials(items: InvoiceItemPayload[]) {
    // Collect all tax IDs referenced in items
    const allTaxIds = new Set<string>();
    items.forEach((item) => {
      if (item.taxIds) {
        item.taxIds.forEach((id) => allTaxIds.add(id));
      }
    });

    // Fetch active taxes from DB
    const dbTaxes = await this.taxRepository.findTaxesByIds(Array.from(allTaxIds));
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

    const calculationInput = items.map((i) => ({
      description: i.description.trim(),
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      taxIds: i.taxIds,
    }));

    const result = calculateInvoiceTaxes(calculationInput, taxMap);

    return {
      calculatedItems: result.items,
      totals: {
        subtotal: result.subtotal,
        totalAdditiveTax: result.totalAdditiveTax,
        totalDeductionTax: result.totalDeductionTax,
        grandTotal: result.grandTotal,
        netPayable: result.netPayable,
        total: result.netPayable,
        balanceDue: result.netPayable,
      },
    };
  }

  /**
   * Create invoice with server-side tax validation & calculations
   */
  async createInvoice(payload: CreateInvoicePayload, createdBy?: string) {
    // 1. Verify Client existence
    const client = await clientRepository.findById(payload.clientId);
    if (!client || client.isDeleted) {
      const err = new Error("Client not found or deactivated") as any;
      err.statusCode = 404;
      throw err;
    }

    // 2. Generate sequential unique invoice number
    const number = await this.repository.generateNextInvoiceNumber();

    // 3. Compute calculations using Tax Module
    const { calculatedItems, totals } = await this.calculateInvoiceFinancials(payload.items);

    const issueDate = payload.issueDate ? new Date(payload.issueDate) : new Date();
    const dueDate = new Date(payload.dueDate);

    const status: InvoiceStatus = "DRAFT";

    const newInvoice = await this.repository.create({
      number,
      clientId: payload.clientId,
      issueDate,
      dueDate,
      status,
      currency: payload.currency || "INR",
      subtotal: totals.subtotal,
      discount: 0,
      tax: totals.totalAdditiveTax,
      totalAdditiveTax: totals.totalAdditiveTax,
      totalDeductionTax: totals.totalDeductionTax,
      grandTotal: totals.grandTotal,
      netPayable: totals.netPayable,
      total: totals.netPayable,
      amountPaid: 0,
      balanceDue: totals.netPayable,
      notes: payload.notes,
      terms: payload.terms,
      createdBy,
      items: calculatedItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineAmount: item.lineAmount,
        appliedTaxes: item.appliedTaxes,
        discount: 0,
        total: item.lineAmount,
      })),
    });

    await auditLogService.logAction({
      userId: createdBy,
      action: "CREATE_INVOICE",
      module: "INVOICES",
      entityType: "Invoice",
      entityId: newInvoice.id,
      entityName: newInvoice.number,
      description: `Created invoice #${newInvoice.number} for client '${client.companyName}' with total ${newInvoice.currency} ${newInvoice.netPayable.toFixed(2)}`,
      newValue: {
        number: newInvoice.number,
        clientId: newInvoice.clientId,
        netPayable: newInvoice.netPayable,
        status: newInvoice.status,
      },
      status: "SUCCESS",
    });

    return newInvoice;
  }

  /**
   * Get list of invoices with pagination & search
   */
  async getInvoices(params: InvoiceQueryParams) {
    return this.repository.findAll(params);
  }

  /**
   * Get single invoice by ID
   */
  async getInvoiceById(id: string) {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }

    // Automatic overdue status check if due date passed
    if (
      new Date() > new Date(invoice.dueDate) &&
      ["PENDING", "SENT", "VIEWED"].includes(invoice.status)
    ) {
      return this.repository.updateStatus(id, "OVERDUE");
    }

    return invoice;
  }

  /**
   * Update invoice details and recalculate totals
   */
  async updateInvoice(id: string, payload: UpdateInvoicePayload) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }

    if (["PAID", "REFUNDED"].includes(existing.status)) {
      const err = new Error(`Cannot modify invoice with status ${existing.status}`) as any;
      err.statusCode = 400;
      throw err;
    }

    let calculatedItems;
    let totals;

    if (payload.items) {
      const result = await this.calculateInvoiceFinancials(payload.items);
      calculatedItems = result.calculatedItems;
      totals = result.totals;
    }

    const newNetPayable = totals ? totals.netPayable : (existing.netPayable || existing.total);
    const newAmountPaid = existing.amountPaid;
    const newBalanceDue = Math.max(0, Math.round((newNetPayable - newAmountPaid) * 100) / 100);

    return this.repository.update(id, {
      clientId: payload.clientId,
      issueDate: payload.issueDate ? new Date(payload.issueDate) : undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      currency: payload.currency,
      notes: payload.notes,
      terms: payload.terms,
      ...(totals && {
        subtotal: totals.subtotal,
        discount: 0,
        tax: totals.totalAdditiveTax,
        totalAdditiveTax: totals.totalAdditiveTax,
        totalDeductionTax: totals.totalDeductionTax,
        grandTotal: totals.grandTotal,
        netPayable: totals.netPayable,
        total: totals.netPayable,
        balanceDue: newBalanceDue,
      }),
      items: calculatedItems
        ? calculatedItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineAmount: item.lineAmount,
          appliedTaxes: item.appliedTaxes,
          discount: 0,
          total: item.lineAmount,
        }))
        : undefined,
    });
  }

  /**
   * Soft delete invoice
   */
  async deleteInvoice(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return this.repository.softDelete(id);
  }

  /**
   * Restore soft deleted invoice
   */
  async restoreInvoice(id: string) {
    const existing = await this.repository.findById(id, true);
    if (!existing) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return this.repository.restore(id);
  }

  /**
   * Duplicate invoice as a new DRAFT
   */
  async duplicateInvoice(id: string, createdBy?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err = new Error("Source invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const number = await this.repository.generateNextInvoiceNumber();
    const issueDate = new Date();
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return this.repository.create({
      number,
      clientId: existing.clientId,
      issueDate,
      dueDate,
      status: "DRAFT",
      currency: existing.currency,
      subtotal: existing.subtotal,
      discount: existing.discount,
      tax: existing.totalAdditiveTax || existing.tax,
      totalAdditiveTax: existing.totalAdditiveTax || existing.tax,
      totalDeductionTax: existing.totalDeductionTax || 0,
      grandTotal: existing.grandTotal || existing.total,
      netPayable: existing.netPayable || existing.total,
      total: existing.netPayable || existing.total,
      amountPaid: 0,
      balanceDue: existing.netPayable || existing.total,
      notes: existing.notes || undefined,
      terms: existing.terms || undefined,
      createdBy,
      items: existing.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineAmount: item.lineAmount || item.quantity * item.unitPrice,
        appliedTaxes: (item.appliedTaxes as unknown as AppliedTaxSnapshot[]) || [],
        discount: item.discount,
        total: item.total,
      })),
    });
  }

  /**
   * Update invoice status with transition validation
   */
  async updateStatus(id: string, newStatus: InvoiceStatus) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }

    this.validateStatusTransition(existing.status, newStatus);
    const updated = await this.repository.updateStatus(id, newStatus);

    const clientName = existing.client?.companyName || existing.client?.contactPerson || "Client";

    if (newStatus === "SENT") {
      await notificationService.notifyUsersForEvent(
        NotificationType.INVOICE_SENT,
        `Invoice Sent: ${existing.number}`,
        `Invoice ${existing.number} sent to ${clientName} (${existing.client?.email}).`,
        "Invoice",
        existing.id,
        { invoiceId: existing.id, invoiceNumber: existing.number, clientName, email: existing.client?.email }
      );
    } else if (newStatus === "VIEWED") {
      await notificationService.notifyUsersForEvent(
        NotificationType.INVOICE_VIEWED,
        `Invoice Viewed: ${existing.number}`,
        `${clientName} has viewed invoice ${existing.number}.`,
        "Invoice",
        existing.id,
        { invoiceId: existing.id, invoiceNumber: existing.number, clientName }
      );
    }

    return updated;
  }

  /**
   * Mark invoice viewed by client and create INVOICE_VIEWED notification
   */
  async markInvoiceViewed(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }

    if (["SENT", "PENDING"].includes(existing.status)) {
      await this.repository.updateStatus(id, "VIEWED");
    }

    const clientName = existing.client?.companyName || existing.client?.contactPerson || "Client";

    await notificationService.notifyUsersForEvent(
      NotificationType.INVOICE_VIEWED,
      `Invoice Viewed: ${existing.number}`,
      `${clientName} viewed invoice ${existing.number}.`,
      "Invoice",
      existing.id,
      { invoiceId: existing.id, invoiceNumber: existing.number, clientName }
    );

    return { message: `Invoice ${existing.number} marked as viewed.` };
  }

  /**
   * Mark invoice full payment
   */
  async markPaid(id: string, payload: MarkPaidPayload) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw AppError.notFound("Invoice not found");
    }

    if (existing.status === "PAID" || existing.balanceDue <= 0) {
      throw AppError.badRequest("Invoice is already fully paid");
    }

    const paymentAmount = existing.balanceDue;
    const newAmountPaid = existing.netPayable || existing.total;
    const newBalanceDue = 0;

    return this.repository.addPayment(
      id,
      paymentAmount,
      payload.paymentMethod || "OTHER",
      newAmountPaid,
      newBalanceDue,
      "PAID"
    );
  }

  /**
   * Mark partial payment
   */
  async markPartial(id: string, payload: MarkPartialPayload) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw AppError.notFound("Invoice not found");
    }

    if (payload.amount <= 0) {
      throw AppError.badRequest("Payment amount must be greater than 0");
    }

    if (payload.amount > existing.balanceDue) {
      throw AppError.badRequest(
        `Payment amount (${payload.amount}) cannot exceed balance due (${existing.balanceDue})`
      );
    }

    const newAmountPaid = Math.round((existing.amountPaid + payload.amount) * 100) / 100;
    const netPayable = existing.netPayable || existing.total;
    const newBalanceDue = Math.round((netPayable - newAmountPaid) * 100) / 100;
    const newStatus: InvoiceStatus = newBalanceDue <= 0 ? "PAID" : "PARTIALLY_PAID";

    return this.repository.addPayment(
      id,
      payload.amount,
      payload.paymentMethod || "OTHER",
      newAmountPaid,
      newBalanceDue,
      newStatus
    );
  }

  /**
   * Generate Invoice PDF document Buffer
   */
  async generatePdf(id: string) {
    const invoice = await this.repository.findById(id);
    if (!invoice || invoice.isDeleted) {
      const err = new Error("Invoice not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const buffer = await generateInvoicePdfBuffer({
      number: invoice.number,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      totalAdditiveTax: invoice.totalAdditiveTax || invoice.tax,
      totalDeductionTax: invoice.totalDeductionTax || 0,
      grandTotal: invoice.grandTotal || invoice.total,
      netPayable: invoice.netPayable || invoice.total,
      total: invoice.netPayable || invoice.total,
      amountPaid: invoice.amountPaid,
      balanceDue: invoice.balanceDue,
      notes: invoice.notes,
      terms: invoice.terms,
      client: {
        companyName: invoice.client.companyName,
        contactPerson: invoice.client.contactPerson,
        email: invoice.client.email,
        phone: invoice.client.phone,
        gstNumber: invoice.client.gstNumber,
        billingAddress: invoice.client.billingAddress,
        state: invoice.client.state,
      },
      items: invoice.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineAmount: i.lineAmount || i.quantity * i.unitPrice,
        appliedTaxes: (i.appliedTaxes as unknown as AppliedTaxSnapshot[]) || [],
        total: i.total,
      })),
    });

    return {
      buffer,
      filename: `${invoice.number}.pdf`,
    };
  }

  /**
   * Dashboard Summary Metrics
   */
  async getDashboardSummary() {
    return this.repository.getDashboardSummary();
  }

  /**
   * Send Invoice via Email with PDF attachment
   */
  async sendInvoiceEmail(
    id: string,
    payload: { recipientEmail?: string; subject?: string; message?: string },
    actorUserId?: string
  ) {
    const invoice = await this.getInvoiceById(id);
    const toEmail = payload.recipientEmail?.trim() || invoice.client.email;

    if (!toEmail) {
      throw AppError.badRequest("Client does not have a valid email address.");
    }

    // Generate PDF Buffer
    const { buffer: pdfBuffer } = await this.generatePdf(id);

    // Send Email
    await emailService.sendInvoiceEmail(
      toEmail,
      payload.subject || `Invoice #${invoice.number} from  Ledgerly`,
      payload.message || "",
      invoice,
      pdfBuffer
    );

    // Auto-update status to SENT if currently DRAFT
    let updatedInvoice = invoice;
    if (invoice.status === "DRAFT") {
      updatedInvoice = await this.repository.updateStatus(id, "SENT");
    }

    // Create Notification
    if (actorUserId) {
      await notificationService.createNotification({
        userId: actorUserId,
        type: "INVOICE_SENT",
        title: "Invoice Emailed",
        message: `Invoice #${invoice.number} emailed to ${toEmail}`,
        entityType: "Invoice",
        entityId: invoice.id,
      });
    }

    return {
      success: true,
      message: `Invoice #${invoice.number} successfully emailed to ${toEmail}`,
      invoice: updatedInvoice,
    };
  }

  /**
   * Send Invoice Payment Reminder via Email
   */
  async sendInvoiceReminder(id: string, actorUserId?: string) {
    const invoice = await this.getInvoiceById(id);
    const toEmail = invoice.client.email;

    if (!toEmail) {
      throw AppError.badRequest("Client does not have a valid email address.");
    }

    const { buffer: pdfBuffer } = await this.generatePdf(id);

    const subject = `Payment Reminder: Invoice #${invoice.number} Due Soon`;
    const message = `Dear ${invoice.client.contactPerson || invoice.client.companyName},\n\nThis is a friendly reminder regarding Invoice #${invoice.number} for ${invoice.currency || "INR"} ${Number(invoice.balanceDue || invoice.netPayable || invoice.grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })} which is due on ${new Date(invoice.dueDate).toLocaleDateString()}.\n\nPlease find attached the invoice statement.\n\nThank you for your prompt attention!`;

    await emailService.sendInvoiceEmail(toEmail, subject, message, invoice, pdfBuffer);

    if (actorUserId) {
      await notificationService.createNotification({
        userId: actorUserId,
        type: "REMINDER_SENT",
        title: "Payment Reminder Emailed",
        message: `Payment reminder for Invoice #${invoice.number} emailed to ${toEmail}`,
        entityType: "Invoice",
        entityId: invoice.id,
      });
    }

    return {
      success: true,
      message: `Payment reminder for Invoice #${invoice.number} emailed to ${toEmail}`,
    };
  }
}

export const invoiceService = new InvoiceService();
