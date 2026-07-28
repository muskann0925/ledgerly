import { Request, Response, NextFunction } from "express";
import { dashboardService, DashboardService } from "./dashboard.service";
import { createApiResponse } from "../../utils/apiResponse";

export class DashboardController {
  constructor(
    private readonly service: DashboardService = dashboardService
  ) {}

  getDashboardMetrics = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.service.getDashboardMetrics();
      res
        .status(200)
        .json(createApiResponse(true, "Dashboard metrics retrieved successfully", data));
    } catch (error) {
      next(error);
    }
  };

  exportAnalyticsCsv = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const csvData = await this.service.exportDashboardAnalyticsCsv();
      const filename = `dashboard-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };

  exportCsv = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const csvData = await this.service.exportInvoicesCsv();
      const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
