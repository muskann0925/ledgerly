import type { Request, Response, NextFunction } from "express";
import { quotationService, QuotationService } from "./quotation.service";
import { createApiResponse } from "../../utils/apiResponse";
import {
  createQuotationSchema,
  updateQuotationSchema,
  rejectQuotationSchema,
  quotationQuerySchema,
} from "./quotation.validator";

export class QuotationController {
  constructor(
    private readonly service: QuotationService = quotationService
  ) {}

  private getParamId(req: Request, paramName: string = "id"): string {
    const id = req.params[paramName];
    return Array.isArray(id) ? id[0] : id;
  }

  createQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = createQuotationSchema.parse(req.body);
      const createdBy = (req as any).user?.name || (req as any).user?.email;
      const quotation = await this.service.createQuotation(validatedData, createdBy);
      res
        .status(201)
        .json(createApiResponse(true, "Quotation created successfully", quotation));
    } catch (error) {
      next(error);
    }
  };

  getQuotations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = quotationQuerySchema.parse(req.query);
      const result = await this.service.getQuotations(validatedQuery);
      res
        .status(200)
        .json(createApiResponse(true, "Quotations retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  };

  getQuotationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const quotation = await this.service.getQuotationById(id);
      res
        .status(200)
        .json(createApiResponse(true, "Quotation details retrieved successfully", quotation));
    } catch (error) {
      next(error);
    }
  };

  updateQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const validatedData = updateQuotationSchema.parse(req.body);
      const updatedQuotation = await this.service.updateQuotation(id, validatedData);
      res
        .status(200)
        .json(createApiResponse(true, "Quotation updated successfully", updatedQuotation));
    } catch (error) {
      next(error);
    }
  };

  deleteQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const deletedQuotation = await this.service.deleteQuotation(id);
      res
        .status(200)
        .json(createApiResponse(true, "Quotation soft deleted successfully", deletedQuotation));
    } catch (error) {
      next(error);
    }
  };

  restoreQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const restoredQuotation = await this.service.restoreQuotation(id);
      res
        .status(200)
        .json(createApiResponse(true, "Quotation restored successfully", restoredQuotation));
    } catch (error) {
      next(error);
    }
  };

  duplicateQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const createdBy = (req as any).user?.name || (req as any).user?.email;
      const duplicatedQuotation = await this.service.duplicateQuotation(id, createdBy);
      res
        .status(201)
        .json(createApiResponse(true, "Quotation duplicated successfully", duplicatedQuotation));
    } catch (error) {
      next(error);
    }
  };

  approveQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const approvedBy = (req as any).user?.name || (req as any).user?.email;
      const approvedQuotation = await this.service.approveQuotation(id, approvedBy);
      res
        .status(200)
        .json(createApiResponse(true, "Quotation approved successfully", approvedQuotation));
    } catch (error) {
      next(error);
    }
  };

  rejectQuotation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const validatedBody = rejectQuotationSchema.parse(req.body);
      const rejectedQuotation = await this.service.rejectQuotation(
        id,
        validatedBody.rejectionReason
      );
      res
        .status(200)
        .json(createApiResponse(true, "Quotation rejected successfully", rejectedQuotation));
    } catch (error) {
      next(error);
    }
  };

  convertToInvoice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const createdBy = (req as any).user?.name || (req as any).user?.email;
      const result = await this.service.convertToInvoice(id, createdBy);
      res
        .status(201)
        .json(createApiResponse(true, "Quotation converted to invoice successfully", result));
    } catch (error) {
      next(error);
    }
  };

  downloadPdf = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const pdfBuffer = await this.service.generatePdf(id);
      const quotation = await this.service.getQuotationById(id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Quotation-${quotation.quotationNumber}.pdf`
      );
      res.status(200).send(pdfBuffer);
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
      const id = this.getParamId(req, "id");
      const actorUserId = (req as any).user?.userId;
      const result = await this.service.sendQuotationEmail(id, req.body, actorUserId);
      res.status(200).json(createApiResponse(true, result.message, result.quotation));
    } catch (error) {
      next(error);
    }
  };
}

export const quotationController = new QuotationController();
