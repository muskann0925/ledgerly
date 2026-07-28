import { dashboardRepository, DashboardRepository } from "./dashboard.repository";
import { analyticsService } from "../analytics/analytics.service";
import type {
  DashboardMetrics,
  ActivityLogItem,
  UpcomingInvoiceItem,
  RevenueChartPoint,
  InvoiceChartPoint,
  DashboardInvoiceItem,
  OutstandingAgingBreakdown,
} from "./dashboard.types";

export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository = dashboardRepository
  ) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // 1. Parallel database aggregation queries
    const [
      revenue,
      outstanding,
      paid,
      overdue,
      invoices,
      clients,
      expenses,
      rawActivities,
      rawUpcomingInvoices,
      rawInvoiceAnalytics,
      rawExpenseAnalytics,
      rawRecentInvoices,
      rawOutstandingInvoices,
      taxSums,
    ] = await Promise.all([
      this.repository.getRevenueSum(),
      this.repository.getOutstandingSum(),
      this.repository.getPaidSum(),
      this.repository.getOverdueSum(),
      this.repository.getInvoicesCount(),
      this.repository.getClientsCount(),
      this.repository.getExpensesSum(),
      this.repository.getRecentActivities(),
      this.repository.getUpcomingDueInvoices(),
      this.repository.getInvoicesForAnalytics(),
      this.repository.getExpensesForAnalytics(),
      this.repository.getRecentInvoices(50),
      this.repository.getOutstandingInvoices(),
      this.repository.getTaxSums(),
    ]);

    // 2. Net profit calculation
    const profit = revenue - expenses;

    // 3. Process Recent Activity (mapped from AuditLog records)
    const recentActivity: ActivityLogItem[] = rawActivities.map(
      (act: any) => ({
        id: act.id,
        title: act.action ? `${act.module || "SYSTEM"}: ${act.action}` : "System Event",
        description: act.description,
        time: this.formatRelativeTime(act.createdAt),
        type: act.status === "FAILED" ? "WARNING" : "INFO",
      })
    );

    // 4. Process Upcoming & Overdue Invoices (return [] if no database records)
    const upcomingDueInvoices: UpcomingInvoiceItem[] = rawUpcomingInvoices.map(
      (inv: { number: string; total: number; balanceDue: number; dueDate: Date; client?: { companyName: string; contactPerson: string; email: string } | null }) => {
        const daysLeft = Math.ceil(
          (inv.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        let dueDateText = "";
        let badgeColor = "";

        if (daysLeft < 0) {
          const overdueDays = Math.abs(daysLeft);
          dueDateText = overdueDays === 1 ? "Overdue (1 day)" : `Overdue (${overdueDays} days)`;
          badgeColor = "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/50";
        } else if (daysLeft === 0) {
          dueDateText = "Due Today";
          badgeColor = "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/50";
        } else {
          dueDateText = `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
          badgeColor =
            daysLeft <= 2
              ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50"
              : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-900/50";
        }

        return {
          id: inv.number,
          client: inv.client?.companyName || inv.client?.contactPerson || "Unknown Client",
          amount: `₹${inv.balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          dueDate: dueDateText,
          badgeColor,
        };
      }
    );

    // 5. Process Recent Invoices from real DB
    const statusMap: Record<string, "Paid" | "Pending" | "Overdue" | "Draft"> = {
      PAID: "Paid",
      PENDING: "Pending",
      SENT: "Pending",
      VIEWED: "Pending",
      PARTIALLY_PAID: "Pending",
      OVERDUE: "Overdue",
      DRAFT: "Draft",
      CANCELLED: "Draft",
      REFUNDED: "Draft",
    };

    const recentInvoices: DashboardInvoiceItem[] = rawRecentInvoices.map(
      (inv: {
        id: string;
        number: string;
        total: number;
        issueDate: Date;
        dueDate: Date;
        status: string;
        client?: { companyName: string; contactPerson: string; email: string } | null;
      }) => ({
        id: inv.id,
        number: inv.number,
        client: inv.client?.companyName || inv.client?.contactPerson || "Unknown Client",
        clientEmail: inv.client?.email || "N/A",
        amount: inv.total,
        issueDate: inv.issueDate.toISOString().slice(0, 10),
        dueDate: inv.dueDate.toISOString().slice(0, 10),
        status: statusMap[inv.status] || "Pending",
      })
    );

    // 6. Process Real Aging Breakdown from DB
    const now = new Date();
    let current030 = 0;
    let days3160 = 0;
    let days6190 = 0;
    let days90Plus = 0;

    for (const inv of rawOutstandingInvoices) {
      const daysDiff = Math.floor((now.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24));
      const val = inv.balanceDue;
      if (daysDiff <= 30) {
        current030 += val;
      } else if (daysDiff <= 60) {
        days3160 += val;
      } else if (daysDiff <= 90) {
        days6190 += val;
      } else {
        days90Plus += val;
      }
    }

    const totalReceivable = current030 + days3160 + days6190 + days90Plus;

    const outstandingAging: OutstandingAgingBreakdown = {
      totalReceivable,
      buckets: [
        {
          label: "Current (0-30 Days)",
          amount: current030,
          percentage: totalReceivable > 0 ? Math.round((current030 / totalReceivable) * 100) : 0,
          color: "bg-emerald-500",
        },
        {
          label: "31-60 Days",
          amount: days3160,
          percentage: totalReceivable > 0 ? Math.round((days3160 / totalReceivable) * 100) : 0,
          color: "bg-amber-500",
        },
        {
          label: "61-90 Days",
          amount: days6190,
          percentage: totalReceivable > 0 ? Math.round((days6190 / totalReceivable) * 100) : 0,
          color: "bg-orange-500",
        },
        {
          label: "90+ Days Overdue",
          amount: days90Plus,
          percentage: totalReceivable > 0 ? Math.round((days90Plus / totalReceivable) * 100) : 0,
          color: "bg-red-500",
        },
      ],
    };

    // 7. Build Revenue & Invoice Charts
    const revenueChart = this.buildRevenueChart(rawInvoiceAnalytics, rawExpenseAnalytics);
    const invoiceChart = this.buildInvoiceChart(rawInvoiceAnalytics);

    return {
      revenue,
      outstanding,
      paid,
      overdue,
      invoices,
      clients,
      expenses,
      profit,
      taxCollected: taxSums.taxCollected,
      taxDeducted: taxSums.taxDeducted,
      gstSummary: taxSums.gstSummary,
      monthlyTaxTrend: taxSums.monthlyTaxTrend,
      recentActivity,
      upcomingDueInvoices,
      recentInvoices,
      outstandingAging,
      revenueChart,
      invoiceChart,
    };
  }

  async exportInvoicesCsv(): Promise<string> {
    const rawInvoices = await this.repository.getAllInvoicesForExport();

    const headers = ["Invoice Number", "Client Name", "Client Email", "Issue Date", "Due Date", "Total (INR)", "Balance Due (INR)", "Status"];
    const rows = rawInvoices.map(
      (inv: {
        number: string;
        total: number;
        balanceDue: number;
        issueDate: Date;
        dueDate: Date;
        status: string;
        client?: { companyName: string; contactPerson: string; email: string } | null;
      }) => [
        inv.number,
        `"${(inv.client?.companyName || inv.client?.contactPerson || "Unknown Client").replace(/"/g, '""')}"`,
        inv.client?.email || "",
        inv.issueDate.toISOString().slice(0, 10),
        inv.dueDate.toISOString().slice(0, 10),
        inv.total.toFixed(2),
        inv.balanceDue.toFixed(2),
        inv.status,
      ]
    );

    return [headers.join(","), ...rows.map((row: (string | number)[]) => row.join(","))].join("\n");
  }

  async exportDashboardAnalyticsCsv(): Promise<string> {
    const metrics = await this.getDashboardMetrics();

    const summaryHeaders = ["Metric", "Value"];
    const summaryRows = [
      ["Gross Billing Revenue (INR)", metrics.revenue.toFixed(2)],
      ["Accounts Receivable Outstanding (INR)", metrics.outstanding.toFixed(2)],
      ["Total Payments Cleared (INR)", metrics.paid.toFixed(2)],
      ["Total Overdue Balance (INR)", metrics.overdue.toFixed(2)],
      ["Total Issued Invoices Count", String(metrics.invoices)],
      ["Total Active Clients Count", String(metrics.clients)],
      ["Total Operational Expenses (INR)", metrics.expenses.toFixed(2)],
      ["Net Profit (INR)", metrics.profit.toFixed(2)],
    ];

    const agingHeaders = ["Aging Bucket", "Amount (INR)", "Percentage (%)"];
    const agingRows = metrics.outstandingAging.buckets.map((b) => [
      `"${b.label}"`,
      b.amount.toFixed(2),
      `${b.percentage}%`,
    ]);

    const revenueChartHeaders = ["Month", "Revenue (INR)", "Expenses (INR)", "Profit (INR)"];
    const revenueChartRows = metrics.revenueChart.map((c) => [
      c.month,
      c.revenue.toFixed(2),
      c.expenses.toFixed(2),
      c.profit.toFixed(2),
    ]);

    const content = [
      "=== DASHBOARD FINANCIAL METRICS SUMMARY ===",
      summaryHeaders.join(","),
      ...summaryRows.map((r) => r.join(",")),
      "",
      "=== ACCOUNTS RECEIVABLE AGING BREAKDOWN ===",
      agingHeaders.join(","),
      ...agingRows.map((r) => r.join(",")),
      "",
      "=== MONTHLY FINANCIAL PERFORMANCE TREND ===",
      revenueChartHeaders.join(","),
      ...revenueChartRows.map((r) => r.join(",")),
    ].join("\n");

    return content;
  }

  private buildRevenueChart(
    invoices: Array<{ total: number; status: string; issueDate: Date }>,
    expenses: Array<{ amount: number; date: Date }>
  ): RevenueChartPoint[] {
    return analyticsService.calculateMonthlyFinancialTrend(invoices, expenses);
  }

  private buildInvoiceChart(
    invoices: Array<{ total: number; status: string; issueDate: Date }>
  ): InvoiceChartPoint[] {
    if (invoices.length === 0) {
      return [];
    }

    const monthMap = new Map<string, { paid: number; outstanding: number; overdue: number }>();

    for (const inv of invoices) {
      const monthKey = inv.issueDate.toLocaleString("en-US", { month: "short" });
      const current = monthMap.get(monthKey) || { paid: 0, outstanding: 0, overdue: 0 };

      if (inv.status === "PAID") {
        current.paid += 1;
      } else if (["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID", "DRAFT"].includes(inv.status)) {
        current.outstanding += 1;
      } else if (inv.status === "OVERDUE") {
        current.overdue += 1;
      }

      monthMap.set(monthKey, current);
    }

    const chartPoints: InvoiceChartPoint[] = [];
    monthMap.forEach((val, key) => {
      chartPoints.push({
        month: key,
        paid: val.paid,
        outstanding: val.outstanding,
        overdue: val.overdue,
      });
    });

    return chartPoints;
  }

  private formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

export const dashboardService = new DashboardService();
