import { Request, Response, NextFunction } from "express";
import { TaxService } from "./tax.service";
import { createTaxSchema, updateTaxSchema, taxQuerySchema, calculateTaxSchema } from "./tax.validator";
import { createApiResponse } from "../../utils/apiResponse";

export class TaxController {
  private service: TaxService;

  constructor() {
    this.service = new TaxService();
  }

  createTax = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createTaxSchema.parse(req.body);
      const tax = await this.service.createTax(validated, req.user?.userId);
      res.status(201).json(createApiResponse(true, "Tax created successfully", tax));
    } catch (error) {
      next(error);
    }
  };

  updateTax = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validated = updateTaxSchema.parse(req.body);
      const tax = await this.service.updateTax(id, validated, req.user?.userId);
      res.json(createApiResponse(true, "Tax updated successfully", tax));
    } catch (error) {
      next(error);
    }
  };

  getTaxById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const tax = await this.service.getTaxById(id);
      res.json(createApiResponse(true, "Tax fetched successfully", tax));
    } catch (error) {
      next(error);
    }
  };

  getAllTaxes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = taxQuerySchema.parse(req.query);
      const result = await this.service.getAllTaxes(query);
      res.json(
        createApiResponse(true, "Taxes retrieved successfully", {
          taxes: result.taxes,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getActiveTaxes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taxes = await this.service.getActiveTaxes();
      res.json(createApiResponse(true, "Active taxes fetched successfully", taxes));
    } catch (error) {
      next(error);
    }
  };

  toggleTaxStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        res.status(400).json(createApiResponse(false, "isActive field must be a boolean"));
        return;
      }
      const tax = await this.service.toggleTaxStatus(id, isActive, req.user?.userId);
      res.json(createApiResponse(true, `Tax ${isActive ? "enabled" : "disabled"} successfully`, tax));
    } catch (error) {
      next(error);
    }
  };

  softDeleteTax = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.softDeleteTax(id, req.user?.userId);
      res.json(createApiResponse(true, "Tax deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  calculateTaxes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = calculateTaxSchema.parse(req.body);
      const result = await this.service.calculateTaxes(validated);
      res.json(createApiResponse(true, "Tax calculation completed successfully", result));
    } catch (error) {
      next(error);
    }
  };
}
