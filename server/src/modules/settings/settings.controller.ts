import { Request, Response, NextFunction } from "express";
import { settingsService, SettingsService } from "./settings.service";
import { SettingsSection } from "./settings.types";

export class SettingsController {
  constructor(private readonly service: SettingsService = settingsService) {}

  getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.service.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.email || req.user?.userId;
      const updated = await this.service.updateCompany(req.body, updatedBy);
      res.status(200).json({
        success: true,
        message: "Company preferences updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.email || req.user?.userId;
      const updated = await this.service.updateInvoicePreferences(req.body, updatedBy);
      res.status(200).json({
        success: true,
        message: "Invoice preferences updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.email || req.user?.userId;
      const updated = await this.service.updateEmailPreferences(req.body, updatedBy);
      res.status(200).json({
        success: true,
        message: "Email preferences updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  updateReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.email || req.user?.userId;
      const updated = await this.service.updateReminderPreferences(req.body, updatedBy);
      res.status(200).json({
        success: true,
        message: "Reminder preferences updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  updateAppearance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.email || req.user?.userId;
      const updated = await this.service.updateAppearancePreferences(req.body, updatedBy);
      res.status(200).json({
        success: true,
        message: "Appearance preferences updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  resetSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const section = req.params.section as SettingsSection;
      const updatedBy = req.user?.email || req.user?.userId;
      const updated = await this.service.resetSection(section, updatedBy);
      res.status(200).json({
        success: true,
        message: `Section '${section}' reset to defaults successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  testEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const actorUserId = req.user?.userId;
      const result = await this.service.sendTestEmail(email, actorUserId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const settingsController = new SettingsController();
