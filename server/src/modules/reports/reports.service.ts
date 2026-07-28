import { ReportsRepository } from "./reports.repository";
import { ReportsExporter } from "./reports.exporter";
import { prisma } from "../../lib/prisma";
import type {
  ReportFilterQuery,
  ExportReportQuery,
  DashboardMetricsReport,
  FullRevenueReport,
  FullInvoiceReport,
  FullTaxReport,
  ProfitAndLossReport,
  ClientPerformanceReport,
} from "./reports.types";

export class ReportsService {
  private repository: ReportsRepository;
  private exporter: ReportsExporter;

  constructor() {
    this.repository = new ReportsRepository();
    this.exporter = new ReportsExporter();
  }

  async getDashboardSummary(filters: ReportFilterQuery): Promise<DashboardMetricsReport> {
    return this.repository.getDashboardMetrics(filters);
  }

  async getRevenueReport(filters: ReportFilterQuery): Promise<FullRevenueReport> {
    return this.repository.getRevenueReport(filters);
  }

  async getInvoiceReport(filters: ReportFilterQuery): Promise<FullInvoiceReport> {
    return this.repository.getInvoiceReport(filters);
  }

  async getTaxReport(filters: ReportFilterQuery): Promise<FullTaxReport> {
    return this.repository.getTaxReport(filters);
  }

  async getProfitAndLossReport(filters: ReportFilterQuery): Promise<ProfitAndLossReport> {
    return this.repository.getProfitAndLossReport(filters);
  }

  async getClientPerformanceReport(filters: ReportFilterQuery): Promise<ClientPerformanceReport> {
    return this.repository.getClientPerformanceReport(filters);
  }

  /**
   * File Export Generator Handler
   */
  async exportReport(
    query: ExportReportQuery,
    performedBy?: string
  ): Promise<{ buffer: Buffer | string; fileName: string; mimeType: string }> {
    let reportData: any;

    switch (query.reportType) {
      case "revenue":
        reportData = await this.getRevenueReport(query);
        break;
      case "invoices":
        reportData = await this.getInvoiceReport(query);
        break;
      case "tax":
        reportData = await this.getTaxReport(query);
        break;
      case "profit-loss":
        reportData = await this.getProfitAndLossReport(query);
        break;
      case "clients":
        reportData = await this.getClientPerformanceReport(query);
        break;
      default:
        reportData = await this.getRevenueReport(query);
    }

    // Create Activity Log for Report Export
    await prisma.activityLog.create({
      data: {
        title: "Report Exported",
        description: `User '${performedBy || "System"}' exported ${query.reportType.toUpperCase()} report in ${query.format.toUpperCase()} format.`,
        type: "AUDIT",
      },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${query.reportType}_report_${timestamp}`;

    if (query.format === "excel") {
      const buffer = await this.exporter.generateExcelReport(query.reportType, reportData);
      return {
        buffer,
        fileName: `${fileName}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }

    if (query.format === "csv") {
      const csvStr = this.exporter.generateCsvReport(query.reportType, reportData);
      return {
        buffer: csvStr,
        fileName: `${fileName}.csv`,
        mimeType: "text/csv",
      };
    }

    // Default: PDF
    const pdfBuffer = await this.exporter.generatePdfReport(query.reportType, reportData);
    return {
      buffer: pdfBuffer,
      fileName: `${fileName}.pdf`,
      mimeType: "application/pdf",
    };
  }
}
