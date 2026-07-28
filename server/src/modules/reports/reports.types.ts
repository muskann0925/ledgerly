import { InvoiceStatus, PaymentMethod, ExpenseStatus } from "@prisma/client";

export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export interface ReportFilterQuery {
  startDate?: string;
  endDate?: string;
  period?: ReportPeriod;
  clientId?: string;
  status?: InvoiceStatus;
  paymentStatus?: "PAID" | "PENDING" | "OVERDUE" | "PARTIALLY_PAID";
  paymentMethod?: PaymentMethod;
  categoryId?: string;
  vendorId?: string;
  taxRate?: number;
  currency?: string;
}

// ==========================================
// Dashboard Summary Analytics
// ==========================================
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
  collectionRate: number; // percentage %
  revenueGrowthRate: number; // percentage % vs prior period
  expenseGrowthRate: number; // percentage % vs prior period
  netProfitMargin: number; // percentage %
}

// ==========================================
// Revenue Analytics
// ==========================================
export interface RevenueTrendPoint {
  periodLabel: string; // e.g. "2026-07-25" or "Jul 2026" or "Q3 2026"
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
  paymentMethod: PaymentMethod;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface RevenueByStatus {
  status: InvoiceStatus;
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

// ==========================================
// Invoice Analytics & Aging Buckets
// ==========================================
export interface InvoiceAgingBucket {
  bucketLabel: string; // "Current (0-30 days)", "31-60 days", "61-90 days", "90+ days"
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

// ==========================================
// Tax Analytics & Liability
// ==========================================
export interface TaxByRate {
  taxRate: number;
  taxCollected: number;
  taxableInvoiceSubtotal: number;
  invoiceCount: number;
}

export interface TaxByTypeBreakdown {
  taxCode: string;
  taxName: string;
  type: string;
  calculationType: "ADD" | "DEDUCT";
  totalAmount: number;
  invoiceCount: number;
}

export interface PeriodTaxSummary {
  periodLabel: string; // e.g., "2026-07" or "2026-Q3" or "2026"
  totalAdditiveTax: number;
  totalDeductionTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  tds: number;
  vat: number;
  custom: number;
  netPayable: number;
}

export interface FullTaxReport {
  summary: {
    taxCollected: number; // Additive taxes collected
    taxDeducted: number;  // Deduction taxes (e.g. TDS)
    taxPaid: number;      // from Operating Expenses
    netTaxLiability: number; // Tax Collected - Tax Paid
    inclusiveTaxAmount: number;
    exclusiveTaxAmount: number;
  };
  taxByRate: TaxByRate[];
  taxByType: TaxByTypeBreakdown[];
  monthlyTaxSummary: PeriodTaxSummary[];
  quarterlyTaxSummary: PeriodTaxSummary[];
  yearlyTaxSummary: PeriodTaxSummary[];
  monthlyTaxTrend: {
    yearMonth: string;
    monthName: string;
    taxCollected: number;
    taxDeducted: number;
    taxPaid: number;
    netLiability: number;
  }[];
}

// ==========================================
// Profit & Loss (P&L) Analytics
// ==========================================
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

// ==========================================
// Client Analytics
// ==========================================
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

// ==========================================
// Export DTO
// ==========================================
export interface ExportReportQuery extends ReportFilterQuery {
  reportType: "revenue" | "invoices" | "tax" | "profit-loss" | "expenses" | "clients";
  format: "pdf" | "excel" | "csv";
}
