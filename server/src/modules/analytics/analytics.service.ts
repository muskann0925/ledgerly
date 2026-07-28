import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const VALID_ISSUED_STATUSES = [
  "PENDING",
  "SENT",
  "VIEWED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
] as const;

export const EXCLUDED_STATUSES = [
  "DRAFT",
  "CANCELLED",
  "REFUNDED",
  "VOID",
] as const;

export interface FinancialKPIs {
  revenue: number;
  paid: number;
  outstanding: number;
  overdue: number;
  overdueCount: number;
  invoices: number;
  clients: number;
  expenses: number;
  profit: number;
}

export interface MonthlyFinancialPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export class AnalyticsService {
  /**
   * Automatically update database statuses of invoices past their due date with remaining balances
   */
  async syncOverdueStatuses(): Promise<number> {
    try {
      const now = new Date();
      const result = await prisma.invoice.updateMany({
        where: {
          isDeleted: false,
          dueDate: { lt: now },
          balanceDue: { gt: 0 },
          status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID"] },
        },
        data: {
          status: "OVERDUE",
        },
      });
      return result.count;
    } catch {
      return 0;
    }
  }

  /**
   * Build Prisma Invoice WhereInput for issued (non-draft, non-cancelled, non-deleted) invoices
   */
  getIssuedInvoicesWhere(dateFilters?: { startDate?: Date; endDate?: Date }): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = {
      isDeleted: false,
      status: { in: [...VALID_ISSUED_STATUSES] },
    };

    if (dateFilters?.startDate || dateFilters?.endDate) {
      where.issueDate = {
        ...(dateFilters.startDate ? { gte: dateFilters.startDate } : {}),
        ...(dateFilters.endDate ? { lte: dateFilters.endDate } : {}),
      };
    }

    return where;
  }

  /**
   * Calculate high-level financial KPIs using standard accounting formulas
   */
  async calculateKPIs(dateFilters?: { startDate?: Date; endDate?: Date }): Promise<FinancialKPIs> {
    // 1. First sync any invoices whose due dates have passed
    await this.syncOverdueStatuses();

    const now = new Date();
    const issuedWhere = this.getIssuedInvoicesWhere(dateFilters);

    // Overdue condition: issued invoice with balanceDue > 0 AND (status == OVERDUE OR dueDate < now)
    const overdueWhere: Prisma.InvoiceWhereInput = {
      isDeleted: false,
      balanceDue: { gt: 0 },
      OR: [
        { status: "OVERDUE" },
        {
          dueDate: { lt: now },
          status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID"] },
        },
      ],
      ...(dateFilters?.startDate || dateFilters?.endDate
        ? {
            issueDate: {
              ...(dateFilters.startDate ? { gte: dateFilters.startDate } : {}),
              ...(dateFilters.endDate ? { lte: dateFilters.endDate } : {}),
            },
          }
        : {}),
    };

    const expenseWhere: Prisma.ExpenseWhereInput = {
      isDeleted: false,
      ...(dateFilters?.startDate || dateFilters?.endDate
        ? {
            expenseDate: {
              ...(dateFilters.startDate ? { gte: dateFilters.startDate } : {}),
              ...(dateFilters.endDate ? { lte: dateFilters.endDate } : {}),
            },
          }
        : {}),
    };

    const [
      issuedAgg,
      overdueAgg,
      overdueCount,
      totalInvoices,
      totalClients,
      expenseAgg,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: issuedWhere,
        _sum: {
          total: true,
          amountPaid: true,
          balanceDue: true,
        },
      }),
      prisma.invoice.aggregate({
        where: overdueWhere,
        _sum: {
          balanceDue: true,
        },
      }),
      prisma.invoice.count({
        where: overdueWhere,
      }),
      prisma.invoice.count({
        where: { isDeleted: false },
      }),
      prisma.client.count({
        where: { isDeleted: false, status: "ACTIVE" },
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: {
          totalAmount: true,
          amount: true,
        },
      }),
    ]);

    const revenue = Math.round((issuedAgg._sum.total || 0) * 100) / 100;
    const paid = Math.round((issuedAgg._sum.amountPaid || 0) * 100) / 100;
    const outstanding = Math.round((issuedAgg._sum.balanceDue || 0) * 100) / 100;
    const overdue = Math.round((overdueAgg._sum.balanceDue || 0) * 100) / 100;
    const expenses = Math.round((expenseAgg._sum.totalAmount || expenseAgg._sum.amount || 0) * 100) / 100;
    const profit = Math.round((revenue - expenses) * 100) / 100;

    return {
      revenue,
      paid,
      outstanding,
      overdue,
      overdueCount,
      invoices: totalInvoices,
      clients: totalClients,
      expenses,
      profit,
    };
  }

  /**
   * Calculate monthly financial trend points for charts
   */
  calculateMonthlyFinancialTrend(
    invoices: Array<{ total: number; status: string; issueDate: Date }>,
    expenses: Array<{ amount: number; date: Date }>
  ): MonthlyFinancialPoint[] {
    if (invoices.length === 0 && expenses.length === 0) {
      return [];
    }

    const monthMap = new Map<string, { revenue: number; expenses: number }>();

    for (const inv of invoices) {
      if ((VALID_ISSUED_STATUSES as readonly string[]).includes(inv.status)) {
        const monthKey = inv.issueDate.toLocaleString("en-US", { month: "short" });
        const current = monthMap.get(monthKey) || { revenue: 0, expenses: 0 };
        current.revenue += inv.total;
        monthMap.set(monthKey, current);
      }
    }

    for (const exp of expenses) {
      const monthKey = exp.date.toLocaleString("en-US", { month: "short" });
      const current = monthMap.get(monthKey) || { revenue: 0, expenses: 0 };
      current.expenses += exp.amount;
      monthMap.set(monthKey, current);
    }

    const points: MonthlyFinancialPoint[] = [];
    monthMap.forEach((val, key) => {
      const revenue = Math.round(val.revenue * 100) / 100;
      const expensesVal = Math.round(val.expenses * 100) / 100;
      points.push({
        month: key,
        revenue,
        expenses: expensesVal,
        profit: Math.round((revenue - expensesVal) * 100) / 100,
      });
    });

    return points;
  }
}

export const analyticsService = new AnalyticsService();
