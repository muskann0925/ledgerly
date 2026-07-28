import type { Request, Response, NextFunction } from "express";
import { invoiceService, InvoiceService } from "./invoice.service";
import { createApiResponse } from "../../utils/apiResponse";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  markPaidSchema,
  markPartialSchema,
  invoiceQuerySchema,
} from "./invoice.validator";

export class InvoiceController {
  constructor(
    private readonly service: InvoiceService = invoiceService
  ) {}

  private getParamId(req: Request): string {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
  }

  createInvoice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = createInvoiceSchema.parse(req.body);
      const createdBy = (req as any).user?.name || (req as any).user?.email;
      const invoice = await this.service.createInvoice(validatedData, createdBy);
      res
        .status(201)
        .json(createApiResponse(true, "Invoice created successfully", invoice));
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = invoiceQuerySchema.parse(req.query);
      const result = await this.service.getInvoices(validatedQuery);
      res
        .status(200)
        .json(createApiResponse(true, "Invoices retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  };

  getInvoiceById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const invoice = await this.service.getInvoiceById(id);
      res
        .status(200)
        .json(createApiResponse(true, "Invoice details retrieved successfully", invoice));
    } catch (error) {
      next(error);
    }
  };

  updateInvoice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const validatedData = updateInvoiceSchema.parse(req.body);
      const updatedInvoice = await this.service.updateInvoice(id, validatedData);
      res
        .status(200)
        .json(createApiResponse(true, "Invoice updated successfully", updatedInvoice));
    } catch (error) {
      next(error);
    }
  };

  deleteInvoice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const deletedInvoice = await this.service.deleteInvoice(id);
      res
        .status(200)
        .json(createApiResponse(true, "Invoice soft deleted successfully", deletedInvoice));
    } catch (error) {
      next(error);
    }
  };

  restoreInvoice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const restoredInvoice = await this.service.restoreInvoice(id);
      res
        .status(200)
        .json(createApiResponse(true, "Invoice restored successfully", restoredInvoice));
    } catch (error) {
      next(error);
    }
  };

  duplicateInvoice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const createdBy = (req as any).user?.name || (req as any).user?.email;
      const duplicatedInvoice = await this.service.duplicateInvoice(id, createdBy);
      res
        .status(201)
        .json(createApiResponse(true, "Invoice duplicated successfully", duplicatedInvoice));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const { status } = updateInvoiceStatusSchema.parse(req.body);
      const updatedInvoice = await this.service.updateStatus(id, status);
      res
        .status(200)
        .json(
          createApiResponse(
            true,
            `Invoice status updated to ${status} successfully`,
            updatedInvoice
          )
        );
    } catch (error) {
      next(error);
    }
  };

  markPaid = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const validatedData = markPaidSchema.parse(req.body);
      const paidInvoice = await this.service.markPaid(id, validatedData);
      res
        .status(200)
        .json(createApiResponse(true, "Invoice marked as fully paid", paidInvoice));
    } catch (error) {
      next(error);
    }
  };

  markPartial = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const validatedData = markPartialSchema.parse(req.body);
      const updatedInvoice = await this.service.markPartial(id, validatedData);
      res
        .status(200)
        .json(createApiResponse(true, "Partial payment recorded successfully", updatedInvoice));
    } catch (error) {
      next(error);
    }
  };

  getPdf = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const { buffer, filename } = await this.service.generatePdf(id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename}"`
      );
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  sendEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const actorUserId = req.user?.userId;
      const result = await this.service.sendInvoiceEmail(id, req.body, actorUserId);
      res.status(200).json(createApiResponse(true, result.message, result.invoice));
    } catch (error) {
      next(error);
    }
  };

  getDashboardSummary = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await this.service.getDashboardSummary();
      res
        .status(200)
        .json(createApiResponse(true, "Invoice dashboard summary retrieved", summary));
    } catch (error) {
      next(error);
    }
  };

  markViewed = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const result = await this.service.markInvoiceViewed(id);
      res.status(200).json(createApiResponse(true, result.message, null));
    } catch (error) {
      next(error);
    }
  };

  sendReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const result = await this.service.sendInvoiceReminder(id);
      res.status(200).json(createApiResponse(true, result.message, null));
    } catch (error) {
      next(error);
    }
  };
}

export const invoiceController = new InvoiceController();
