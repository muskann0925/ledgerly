export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export interface ReportFilterQuery {
  startDate?: string;
  endDate?: string;
  period?: ReportPeriod;
  clientId?: string;
  status?: string;
  paymentStatus?: "PAID" | "PENDING" | "OVERDUE" | "PARTIALLY_PAID";
  paymentMethod?: string;
  categoryId?: string;
  vendorId?: string;
  taxRate?: number;
  currency?: string;
}

export interface DashboardMetricsReport {
  totalRevenue: number;
  totalInvoicesCount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  totalExpenses: number;
  netProfit: number;
  taxCollected: number;
  taxPaid: number;
  netTaxLiability: number;
  totalClientsCount: number;
  averageInvoiceValue: number;
  collectionRate: number;
  revenueGrowthRate: number;
  expenseGrowthRate: number;
  netProfitMargin: number;
}

export interface RevenueTrendPoint {
  periodLabel: string;
  dateKey: string;
  totalRevenue: number;
  paidRevenue: number;
  outstandingRevenue: number;
  invoiceCount: number;
}

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  email?: string | null;
  totalRevenue: number;
  paidRevenue: number;
  outstandingRevenue: number;
  invoiceCount: number;
}

export interface RevenueByPaymentMethod {
  paymentMethod: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface RevenueByStatus {
  status: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface FullRevenueReport {
  period: ReportPeriod;
  dateRange: { startDate?: string; endDate?: string };
  summary: {
    totalRevenue: number;
    paidAmount: number;
    outstandingAmount: number;
    totalInvoices: number;
  };
  trend: RevenueTrendPoint[];
  byClient: RevenueByClient[];
  byPaymentMethod: RevenueByPaymentMethod[];
  byStatus: RevenueByStatus[];
}

export interface InvoiceAgingBucket {
  bucketLabel: string;
  invoiceCount: number;
  totalOutstanding: number;
}

export interface InvoiceUpcomingDueSummary {
  dueToday: { count: number; totalAmount: number };
  dueThisWeek: { count: number; totalAmount: number };
  dueThisMonth: { count: number; totalAmount: number };
}

export interface FullInvoiceReport {
  summary: {
    totalInvoices: number;
    totalValue: number;
    averageInvoiceValue: number;
    statusBreakdown: Record<string, { count: number; totalAmount: number }>;
  };
  agingBuckets: InvoiceAgingBucket[];
  upcomingDue: InvoiceUpcomingDueSummary;
}

export interface TaxByRate {
  taxRate: number;
  taxCollected: number;
  taxableInvoiceSubtotal: number;
  invoiceCount: number;
}

export interface FullTaxReport {
  summary: {
    taxCollected: number;
    taxPaid: number;
    netTaxLiability: number;
    inclusiveTaxAmount: number;
    exclusiveTaxAmount: number;
  };
  taxByRate: TaxByRate[];
  monthlyTaxTrend: {
    yearMonth: string;
    monthName: string;
    taxCollected: number;
    taxPaid: number;
    netLiability: number;
  }[];
}

export interface ProfitAndLossReport {
  period: ReportPeriod;
  summary: {
    grossRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMarginPercentage: number;
  };
  monthlyPnlTrend: {
    yearMonth: string;
    monthName: string;
    revenue: number;
    expenses: number;
    netProfit: number;
    marginPercentage: number;
  }[];
}

export interface ClientPerformanceReport {
  summary: {
    totalClients: number;
    activeClients: number;
    topClientName: string;
    topClientRevenue: number;
  };
  topClients: {
    clientId: string;
    companyName: string;
    contactPerson: string;
    email: string;
    totalBilled: number;
    paidAmount: number;
    outstandingBalance: number;
    totalInvoices: number;
    lastInvoiceDate?: string | null;
  }[];
}

export interface ExportReportQuery extends ReportFilterQuery {
  reportType: "revenue" | "invoices" | "tax" | "profit-loss" | "expenses" | "clients";
  format: "pdf" | "excel" | "csv";
}
