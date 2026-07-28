export interface UpdateCompanySettingsDto {
  companyName?: string;
  logoUrl?: string | null;
  businessEmail?: string;
  phone?: string;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
}

export interface UpdateInvoiceSettingsDto {
  invoicePrefix?: string;
  quotationPrefix?: string;
  creditNotePrefix?: string;
  receiptPrefix?: string;
  includeYearInNumber?: boolean;
  numberSeparator?: string;
  startingNumber?: number;
  zeroPaddingLength?: number;
  defaultPaymentTerms?: string;
  defaultDueDays?: number;
  defaultCurrency?: string;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
  decimalPrecision?: number;
}

export interface UpdateEmailSettingsDto {
  senderName?: string;
  senderEmail?: string;
  replyToEmail?: string | null;
  emailSignature?: string | null;
  defaultEmailFooter?: string | null;
}

export interface UpdateReminderSettingsDto {
  autoReminderEnabled?: boolean;
  reminderBeforeDueDays?: number;
  reminderAfterDueDays?: number;
  reminderFrequencyDays?: number;
}

export interface UpdateAppearanceSettingsDto {
  theme?: string;
  defaultTablePageSize?: number;
  defaultDashboardPage?: string;
  defaultLanguage?: string;
}

export type SettingsSection = "company" | "invoice" | "email" | "reminders" | "appearance";
