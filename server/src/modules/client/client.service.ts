import { clientRepository, ClientRepository } from "./client.repository";
import { prisma } from "../../lib/prisma";
import { generateStatementPdfBuffer } from "./statement.pdf";
import { AppError } from "../../utils/AppError";
import type {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryOptions,
  PaginatedClientsResult,
} from "./client.types";
import { Client } from "@prisma/client";

import { auditLogService } from "../audit-logs/audit-log.service";
import { emailService } from "../../shared/email.service";

export class ClientService {
  constructor(
    private readonly repository: ClientRepository = clientRepository
  ) { }

  /**
   * Create new client with email & GST uniqueness verification
   */
  async createClient(data: CreateClientDto, actorUserId?: string, actorRole?: string): Promise<Client> {
    // 1. Email Uniqueness Check
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw AppError.conflict(`Client with email '${data.email}' already exists`);
    }

    // 2. GST Number Uniqueness Check (if provided)
    if (data.gstNumber && data.gstNumber.trim() !== "") {
      const existingGst = await this.repository.findByGst(data.gstNumber);
      if (existingGst) {
        throw AppError.conflict(`Client with GST number '${data.gstNumber}' already exists`);
      }
    }

    // 3. Create client in database
    const newClient = await this.repository.create(data);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "CREATE_CLIENT",
      module: "CLIENTS",
      entityType: "Client",
      entityId: newClient.id,
      entityName: newClient.companyName,
      description: `Created client record '${newClient.companyName}' (${newClient.email})`,
      newValue: {
        companyName: newClient.companyName,
        contactPerson: newClient.contactPerson,
        email: newClient.email,
        phone: newClient.phone,
        clientType: newClient.clientType,
        gstNumber: newClient.gstNumber,
      },
      status: "SUCCESS",
    });

    return newClient;
  }

  /**
   * Get paginated clients list
   */
  async getClients(
    options: ClientQueryOptions
  ): Promise<PaginatedClientsResult<Client>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));

    const { clients, total } = await this.repository.findAll(options);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      clients,
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
   * Get single non-deleted client by ID
   */
  async getClientById(id: string): Promise<Client> {
    const client = await this.repository.findById(id);
    if (!client) {
      throw AppError.notFound(`Client with ID '${id}' not found`);
    }

    const rawInvoices = (client as any).invoices;
    if (rawInvoices && Array.isArray(rawInvoices)) {
      (client as any).invoices = rawInvoices.map((inv: any) => ({
        ...inv,
        amount: typeof inv.amount === "number" ? inv.amount : (typeof inv.total === "number" ? inv.total : 0),
        total: typeof inv.total === "number" ? inv.total : (typeof inv.amount === "number" ? inv.amount : 0),
        amountPaid: typeof inv.amountPaid === "number" ? inv.amountPaid : 0,
        balanceDue: typeof inv.balanceDue === "number" ? inv.balanceDue : (typeof inv.total === "number" ? inv.total : 0),
      }));
    }

    return client;
  }

  /**
   * Update client details
   */
  async updateClient(id: string, data: UpdateClientDto, actorUserId?: string, actorRole?: string): Promise<Client> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Client with ID '${id}' not found`);
    }

    // Check email uniqueness if changing
    if (data.email && data.email.toLowerCase().trim() !== existing.email.toLowerCase()) {
      const duplicateEmail = await this.repository.findByEmail(data.email);
      if (duplicateEmail && duplicateEmail.id !== id) {
        throw AppError.conflict(`Client with email '${data.email}' already exists`);
      }
    }

    // Check GST uniqueness if changing
    if (data.gstNumber && data.gstNumber.toUpperCase().trim() !== existing.gstNumber?.toUpperCase()) {
      const duplicateGst = await this.repository.findByGst(data.gstNumber);
      if (duplicateGst && duplicateGst.id !== id) {
        throw AppError.conflict(`Client with GST number '${data.gstNumber}' already exists`);
      }
    }

    const updated = await this.repository.update(id, data);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "UPDATE_CLIENT",
      module: "CLIENTS",
      entityType: "Client",
      entityId: updated.id,
      entityName: updated.companyName,
      description: `Updated profile details for client '${updated.companyName}'`,
      oldValue: {
        companyName: existing.companyName,
        contactPerson: existing.contactPerson,
        email: existing.email,
        phone: existing.phone,
        status: existing.status,
      },
      newValue: {
        companyName: updated.companyName,
        contactPerson: updated.contactPerson,
        email: updated.email,
        phone: updated.phone,
        status: updated.status,
      },
      status: "SUCCESS",
    });

    return updated;
  }

  /**
   * Soft delete client
   */
  async deleteClient(id: string, actorUserId?: string, actorRole?: string): Promise<Client> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Client with ID '${id}' not found`);
    }

    const deleted = await this.repository.softDelete(id);

    await auditLogService.logAction({
      userId: actorUserId,
      role: actorRole,
      action: "DELETE_CLIENT",
      module: "CLIENTS",
      entityType: "Client",
      entityId: existing.id,
      entityName: existing.companyName,
      description: `Deleted client record '${existing.companyName}' (${existing.email})`,
      oldValue: {
        companyName: existing.companyName,
        email: existing.email,
        contactPerson: existing.contactPerson,
      },
      status: "SUCCESS",
    });

    return deleted;
  }

  /**
   * Restore soft deleted client
   */
  async restoreClient(id: string): Promise<Client> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Client with ID '${id}' not found`);
    }
    return this.repository.restore(id);
  }

  /**
   * Generate Client Account Statement PDF Buffer
   */
  async generateStatementPdf(
    id: string,
    startDateStr?: string,
    endDateStr?: string
  ): Promise<{ buffer: Buffer; filename: string }> {
    const client = await this.repository.findById(id);
    if (!client) {
      throw AppError.notFound(`Client with ID '${id}' not found`);
    }

    const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    const [invoices, payments, creditNotes] = await Promise.all([
      prisma.invoice.findMany({
        where: { clientId: id, isDeleted: false, issueDate: { gte: startDate, lte: endDate } },
        orderBy: { issueDate: "asc" },
      }),
      prisma.payment.findMany({
        where: { invoice: { clientId: id }, isDeleted: false, paymentDate: { gte: startDate, lte: endDate } },
        include: { invoice: true },
        orderBy: { paymentDate: "asc" },
      }),
      prisma.creditNote.findMany({
        where: { clientId: id, isDeleted: false, issueDate: { gte: startDate, lte: endDate } },
        orderBy: { issueDate: "asc" },
      }),
    ]);

    const transactions: any[] = [];
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalCredits = 0;

    invoices.forEach((inv) => {
      totalInvoiced += inv.netPayable || inv.total;
      transactions.push({
        date: inv.issueDate,
        type: "INVOICE" as const,
        referenceNumber: inv.number,
        debit: inv.netPayable || inv.total,
        credit: 0,
      });
    });

    payments.forEach((pay) => {
      totalPaid += pay.amount;
      transactions.push({
        date: pay.paymentDate,
        type: "PAYMENT" as const,
        referenceNumber: pay.referenceNumber || pay.invoice.number,
        debit: 0,
        credit: pay.amount,
      });
    });

    creditNotes.forEach((cn) => {
      totalCredits += cn.totalAmount;
      transactions.push({
        date: cn.issueDate,
        type: "CREDIT_NOTE" as const,
        referenceNumber: cn.creditNoteNumber,
        debit: 0,
        credit: cn.totalAmount,
      });
    });

    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const items = transactions.map((t) => {
      runningBalance += t.debit - t.credit;
      return { ...t, runningBalance };
    });

    const statementNumber = `STMT-${client.id.slice(-5).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const buffer = await generateStatementPdfBuffer({
      statementNumber,
      startDate,
      endDate,
      openingBalance: 0,
      closingBalance: runningBalance,
      totalInvoiced,
      totalPaid,
      totalCredits,
      outstandingBalance: Math.max(0, runningBalance),
      client: {
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
      },
      transactions: items,
    });

    return {
      buffer,
      filename: `Statement-${client.companyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    };
  }

  /**
   * Send Client Statement / Message via Email
   */
  async sendClientEmail(
    id: string,
    payload: { recipientEmail?: string; subject?: string; message?: string },
    actorUserId?: string
  ) {
    const client = await this.getClientById(id);
    const toEmail = payload.recipientEmail?.trim() || client.email;

    if (!toEmail) {
      throw AppError.badRequest("Client does not have a valid email address.");
    }

    const { buffer: pdfBuffer } = await this.generateStatementPdf(id);

    await emailService.sendClientStatementEmail(
      toEmail,
      payload.subject || `Account Statement for ${client.companyName} -  Ledgerly`,
      payload.message || "",
      client,
      pdfBuffer
    );

    await auditLogService.logAction({
      userId: actorUserId,
      action: "STATEMENT_EMAILED",
      module: "CLIENTS",
      entityType: "Client",
      entityId: client.id,
      entityName: client.companyName,
      description: `Account statement emailed to ${toEmail}`,
      status: "SUCCESS",
    });

    return {
      success: true,
      message: `Statement for ${client.companyName} successfully emailed to ${toEmail}`,
      client,
    };
  }
}

export const clientService = new ClientService();
