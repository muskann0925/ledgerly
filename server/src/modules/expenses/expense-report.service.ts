import { ExpenseReportRepository } from "./expense-report.repository";
import type { ReportDateFilter } from "./expense.types";

export class ExpenseReportService {
  private reportRepo: ExpenseReportRepository;

  constructor() {
    this.reportRepo = new ExpenseReportRepository();
  }

  async getTotalExpenses(filters: ReportDateFilter) {
    return this.reportRepo.getTotalExpenses(filters);
  }

  async getExpensesByCategory(filters: ReportDateFilter) {
    return this.reportRepo.getExpensesByCategory(filters);
  }

  async getExpensesByVendor(filters: ReportDateFilter) {
    return this.reportRepo.getExpensesByVendor(filters);
  }

  async getMonthlyTrend(filters: ReportDateFilter) {
    return this.reportRepo.getMonthlyTrend(filters);
  }

  async getTaxSummary(filters: ReportDateFilter) {
    return this.reportRepo.getTaxSummary(filters);
  }

  async getDateRangeReport(filters: ReportDateFilter) {
    const [totals, categories, vendors, monthlyTrend, taxSummary] = await Promise.all([
      this.reportRepo.getTotalExpenses(filters),
      this.reportRepo.getExpensesByCategory(filters),
      this.reportRepo.getExpensesByVendor(filters),
      this.reportRepo.getMonthlyTrend(filters),
      this.reportRepo.getTaxSummary(filters),
    ]);

    return {
      filters,
      totals,
      categories,
      vendors,
      monthlyTrend,
      taxSummary,
    };
  }

  async getDashboardSummary() {
    return this.reportRepo.getDashboardSummary();
  }
}
