export interface SystemSettings {
  id: string;

  // Company Preferences
  companyName: string;
  logoUrl?: string | null;
  businessEmail: string;
  phone: string;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;

  // Invoice Preferences
  invoicePrefix: string;
  quotationPrefix: string;
  creditNotePrefix: string;
  receiptPrefix: string;
  includeYearInNumber: boolean;
  numberSeparator: string;
  startingNumber: number;
  zeroPaddingLength: number;
  defaultPaymentTerms: string;
  defaultDueDays: number;
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  decimalPrecision: number;

  // Email Preferences
  senderName: string;
  senderEmail: string;
  replyToEmail?: string | null;
  emailSignature?: string | null;
  defaultEmailFooter?: string | null;

  // Reminder Preferences
  autoReminderEnabled: boolean;
  reminderBeforeDueDays: number;
  reminderAfterDueDays: number;
  reminderFrequencyDays: number;

  // Appearance Preferences
  theme: "light" | "dark" | "system";
  defaultTablePageSize: number;
  defaultDashboardPage: string;
  defaultLanguage: string;

  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

export type SettingsSection = "company" | "invoice" | "email" | "reminders" | "appearance";

export interface GetSettingsApiResponse {
  success: boolean;
  data: SystemSettings;
}

export interface UpdateSettingsApiResponse {
  success: boolean;
  message: string;
  data: SystemSettings;
}
