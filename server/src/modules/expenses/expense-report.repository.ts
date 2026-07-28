import { prisma } from "../../lib/prisma";
import type { Prisma, ExpenseStatus } from "@prisma/client";
import type {
  ReportDateFilter,
  ExpenseTotalReport,
  CategoryExpenseReport,
  VendorExpenseReport,
  MonthlyTrendReport,
  TaxSummaryReport,
  DashboardSummaryReport,
} from "./expense.types";

export class ExpenseReportRepository {
  private buildWhereClause(filters: ReportDateFilter): Prisma.ExpenseWhereInput {
    return {
      isDeleted: false,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            expenseDate: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
    };
  }

  /**
   * Get Total Expenses Overview
   */
  async getTotalExpenses(filters: ReportDateFilter): Promise<ExpenseTotalReport> {
    const where = this.buildWhereClause(filters);

    const [aggregations, statusGroups] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: {
          totalAmount: true,
          taxAmount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          totalAmount: true,
        },
      }),
      prisma.expense.groupBy({
        by: ["status"],
        where,
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    let paidAmount = 0;
    let pendingAmount = 0;
    let cancelledAmount = 0;

    statusGroups.forEach((group) => {
      const sum = group._sum.totalAmount || 0;
      if (group.status === "PAID") paidAmount = sum;
      if (group.status === "PENDING") pendingAmount = sum;
      if (group.status === "CANCELLED") cancelledAmount = sum;
    });

    const totalAmount = aggregations._sum.totalAmount || 0;
    const totalTaxAmount = aggregations._sum.taxAmount || 0;
    const totalCount = aggregations._count.id || 0;
    const averageAmount = aggregations._avg.totalAmount || 0;

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      cancelledAmount,
      totalTaxAmount,
      totalCount,
      averageAmount: Math.round(averageAmount * 100) / 100,
    };
  }

  /**
   * Expenses breakdown by Category
   */
  async getExpensesByCategory(filters: ReportDateFilter): Promise<CategoryExpenseReport[]> {
    const where = this.buildWhereClause(filters);

    const [groups, totalAggregation] = await Promise.all([
      prisma.expense.groupBy({
        by: ["categoryId"],
        where,
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalAmount: "desc",
          },
        },
      }),
      prisma.expense.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
    ]);

    const totalOverallAmount = totalAggregation._sum.totalAmount || 1;

    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: { in: groups.map((g) => g.categoryId) },
      },
      select: { id: true, name: true, color: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return groups.map((group) => {
      const category = categoryMap.get(group.categoryId);
      const totalAmount = group._sum.totalAmount || 0;
      const count = group._count.id || 0;
      const percentage = Math.round((totalAmount / totalOverallAmount) * 10000) / 100;

      return {
        categoryId: group.categoryId,
        categoryName: category?.name || "Uncategorized",
        categoryColor: category?.color || null,
        totalAmount,
        count,
        percentage,
      };
    });
  }

  /**
   * Expenses breakdown by Vendor
   */
  async getExpensesByVendor(filters: ReportDateFilter): Promise<VendorExpenseReport[]> {
    const where = this.buildWhereClause(filters);

    const [groups, totalAggregation] = await Promise.all([
      prisma.expense.groupBy({
        by: ["vendorId"],
        where,
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalAmount: "desc",
          },
        },
      }),
      prisma.expense.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
    ]);

    const totalOverallAmount = totalAggregation._sum.totalAmount || 1;

    const vendorIds = groups.map((g) => g.vendorId).filter((id): id is string => Boolean(id));
    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, name: true },
    });

    const vendorMap = new Map(vendors.map((v) => [v.id, v]));

    return groups.map((group) => {
      const vendor = group.vendorId ? vendorMap.get(group.vendorId) : null;
      const totalAmount = group._sum.totalAmount || 0;
      const count = group._count.id || 0;
      const percentage = Math.round((totalAmount / totalOverallAmount) * 10000) / 100;

      return {
        vendorId: group.vendorId,
        vendorName: vendor?.name || "No Vendor / Direct Expense",
        totalAmount,
        count,
        percentage,
      };
    });
  }

  /**
   * Monthly Expense Trend
   */
  async getMonthlyTrend(filters: ReportDateFilter): Promise<MonthlyTrendReport[]> {
    const where = this.buildWhereClause(filters);

    const expenses = await prisma.expense.findMany({
      where,
      select: {
        expenseDate: true,
        totalAmount: true,
        taxAmount: true,
      },
      orderBy: {
        expenseDate: "asc",
      },
    });

    const monthlyMap = new Map<
      string,
      { totalAmount: number; taxAmount: number; count: number; dateObj: Date }
    >();

    expenses.forEach((expense) => {
      const d = new Date(expense.expenseDate);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      const current = monthlyMap.get(yearMonth) || {
        totalAmount: 0,
        taxAmount: 0,
        count: 0,
        dateObj: d,
      };

      current.totalAmount += expense.totalAmount;
      current.taxAmount += expense.taxAmount;
      current.count += 1;

      monthlyMap.set(yearMonth, current);
    });

    return Array.from(monthlyMap.entries()).map(([yearMonth, val]) => {
      const monthName = val.dateObj.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      return {
        yearMonth,
        monthName,
        totalAmount: Math.round(val.totalAmount * 100) / 100,
        taxAmount: Math.round(val.taxAmount * 100) / 100,
        count: val.count,
      };
    });
  }

  /**
   * Tax Summary Report
   */
  async getTaxSummary(filters: ReportDateFilter): Promise<TaxSummaryReport> {
    const where = this.buildWhereClause(filters);

    const [aggregations, typeGroups, rateGroups] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { taxAmount: true },
      }),
      prisma.expense.groupBy({
        by: ["isTaxInclusive"],
        where,
        _sum: { taxAmount: true },
      }),
      prisma.expense.groupBy({
        by: ["taxRate"],
        where,
        _sum: {
          taxAmount: true,
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          taxRate: "asc",
        },
      }),
    ]);

    const totalTaxPaid = aggregations._sum.taxAmount || 0;

    let inclusiveTaxAmount = 0;
    let exclusiveTaxAmount = 0;

    typeGroups.forEach((g) => {
      const sum = g._sum.taxAmount || 0;
      if (g.isTaxInclusive) inclusiveTaxAmount = sum;
      else exclusiveTaxAmount = sum;
    });

    const taxByRate = rateGroups.map((g) => ({
      taxRate: g.taxRate,
      taxAmount: Math.round((g._sum.taxAmount || 0) * 100) / 100,
      totalExpenseAmount: Math.round((g._sum.totalAmount || 0) * 100) / 100,
      count: g._count.id || 0,
    }));

    return {
      totalTaxPaid: Math.round(totalTaxPaid * 100) / 100,
      inclusiveTaxAmount: Math.round(inclusiveTaxAmount * 100) / 100,
      exclusiveTaxAmount: Math.round(exclusiveTaxAmount * 100) / 100,
      taxByRate,
    };
  }

  /**
   * Dashboard Summary API Endpoint
   */
  async getDashboardSummary(): Promise<DashboardSummaryReport> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const [
      currMonthAgg,
      lastMonthAgg,
      pendingAgg,
      paidAgg,
      topCategories,
      topVendors,
      recentExpenses,
    ] = await Promise.all([
      prisma.expense.aggregate({
        where: { isDeleted: false, expenseDate: { gte: startOfCurrentMonth } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: {
          isDeleted: false,
          expenseDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { isDeleted: false, status: "PENDING" as ExpenseStatus },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: { isDeleted: false, status: "PAID" as ExpenseStatus },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.getExpensesByCategory({
        startDate: startOfCurrentMonth.toISOString(),
      }),
      this.getExpensesByVendor({
        startDate: startOfCurrentMonth.toISOString(),
      }),
      prisma.expense.findMany({
        where: { isDeleted: false },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, color: true } },
          vendor: { select: { id: true, name: true } },
        },
      }),
    ]);

    const currAmount = currMonthAgg._sum.totalAmount || 0;
    const lastAmount = lastMonthAgg._sum.totalAmount || 0;

    let percentageChange = 0;
    if (lastAmount > 0) {
      percentageChange = Math.round(((currAmount - lastAmount) / lastAmount) * 10000) / 100;
    } else if (currAmount > 0) {
      percentageChange = 100;
    }

    return {
      currentMonth: {
        totalAmount: currAmount,
        count: currMonthAgg._count.id || 0,
        percentageChangeFromLastMonth: percentageChange,
      },
      pendingExpenses: {
        count: pendingAgg._count.id || 0,
        totalAmount: pendingAgg._sum.totalAmount || 0,
      },
      paidExpenses: {
        count: paidAgg._count.id || 0,
        totalAmount: paidAgg._sum.totalAmount || 0,
      },
      topCategories: topCategories.slice(0, 5),
      topVendors: topVendors.slice(0, 5),
      recentExpenses,
    };
  }
}
