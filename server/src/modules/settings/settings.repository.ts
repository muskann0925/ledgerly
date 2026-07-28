import { prisma } from "../../lib/prisma";
import { SettingsSection } from "./settings.types";

const DEFAULT_SETTINGS_ID = "default";

const INITIAL_DEFAULTS = {
  // Company
  companyName: "Ledgerly Billing Corp",
  logoUrl: null,
  businessEmail: "billing@ledgerly.io",
  phone: "+91 98765 43210",
  website: "https://ledgerly.io",
  address: "123 Financial District, Tech Hub",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  postalCode: "560001",
  gstNumber: "29AAAAA0000A1Z5",
  panNumber: "AAAAA0000A",

  // Invoice
  invoicePrefix: "INV",
  quotationPrefix: "QTN",
  creditNotePrefix: "CN",
  receiptPrefix: "RCT",
  includeYearInNumber: true,
  numberSeparator: "-",
  startingNumber: 1,
  zeroPaddingLength: 6,
  defaultPaymentTerms: "Payment is due within 14 days of issue.",
  defaultDueDays: 14,
  defaultCurrency: "INR",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "en-IN",
  decimalPrecision: 2,

  // Email
  senderName: "Ledgerly Billing System",
  senderEmail: "billing@ledgerly.io",
  replyToEmail: "support@ledgerly.io",
  emailSignature: "Best regards,\nFinance & Accounts Team\nLedgerly Corp",
  defaultEmailFooter: "Thank you for your business. For billing queries, reply directly to this email.",

  // Reminders
  autoReminderEnabled: true,
  reminderBeforeDueDays: 3,
  reminderAfterDueDays: 3,
  reminderFrequencyDays: 7,

  // Appearance
  theme: "system",
  defaultTablePageSize: 10,
  defaultDashboardPage: "/dashboard",
  defaultLanguage: "en",
};

export class SettingsRepository {
  private cache: any = null;

  async getSettings() {
    if (this.cache) {
      return this.cache;
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: DEFAULT_SETTINGS_ID,
          ...INITIAL_DEFAULTS,
        },
      });
    }

    this.cache = settings;
    return settings;
  }

  async updateSettings(data: Record<string, any>, updatedBy?: string) {
    const updated = await prisma.systemSettings.upsert({
      where: { id: DEFAULT_SETTINGS_ID },
      update: {
        ...data,
        updatedBy: updatedBy || null,
      },
      create: {
        id: DEFAULT_SETTINGS_ID,
        ...INITIAL_DEFAULTS,
        ...data,
        updatedBy: updatedBy || null,
      },
    });

    this.cache = updated;
    return updated;
  }

  async resetSection(section: SettingsSection, updatedBy?: string) {
    let resetFields: Record<string, any> = {};

    switch (section) {
      case "company":
        resetFields = {
          companyName: INITIAL_DEFAULTS.companyName,
          logoUrl: INITIAL_DEFAULTS.logoUrl,
          businessEmail: INITIAL_DEFAULTS.businessEmail,
          phone: INITIAL_DEFAULTS.phone,
          website: INITIAL_DEFAULTS.website,
          address: INITIAL_DEFAULTS.address,
          city: INITIAL_DEFAULTS.city,
          state: INITIAL_DEFAULTS.state,
          country: INITIAL_DEFAULTS.country,
          postalCode: INITIAL_DEFAULTS.postalCode,
          gstNumber: INITIAL_DEFAULTS.gstNumber,
          panNumber: INITIAL_DEFAULTS.panNumber,
        };
        break;
      case "invoice":
        resetFields = {
          invoicePrefix: INITIAL_DEFAULTS.invoicePrefix,
          quotationPrefix: INITIAL_DEFAULTS.quotationPrefix,
          creditNotePrefix: INITIAL_DEFAULTS.creditNotePrefix,
          receiptPrefix: INITIAL_DEFAULTS.receiptPrefix,
          includeYearInNumber: INITIAL_DEFAULTS.includeYearInNumber,
          numberSeparator: INITIAL_DEFAULTS.numberSeparator,
          startingNumber: INITIAL_DEFAULTS.startingNumber,
          zeroPaddingLength: INITIAL_DEFAULTS.zeroPaddingLength,
          defaultPaymentTerms: INITIAL_DEFAULTS.defaultPaymentTerms,
          defaultDueDays: INITIAL_DEFAULTS.defaultDueDays,
          defaultCurrency: INITIAL_DEFAULTS.defaultCurrency,
          timezone: INITIAL_DEFAULTS.timezone,
          dateFormat: INITIAL_DEFAULTS.dateFormat,
          numberFormat: INITIAL_DEFAULTS.numberFormat,
          decimalPrecision: INITIAL_DEFAULTS.decimalPrecision,
        };
        break;
      case "email":
        resetFields = {
          senderName: INITIAL_DEFAULTS.senderName,
          senderEmail: INITIAL_DEFAULTS.senderEmail,
          replyToEmail: INITIAL_DEFAULTS.replyToEmail,
          emailSignature: INITIAL_DEFAULTS.emailSignature,
          defaultEmailFooter: INITIAL_DEFAULTS.defaultEmailFooter,
        };
        break;
      case "reminders":
        resetFields = {
          autoReminderEnabled: INITIAL_DEFAULTS.autoReminderEnabled,
          reminderBeforeDueDays: INITIAL_DEFAULTS.reminderBeforeDueDays,
          reminderAfterDueDays: INITIAL_DEFAULTS.reminderAfterDueDays,
          reminderFrequencyDays: INITIAL_DEFAULTS.reminderFrequencyDays,
        };
        break;
      case "appearance":
        resetFields = {
          theme: INITIAL_DEFAULTS.theme,
          defaultTablePageSize: INITIAL_DEFAULTS.defaultTablePageSize,
          defaultDashboardPage: INITIAL_DEFAULTS.defaultDashboardPage,
          defaultLanguage: INITIAL_DEFAULTS.defaultLanguage,
        };
        break;
    }

    return this.updateSettings(resetFields, updatedBy);
  }

  clearCache() {
    this.cache = null;
  }
}

export const settingsRepository = new SettingsRepository();
