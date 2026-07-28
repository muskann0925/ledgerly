import { prisma } from "../../lib/prisma";
import { VALID_ISSUED_STATUSES } from "../analytics/analytics.service";

export class DashboardRepository {
  /**
   * Aggregate total gross billing revenue from all valid issued invoices
   */
  async getRevenueSum(): Promise<number> {
    const result = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        status: { in: [...VALID_ISSUED_STATUSES] },
        isDeleted: false,
      },
    });
    return result._sum.total ?? 0;
  }

  /**
   * Aggregate outstanding balance from issued unpaid/partially paid/overdue invoices
   */
  async getOutstandingSum(): Promise<number> {
    const result = await prisma.invoice.aggregate({
      _sum: { balanceDue: true },
      where: {
        status: { in: [...VALID_ISSUED_STATUSES] },
        isDeleted: false,
      },
    });
    return result._sum.balanceDue ?? 0;
  }

  /**
   * Aggregate total paid amount across all valid issued invoices
   */
  async getPaidSum(): Promise<number> {
    const result = await prisma.invoice.aggregate({
      _sum: { amountPaid: true },
      where: {
        status: { in: [...VALID_ISSUED_STATUSES] },
        isDeleted: false,
      },
    });
    return result._sum.amountPaid ?? 0;
  }

  /**
   * Aggregate overdue balance for all invoices past due date with remaining balance
   */
  async getOverdueSum(): Promise<number> {
    const now = new Date();
    const result = await prisma.invoice.aggregate({
      _sum: { balanceDue: true },
      where: {
        isDeleted: false,
        balanceDue: { gt: 0 },
        OR: [
          { status: "OVERDUE" },
          {
            dueDate: { lt: now },
            status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID"] },
          },
        ],
      },
    });
    return result._sum.balanceDue ?? 0;
  }

  /**
   * Total invoice count
   */
  async getInvoicesCount(): Promise<number> {
    return prisma.invoice.count({ where: { isDeleted: false } });
  }

  /**
   * Total active non-deleted client count
   */
  async getClientsCount(): Promise<number> {
    return prisma.client.count({
      where: { isDeleted: false, status: "ACTIVE" },
    });
  }

  /**
   * Aggregate total non-deleted expenses sum
   */
  async getExpensesSum(): Promise<number> {
    const result = await prisma.expense.aggregate({
      _sum: { totalAmount: true, amount: true },
      where: { isDeleted: false },
    });
    return result._sum.totalAmount ?? result._sum.amount ?? 0;
  }

  /**
   * Fetch recent audit logs from database for recent activity feed
   */
  async getRecentActivities(limit: number = 10) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        description: true,
        module: true,
        createdAt: true,
        status: true,
      },
    });
  }

  /**
   * Fetch upcoming due invoices from database with client relation
   */
  async getUpcomingDueInvoices(limit: number = 10) {
    return prisma.invoice.findMany({
      where: {
        status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"] },
        isDeleted: false,
      },
      include: {
        client: {
          select: { companyName: true, contactPerson: true, email: true },
        },
      },
      take: limit,
      orderBy: { dueDate: "asc" },
    });
  }

  /**
   * Raw monthly invoice aggregation data
   */
  async getInvoicesForAnalytics() {
    return prisma.invoice.findMany({
      where: { isDeleted: false },
      select: {
        total: true,
        status: true,
        issueDate: true,
      },
      orderBy: { issueDate: "asc" },
    });
  }

  /**
   * Raw monthly expense aggregation data
   */
  async getExpensesForAnalytics() {
    const expenses = await prisma.expense.findMany({
      where: { isDeleted: false },
      select: {
        totalAmount: true,
        expenseDate: true,
      },
      orderBy: { expenseDate: "asc" },
    });

    return expenses.map((e) => ({
      amount: e.totalAmount,
      date: e.expenseDate,
    }));
  }

  /**
   * Fetch recent invoices with client relation
   */
  async getRecentInvoices(limit: number = 20) {
    return prisma.invoice.findMany({
      where: { isDeleted: false },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { companyName: true, contactPerson: true, email: true },
        },
      },
    });
  }

  /**
   * Fetch all invoices for CSV export
   */
  async getAllInvoicesForExport() {
    return prisma.invoice.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { companyName: true, contactPerson: true, email: true },
        },
      },
    });
  }

  /**
   * Aggregate tax sums from non-deleted invoices
   */
  async getTaxSums() {
    const invoices = await prisma.invoice.findMany({
      where: { isDeleted: false },
      select: {
        totalAdditiveTax: true,
        totalDeductionTax: true,
        tax: true,
        issueDate: true,
        items: {
          select: {
            appliedTaxes: true,
          },
        },
      },
    });

    let taxCollected = 0;
    let taxDeducted = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const monthlyTrendMap = new Map<string, { month: string; taxCollected: number; taxDeducted: number }>();

    invoices.forEach((inv) => {
      const addTax = inv.totalAdditiveTax || inv.tax || 0;
      const dedTax = inv.totalDeductionTax || 0;

      taxCollected += addTax;
      taxDeducted += dedTax;

      const dateObj = new Date(inv.issueDate);
      const monthKey = dateObj.toLocaleString("en-US", { month: "short" });
      const trend = monthlyTrendMap.get(monthKey) || { month: monthKey, taxCollected: 0, taxDeducted: 0 };
      trend.taxCollected += addTax;
      trend.taxDeducted += dedTax;
      monthlyTrendMap.set(monthKey, trend);

      inv.items.forEach((item) => {
        const applied = (item.appliedTaxes as any) || [];
        if (Array.isArray(applied)) {
          applied.forEach((snap: any) => {
            const code = String(snap.taxCode || snap.type || "").toUpperCase();
            if (code.includes("CGST")) cgst += snap.taxAmount || 0;
            else if (code.includes("SGST")) sgst += snap.taxAmount || 0;
            else if (code.includes("IGST")) igst += snap.taxAmount || 0;
          });
        }
      });
    });

    return {
      taxCollected: Math.round(taxCollected * 100) / 100,
      taxDeducted: Math.round(taxDeducted * 100) / 100,
      gstSummary: {
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
        igst: Math.round(igst * 100) / 100,
        totalGst: Math.round((cgst + sgst + igst) * 100) / 100,
      },
      monthlyTaxTrend: Array.from(monthlyTrendMap.values()).map((t) => ({
        month: t.month,
        taxCollected: Math.round(t.taxCollected * 100) / 100,
        taxDeducted: Math.round(t.taxDeducted * 100) / 100,
      })),
    };
  }

  /**
   * Fetch pending & overdue invoices for aging calculations
   */
  async getOutstandingInvoices() {
    return prisma.invoice.findMany({
      where: {
        status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"] },
        isDeleted: false,
      },
      select: {
        total: true,
        balanceDue: true,
        issueDate: true,
        dueDate: true,
        status: true,
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
