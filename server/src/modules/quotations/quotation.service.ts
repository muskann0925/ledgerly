import { quotationRepository, QuotationRepository } from "./quotation.repository";
import { NotificationType } from "@prisma/client";
import { notificationService } from "../notifications/notification.service";
import { clientRepository } from "../client/client.repository";
import { invoiceRepository } from "../invoices/invoice.repository";
import { generateQuotationPdfBuffer } from "./quotation.pdf";
import { emailService } from "../../shared/email.service";
import { AppError } from "../../utils/AppError";
import type {
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationQueryOptions,
  PaginatedQuotationsResult,
  Quotation,
  CreateQuotationItemDto,
} from "./quotation.types";
import type { CalculatedQuotationItem, QuotationCalculatedTotals } from "./quotation.repository";
import { auditLogService } from "../audit-logs/audit-log.service";

export class QuotationService {
  constructor(
    private readonly repository: QuotationRepository = quotationRepository
  ) { }

  /**
   * Helper to calculate item totals and quotation totals (never trust frontend math)
   */
  private calculateTotals(items: CreateQuotationItemDto[]): {
    calculatedItems: CalculatedQuotationItem[];
    totals: QuotationCalculatedTotals;
  } {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const calculatedItems: CalculatedQuotationItem[] = items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const taxRate = Number(item.taxRate || 0);
      const discount = Number(item.discount || 0);

      if (quantity <= 0) {
        throw AppError.badRequest(`Item quantity must be greater than 0`);
      }
      if (unitPrice < 0) {
        throw AppError.badRequest(`Item unit price cannot be negative`);
      }

      const itemSubtotal = quantity * unitPrice;
      const itemTax = itemSubtotal * (taxRate / 100);
      const itemTotal = Math.round((itemSubtotal - discount + itemTax) * 100) / 100;

      subtotal += itemSubtotal;
      totalTax += itemTax;
      totalDiscount += discount;

      return {
        description: item.description.trim(),
        quantity,
        unitPrice,
        taxRate,
        discount,
        total: itemTotal,
      };
    });

    const roundedSubtotal = Math.round(subtotal * 100) / 100;
    const roundedDiscount = Math.round(totalDiscount * 100) / 100;
    const roundedTax = Math.round(totalTax * 100) / 100;
    const grandTotal = Math.max(
      0,
      Math.round((roundedSubtotal - roundedDiscount + roundedTax) * 100) / 100
    );

    return {
      calculatedItems,
      totals: {
        subtotal: roundedSubtotal,
        discount: roundedDiscount,
        tax: roundedTax,
        total: grandTotal,
      },
    };
  }

  /**
   * Create new quotation
   */
  async createQuotation(
    dto: CreateQuotationDto,
    createdBy?: string
  ): Promise<Quotation> {
    const client = await clientRepository.findById(dto.clientId);
    if (!client || client.isDeleted) {
      throw AppError.notFound("Client not found or is soft-deleted");
    }

    if (!dto.items || dto.items.length === 0) {
      throw AppError.badRequest("Quotation must contain at least one line item");
    }

    const { calculatedItems, totals } = this.calculateTotals(dto.items);

    const newQuotation = await this.repository.createQuotation(dto, totals, calculatedItems, createdBy);

    await auditLogService.logAction({
      userId: createdBy,
      action: "CREATE_QUOTATION",
      module: "QUOTATIONS",
      entityType: "Quotation",
      entityId: newQuotation.id,
      entityName: newQuotation.quotationNumber,
      description: `Created quotation #${newQuotation.quotationNumber} for client '${client.companyName}'`,
      newValue: {
        quotationNumber: newQuotation.quotationNumber,
        clientId: newQuotation.clientId,
        netPayable: newQuotation.netPayable,
        status: newQuotation.status,
      },
      status: "SUCCESS",
    });

    return newQuotation;
  }

  /**
   * Get single quotation by ID
   */
  async getQuotationById(id: string): Promise<Quotation> {
    const quotation = await this.repository.findById(id);
    if (!quotation) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }
    return quotation;
  }

  /**
   * Get paginated quotations list with search, filter & sort
   */
  async getQuotations(
    options: QuotationQueryOptions
  ): Promise<PaginatedQuotationsResult<Quotation>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(
      1,
      Math.min(100, options.pageSize || options.limit || 10)
    );

    const { quotations, total } = await this.repository.findAll(options);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      quotations,
      pagination: {
        page,
        limit,
        pageSize: limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update quotation details & line items
   */
  async updateQuotation(
    id: string,
    dto: UpdateQuotationDto,
    actorUserId?: string
  ): Promise<Quotation> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }

    if (existing.status === "CONVERTED") {
      throw AppError.badRequest("Cannot modify a quotation that has already been converted to an invoice");
    }

    let totals: QuotationCalculatedTotals | undefined;
    let calculatedItems: CalculatedQuotationItem[] | undefined;

    if (dto.items && dto.items.length > 0) {
      const result = this.calculateTotals(dto.items);
      totals = result.totals;
      calculatedItems = result.calculatedItems;
    }

    const updated = await this.repository.updateQuotation(id, dto, totals, calculatedItems);

    await auditLogService.logAction({
      userId: actorUserId,
      action: "UPDATE_QUOTATION",
      module: "QUOTATIONS",
      entityType: "Quotation",
      entityId: updated.id,
      entityName: updated.quotationNumber,
      description: `Updated details for quotation #${updated.quotationNumber}`,
      oldValue: { status: existing.status, netPayable: existing.netPayable },
      newValue: { status: updated.status, netPayable: updated.netPayable },
      status: "SUCCESS",
    });

    return updated;
  }

  /**
   * Soft delete quotation
   */
  async deleteQuotation(id: string, actorUserId?: string): Promise<Quotation> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }
    const deleted = await this.repository.softDelete(id);

    await auditLogService.logAction({
      userId: actorUserId,
      action: "DELETE_QUOTATION",
      module: "QUOTATIONS",
      entityType: "Quotation",
      entityId: existing.id,
      entityName: existing.quotationNumber,
      description: `Deleted quotation #${existing.quotationNumber}`,
      oldValue: { quotationNumber: existing.quotationNumber, status: existing.status },
      status: "SUCCESS",
    });

    return deleted;
  }

  /**
   * Restore soft-deleted quotation
   */
  async restoreQuotation(id: string): Promise<Quotation> {
    const existing = await this.repository.findById(id, true);
    if (!existing || !existing.isDeleted) {
      throw AppError.notFound(`Soft-deleted quotation with ID '${id}' not found`);
    }
    return this.repository.restore(id);
  }

  /**
   * Duplicate quotation as a new DRAFT
   */
  async duplicateQuotation(
    id: string,
    createdBy?: string
  ): Promise<Quotation> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }

    const itemsDto: CreateQuotationItemDto[] = existing.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      discount: item.discount,
    }));

    const createDto: CreateQuotationDto = {
      clientId: existing.clientId,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default +30 days
      status: "DRAFT",
      currency: existing.currency,
      notes: existing.notes,
      terms: existing.terms,
      items: itemsDto,
    };

    return this.createQuotation(createDto, createdBy);
  }

  /**
   * Approve quotation
   */
  async approveQuotation(id: string, approvedBy?: string): Promise<Quotation> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }

    if (existing.status === "CONVERTED") {
      throw AppError.badRequest("Cannot approve a quotation that is already converted to an invoice");
    }

    const approvedQuotation = await this.repository.approveQuotation(id, approvedBy);

    const clientName = existing.client?.companyName || existing.client?.contactPerson || "Client";
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: existing.currency || "INR",
    }).format(existing.netPayable || existing.grandTotal);

    await notificationService.notifyUsersForEvent(
      NotificationType.QUOTATION_APPROVED,
      `Quotation Approved: ${existing.quotationNumber}`,
      `Quotation ${existing.quotationNumber} for ${clientName} (${formattedAmount}) has been approved.`,
      "Quotation",
      existing.id,
      {
        quotationId: existing.id,
        quotationNumber: existing.quotationNumber,
        clientName,
        grandTotal: existing.netPayable || existing.grandTotal,
      }
    );

    await auditLogService.logAction({
      userId: approvedBy,
      action: "APPROVE_QUOTATION",
      module: "QUOTATIONS",
      entityType: "Quotation",
      entityId: approvedQuotation.id,
      entityName: approvedQuotation.quotationNumber,
      description: `Approved quotation #${approvedQuotation.quotationNumber}`,
      oldValue: { status: existing.status },
      newValue: { status: "APPROVED" },
      status: "SUCCESS",
    });

    return approvedQuotation;
  }

  /**
   * Reject quotation with optional reason
   */
  async rejectQuotation(id: string, rejectionReason?: string, actorUserId?: string): Promise<Quotation> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }

    if (existing.status === "CONVERTED") {
      throw AppError.badRequest("Cannot reject a quotation that is already converted to an invoice");
    }

    const rejected = await this.repository.rejectQuotation(id, rejectionReason);

    await auditLogService.logAction({
      userId: actorUserId,
      action: "REJECT_QUOTATION",
      module: "QUOTATIONS",
      entityType: "Quotation",
      entityId: rejected.id,
      entityName: rejected.quotationNumber,
      description: `Rejected quotation #${rejected.quotationNumber}${rejectionReason ? `: ${rejectionReason}` : ""}`,
      oldValue: { status: existing.status },
      newValue: { status: "REJECTED", rejectionReason },
      status: "SUCCESS",
    });

    return rejected;
  }

  /**
   * Convert Quotation to Invoice in a single Prisma transaction
   */
  async convertToInvoice(
    quotationId: string,
    createdBy?: string
  ) {
    const quotation = await this.repository.findById(quotationId);
    if (!quotation || quotation.isDeleted) {
      throw AppError.notFound("Quotation not found or deleted");
    }

    if (quotation.status === "CONVERTED" || quotation.convertedInvoiceId) {
      throw AppError.badRequest("This quotation has already been converted to an invoice");
    }

    // Generate new unique invoice number
    const newInvoiceNumber = await invoiceRepository.generateNextInvoiceNumber();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const netPayable = quotation.netPayable || quotation.total;
    const totalAdditiveTax = quotation.totalAdditiveTax || quotation.tax;
    const totalDeductionTax = quotation.totalDeductionTax || 0;
    const grandTotal = quotation.grandTotal || quotation.total;

    const invoiceData = {
      number: newInvoiceNumber,
      clientId: quotation.clientId,
      dueDate,
      status: "DRAFT" as const,
      currency: quotation.currency,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      tax: totalAdditiveTax,
      totalAdditiveTax,
      totalDeductionTax,
      grandTotal,
      netPayable,
      total: netPayable,
      amountPaid: 0,
      balanceDue: netPayable,
      notes: quotation.notes,
      terms: quotation.terms,
      createdBy: createdBy || quotation.createdBy,
    };

    const itemsData = quotation.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineAmount: item.quantity * item.unitPrice,
      appliedTaxes: (item as any).appliedTaxes || [],
      discount: item.discount,
      total: item.total,
    }));

    const result = await this.repository.convertToInvoiceTransaction(
      quotationId,
      invoiceData,
      itemsData
    );

    await auditLogService.logAction({
      userId: createdBy,
      action: "CONVERT_QUOTATION_TO_INVOICE",
      module: "QUOTATIONS",
      entityType: "Quotation",
      entityId: quotation.id,
      entityName: quotation.quotationNumber,
      description: `Converted quotation #${quotation.quotationNumber} to invoice #${newInvoiceNumber}`,
      newValue: {
        invoiceId: result.invoice.id,
        invoiceNumber: result.invoice.number,
      },
      status: "SUCCESS",
    });

    return result;
  }

  /**
   * Generate downloadable PDF Buffer for Quotation
   */
  async generatePdf(id: string): Promise<Buffer> {
    const quotation = await this.repository.findById(id);
    if (!quotation || quotation.isDeleted) {
      throw AppError.notFound("Quotation not found");
    }

    return generateQuotationPdfBuffer({
      quotationNumber: quotation.quotationNumber,
      issueDate: quotation.issueDate,
      expiryDate: quotation.expiryDate,
      status: quotation.status,
      currency: quotation.currency,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      tax: quotation.tax,
      total: quotation.total,
      notes: quotation.notes,
      terms: quotation.terms,
      client: {
        companyName: quotation.client.companyName,
        contactPerson: quotation.client.contactPerson,
        email: quotation.client.email,
        phone: quotation.client.phone,
        gstNumber: quotation.client.gstNumber,
        billingAddress: quotation.client.billingAddress,
      },
      items: quotation.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discount: item.discount,
        total: item.total,
      })),
    });
  }

  /**
   * Send Quotation via Email with PDF attachment
   */
  async sendQuotationEmail(
    id: string,
    payload: { recipientEmail?: string; subject?: string; message?: string },
    actorUserId?: string
  ) {
    const quotation = await this.repository.findById(id);
    if (!quotation || quotation.isDeleted) {
      throw AppError.notFound(`Quotation with ID '${id}' not found`);
    }

    const toEmail = payload.recipientEmail?.trim() || quotation.client?.email;

    if (!toEmail) {
      throw AppError.badRequest("Client does not have a valid email address.");
    }

    const pdfBuffer = await this.generatePdf(id);

    await emailService.sendQuotationEmail(
      toEmail,
      payload.subject || `Quotation #${quotation.quotationNumber} from Ledgerly`,
      payload.message || "",
      quotation,
      pdfBuffer
    );

    let updatedQuotation = quotation;
    if (quotation.status === "DRAFT") {
      updatedQuotation = await this.repository.updateStatus(id, "PENDING");
    }

    if (actorUserId) {
      await notificationService.createNotification({
        userId: actorUserId,
        type: "QUOTATION_APPROVED",
        title: "Quotation Emailed",
        message: `Quotation #${quotation.quotationNumber} emailed to ${toEmail}`,
        entityType: "Quotation",
        entityId: quotation.id,
      });
    }

    return {
      success: true,
      message: `Quotation #${quotation.quotationNumber} successfully emailed to ${toEmail}`,
      quotation: updatedQuotation,
    };
  }
}

export const quotationService = new QuotationService();
