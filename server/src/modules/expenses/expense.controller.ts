import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "./expense.service";
import { CategoryService } from "./category.service";
import { VendorService } from "./vendor.service";
import { ExpenseReportService } from "./expense-report.service";
import {
  createCategorySchema,
  updateCategorySchema,
  createVendorSchema,
  updateVendorSchema,
  createExpenseSchema,
  updateExpenseSchema,
  updateExpenseStatusSchema,
  expenseQuerySchema,
  categoryQuerySchema,
  vendorQuerySchema,
  reportQuerySchema,
} from "./expense.validator";

export class ExpenseController {
  private expenseService: ExpenseService;
  private categoryService: CategoryService;
  private vendorService: VendorService;
  private reportService: ExpenseReportService;

  constructor() {
    this.expenseService = new ExpenseService();
    this.categoryService = new CategoryService();
    this.vendorService = new VendorService();
    this.reportService = new ExpenseReportService();
  }

  // ==========================================
  // Category Endpoints
  // ==========================================

  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = categoryQuerySchema.parse(req.query);
      const result = await this.categoryService.getAllCategories(query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const category = await this.categoryService.getCategoryById(id);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = createCategorySchema.parse(req.body);
      const category = await this.categoryService.createCategory(body);
      res.status(201).json({
        success: true,
        message: "Expense category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = updateCategorySchema.parse(req.body);
      const category = await this.categoryService.updateCategory(id, body);
      res.status(200).json({
        success: true,
        message: "Expense category updated successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const category = await this.categoryService.deleteCategory(id);
      res.status(200).json({
        success: true,
        message: "Expense category deleted successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const category = await this.categoryService.restoreCategory(id);
      res.status(200).json({
        success: true,
        message: "Expense category restored successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // Vendor Endpoints
  // ==========================================

  getAllVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = vendorQuerySchema.parse(req.query);
      const result = await this.vendorService.getAllVendors(query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getVendorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const vendor = await this.vendorService.getVendorById(id);
      res.status(200).json({
        success: true,
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  createVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = createVendorSchema.parse(req.body);
      const vendor = await this.vendorService.createVendor(body);
      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  updateVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const body = updateVendorSchema.parse(req.body);
      const vendor = await this.vendorService.updateVendor(id, body);
      res.status(200).json({
        success: true,
        message: "Vendor updated successfully",
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const vendor = await this.vendorService.deleteVendor(id);
      res.status(200).json({
        success: true,
        message: "Vendor deleted successfully",
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const vendor = await this.vendorService.restoreVendor(id);
      res.status(200).json({
        success: true,
        message: "Vendor restored successfully",
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // Expense CRUD & Actions
  // ==========================================

  getAllExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = expenseQuerySchema.parse(req.query);
      const result = await this.expenseService.getAllExpenses(query);
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getExpenseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const expense = await this.expenseService.getExpenseById(id);
      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = createExpenseSchema.parse(req.body);
      const file = req.file;

      const expense = await this.expenseService.createExpense(
        validatedBody,
        file?.buffer,
        file?.originalname,
        file?.mimetype,
        file?.size,
        req.user?.email || req.user?.userId,
        req.user?.role
      );

      res.status(201).json({
        success: true,
        message: "Expense created successfully",
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  updateExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedBody = updateExpenseSchema.parse(req.body);
      const file = req.file;

      const expense = await this.expenseService.updateExpense(
        id,
        validatedBody,
        file?.buffer,
        file?.originalname,
        file?.mimetype,
        file?.size,
        req.user?.email || req.user?.userId,
        req.user?.role
      );

      res.status(200).json({
        success: true,
        message: "Expense updated successfully",
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  updateExpenseStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedBody = updateExpenseStatusSchema.parse(req.body);

      const expense = await this.expenseService.updateExpenseStatus(
        id,
        validatedBody,
        req.user?.email || req.user?.userId,
        req.user?.role
      );

      res.status(200).json({
        success: true,
        message: `Expense status updated to ${validatedBody.status}`,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const expense = await this.expenseService.deleteExpense(
        id,
        req.user?.email || req.user?.userId,
        req.user?.role
      );
      res.status(200).json({
        success: true,
        message: "Expense soft-deleted successfully",
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const expense = await this.expenseService.restoreExpense(
        id,
        req.user?.email || req.user?.userId,
        req.user?.role
      );
      res.status(200).json({
        success: true,
        message: "Expense restored successfully",
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  removeReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const expense = await this.expenseService.removeReceipt(
        id,
        req.user?.email || req.user?.userId,
        req.user?.role
      );
      res.status(200).json({
        success: true,
        message: "Expense receipt removed successfully",
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  };

  viewReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const fileInfo = await this.expenseService.getReceiptFile(id);

      res.setHeader("Content-Type", fileInfo.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileInfo.originalName)}"`);
      res.sendFile(fileInfo.fullPath);
    } catch (error) {
      next(error);
    }
  };

  downloadReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const fileInfo = await this.expenseService.getReceiptFile(id);

      res.setHeader("Content-Type", fileInfo.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileInfo.originalName)}"`);
      res.sendFile(fileInfo.fullPath);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // Report Endpoints
  // ==========================================

  getReportsTotal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportService.getTotalExpenses(query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getReportsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportService.getExpensesByCategory(query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getReportsByVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportService.getExpensesByVendor(query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getReportsMonthlyTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportService.getMonthlyTrend(query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getReportsTaxSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportService.getTaxSummary(query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getReportsDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportService.getDateRangeReport(query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getDashboardSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.reportService.getDashboardSummary();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
