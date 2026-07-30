import type { Request, Response, NextFunction } from "express";
import { paymentService, PaymentService } from "./payment.service";
import { createApiResponse } from "../../utils/apiResponse";
import {
  createPaymentSchema,
  updatePaymentSchema,
  paymentQuerySchema,
} from "./payment.validator";

export class PaymentController {
  constructor(
    private readonly service: PaymentService = paymentService
  ) {}

  private getParamId(req: Request, paramName: string = "id"): string {
    const id = req.params[paramName];
    return Array.isArray(id) ? id[0] : id;
  }

  createPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      const createdBy = (req as any).user?.name || (req as any).user?.email;
      const payment = await this.service.createPayment(validatedData, createdBy);
      res
        .status(201)
        .json(createApiResponse(true, "Payment recorded successfully", payment));
    } catch (error) {
      next(error);
    }
  };

  getPayments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = paymentQuerySchema.parse(req.query);
      const result = await this.service.getPayments(validatedQuery);
      res
        .status(200)
        .json(createApiResponse(true, "Payments retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  };

  getPaymentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const payment = await this.service.getPaymentById(id);
      res
        .status(200)
        .json(createApiResponse(true, "Payment details retrieved successfully", payment));
    } catch (error) {
      next(error);
    }
  };

  getPaymentsByInvoiceId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const invoiceId = this.getParamId(req, "invoiceId");
      const payments = await this.service.getPaymentsByInvoiceId(invoiceId);
      res
        .status(200)
        .json(
          createApiResponse(
            true,
            "Invoice payments retrieved successfully",
            payments
          )
        );
    } catch (error) {
      next(error);
    }
  };

  updatePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const validatedData = updatePaymentSchema.parse(req.body);
      const updatedPayment = await this.service.updatePayment(id, validatedData);
      res
        .status(200)
        .json(createApiResponse(true, "Payment updated successfully", updatedPayment));
    } catch (error) {
      next(error);
    }
  };

  deletePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const deletedPayment = await this.service.deletePayment(id);
      res
        .status(200)
        .json(createApiResponse(true, "Payment soft deleted successfully", deletedPayment));
    } catch (error) {
      next(error);
    }
  };

  restorePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const restoredPayment = await this.service.restorePayment(id);
      res
        .status(200)
        .json(createApiResponse(true, "Payment restored successfully", restoredPayment));
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
      const id = this.getParamId(req, "id");
      const { buffer, filename } = await this.service.generatePdf(id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
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
      const id = this.getParamId(req, "id");
      const actorUserId = req.user?.userId;
      const result = await this.service.sendPaymentReceiptEmail(id, req.body, actorUserId);
      res.status(200).json(createApiResponse(true, result.message, result.payment));
    } catch (error) {
      next(error);
    }
  };
  retryPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req, "id");
      const userId = req.user?.userId;
      const { status = "SUCCESS", failureReason } = req.body;
      const payment = await this.service.retryPayment(id, { status, failureReason }, userId);
      res
        .status(200)
        .json(createApiResponse(true, `Payment status updated to ${status}`, payment));
    } catch (error) {
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
