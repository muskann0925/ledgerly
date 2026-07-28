import { apiClient } from "../../../lib/axios";

export interface ActivityLogItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: string;
}

export interface UpcomingInvoiceItem {
  id: string;
  client: string;
  amount: string;
  dueDate: string;
  badgeColor?: string;
}

export interface RevenueChartPoint {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface InvoiceChartPoint {
  month: string;
  paid: number;
  outstanding: number;
  overdue: number;
}

export interface DashboardInvoiceItem {
  id: string;
  number: string;
  client: string;
  clientEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
}

export interface AgingBucketItem {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface OutstandingAgingBreakdown {
  totalReceivable: number;
  buckets: AgingBucketItem[];
}

export interface DashboardMetrics {
  revenue: number;
  outstanding: number;
  paid: number;
  overdue: number;
  invoices: number;
  clients: number;
  expenses: number;
  profit: number;
  recentActivity: ActivityLogItem[];
  upcomingDueInvoices: UpcomingInvoiceItem[];
  recentInvoices: DashboardInvoiceItem[];
  outstandingAging: OutstandingAgingBreakdown;
  revenueChart: RevenueChartPoint[];
  invoiceChart: InvoiceChartPoint[];
}

export const fetchDashboardMetricsApi = async (): Promise<DashboardMetrics> => {
  const response = await apiClient.get<{
    success: boolean;
    data: DashboardMetrics;
  }>("/dashboard");
  return response.data.data;
};

export const exportAnalyticsCsvApi = async (): Promise<Blob> => {
  const response = await apiClient.get("/dashboard/export/analytics/csv", {
    responseType: "blob",
  });
  return response.data;
};

export const exportInvoicesCsvApi = async (): Promise<Blob> => {
  const response = await apiClient.get("/dashboard/export/csv", {
    responseType: "blob",
  });
  return response.data;
};
