import { settingsRepository, SettingsRepository } from "./settings.repository";
import {
  UpdateCompanySettingsDto,
  UpdateInvoiceSettingsDto,
  UpdateEmailSettingsDto,
  UpdateReminderSettingsDto,
  UpdateAppearanceSettingsDto,
  SettingsSection,
} from "./settings.types";
import {
  updateCompanySchema,
  updateInvoiceSchema,
  updateEmailSchema,
  updateReminderSchema,
  updateAppearanceSchema,
} from "./settings.validator";
import { auditLogService } from "../audit-logs/audit-log.service";
import { emailService } from "../../shared/email.service";

export class SettingsService {
  constructor(private readonly repository: SettingsRepository = settingsRepository) {}

  async getSettings() {
    return this.repository.getSettings();
  }

  async updateCompany(dto: UpdateCompanySettingsDto, updatedBy?: string) {
    const validated = updateCompanySchema.parse(dto);
    const existing = await this.repository.getSettings();
    const updated = await this.repository.updateSettings(validated, updatedBy);

    await auditLogService.logAction({
      userId: updatedBy,
      action: "UPDATE_SETTINGS",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: "Company Details",
      description: `Updated company profile details in system settings`,
      oldValue: { companyName: existing.companyName, businessEmail: existing.businessEmail, phone: existing.phone },
      newValue: { companyName: updated.companyName, businessEmail: updated.businessEmail, phone: updated.phone },
      status: "SUCCESS",
    });

    return updated;
  }

  async updateInvoicePreferences(dto: UpdateInvoiceSettingsDto, updatedBy?: string) {
    const validated = updateInvoiceSchema.parse(dto);
    const existing = await this.repository.getSettings();
    const updated = await this.repository.updateSettings(validated, updatedBy);

    await auditLogService.logAction({
      userId: updatedBy,
      action: "UPDATE_SETTINGS",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: "Invoice Preferences",
      description: `Updated invoice preferences (prefix '${updated.invoicePrefix}', terms, due days)`,
      oldValue: { invoicePrefix: existing.invoicePrefix, defaultDueDays: existing.defaultDueDays },
      newValue: { invoicePrefix: updated.invoicePrefix, defaultDueDays: updated.defaultDueDays },
      status: "SUCCESS",
    });

    return updated;
  }

  async updateEmailPreferences(dto: UpdateEmailSettingsDto, updatedBy?: string) {
    const validated = updateEmailSchema.parse(dto);
    const updated = await this.repository.updateSettings(validated, updatedBy);

    await auditLogService.logAction({
      userId: updatedBy,
      action: "UPDATE_SETTINGS",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: "Email Settings",
      description: `Updated email sender preferences and template settings`,
      status: "SUCCESS",
    });

    return updated;
  }

  async updateReminderPreferences(dto: UpdateReminderSettingsDto, updatedBy?: string) {
    const validated = updateReminderSchema.parse(dto);
    const updated = await this.repository.updateSettings(validated, updatedBy);

    await auditLogService.logAction({
      userId: updatedBy,
      action: "UPDATE_SETTINGS",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: "Reminder Preferences",
      description: `Updated automated invoice reminder configuration`,
      status: "SUCCESS",
    });

    return updated;
  }

  async updateAppearancePreferences(dto: UpdateAppearanceSettingsDto, updatedBy?: string) {
    const validated = updateAppearanceSchema.parse(dto);
    const updated = await this.repository.updateSettings(validated, updatedBy);

    await auditLogService.logAction({
      userId: updatedBy,
      action: "UPDATE_SETTINGS",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: "Appearance Preferences",
      description: `Updated system appearance preferences (theme '${updated.theme}')`,
      status: "SUCCESS",
    });

    return updated;
  }

  async resetSection(section: SettingsSection, updatedBy?: string) {
    const validSections: SettingsSection[] = ["company", "invoice", "email", "reminders", "appearance"];
    if (!validSections.includes(section)) {
      throw new Error(`Invalid settings section '${section}'`);
    }
    const updated = await this.repository.resetSection(section, updatedBy);

    await auditLogService.logAction({
      userId: updatedBy,
      action: "RESET_SETTINGS",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: section,
      description: `Reset settings section '${section}' to system defaults`,
      status: "SUCCESS",
    });

    return updated;
  }

  async sendTestEmail(toEmail: string, actorUserId?: string) {
    const targetEmail = toEmail ? toEmail.trim() : (await this.repository.getSettings()).senderEmail;
    await emailService.sendTestEmail(targetEmail);

    await auditLogService.logAction({
      userId: actorUserId,
      action: "TEST_EMAIL",
      module: "SETTINGS",
      entityType: "SystemSettings",
      entityId: "default",
      entityName: "Email Settings",
      description: `Dispatched test email to '${targetEmail}' via SMTP`,
      status: "SUCCESS",
    });

    return {
      success: true,
      message: `Test email successfully sent to ${targetEmail}`,
    };
  }
}

export const settingsService = new SettingsService();
