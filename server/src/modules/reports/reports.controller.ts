import { Request, Response, NextFunction } from "express";
import { ReportsService } from "./reports.service";
import { reportQuerySchema, exportReportSchema } from "./reports.validator";

export class ReportsController {
  private service: ReportsService;

  constructor() {
    this.service = new ReportsService();
  }

  getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = reportQuerySchema.parse(req.query);
      const data = await this.service.getDashboardSummary(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getRevenueReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = reportQuerySchema.parse(req.query);
      const data = await this.service.getRevenueReport(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getInvoiceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = reportQuerySchema.parse(req.query);
      const data = await this.service.getInvoiceReport(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getTaxReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = reportQuerySchema.parse(req.query);
      const data = await this.service.getTaxReport(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getProfitAndLossReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = reportQuerySchema.parse(req.query);
      const data = await this.service.getProfitAndLossReport(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getClientPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = reportQuerySchema.parse(req.query);
      const data = await this.service.getClientPerformanceReport(filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = exportReportSchema.parse({
        ...req.query,
        reportType: req.params.type,
      });

      const { buffer, fileName, mimeType } = await this.service.exportReport(
        query,
        req.user?.email || req.user?.userId
      );

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      if (typeof buffer === "string") {
        res.status(200).send(buffer);
      } else {
        res.status(200).send(buffer);
      }
    } catch (error) {
      next(error);
    }
  };
}
