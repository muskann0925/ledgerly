import { Request, Response, NextFunction } from "express";
import { clientService, ClientService } from "./client.service";
import { createApiResponse } from "../../utils/apiResponse";
import { createClientSchema, updateClientSchema, clientQuerySchema } from "./client.validator";

export class ClientController {
  constructor(
    private readonly service: ClientService = clientService
  ) {}

  private getParamId(req: Request): string {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
  }

  createClient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = createClientSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      const actorRole = req.user?.role;
      const client = await this.service.createClient(validatedData, actorUserId, actorRole);
      res
        .status(201)
        .json(createApiResponse(true, "Client created successfully", client));
    } catch (error) {
      next(error);
    }
  };

  getClients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = clientQuerySchema.parse(req.query);
      const result = await this.service.getClients(validatedQuery);
      res
        .status(200)
        .json(createApiResponse(true, "Clients retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  };

  getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const client = await this.service.getClientById(id);
      res
        .status(200)
        .json(createApiResponse(true, "Client profile retrieved successfully", client));
    } catch (error) {
      next(error);
    }
  };

  updateClient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const validatedData = updateClientSchema.parse(req.body);
      const actorUserId = req.user?.userId;
      const actorRole = req.user?.role;
      const updatedClient = await this.service.updateClient(id, validatedData, actorUserId, actorRole);
      res
        .status(200)
        .json(createApiResponse(true, "Client updated successfully", updatedClient));
    } catch (error) {
      next(error);
    }
  };

  deleteClient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const actorUserId = req.user?.userId;
      const actorRole = req.user?.role;
      const deletedClient = await this.service.deleteClient(id, actorUserId, actorRole);
      res
        .status(200)
        .json(createApiResponse(true, "Client soft deleted successfully", deletedClient));
    } catch (error) {
      next(error);
    }
  };

  restoreClient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const restoredClient = await this.service.restoreClient(id);
      res
        .status(200)
        .json(createApiResponse(true, "Client restored successfully", restoredClient));
    } catch (error) {
      next(error);
    }
  };

  getStatementPdf = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const { startDate, endDate } = req.query;
      const { buffer, filename } = await this.service.generateStatementPdf(
        id,
        startDate as string | undefined,
        endDate as string | undefined
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  sendEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = this.getParamId(req);
      const actorUserId = req.user?.userId;
      const result = await this.service.sendClientEmail(id, req.body, actorUserId);
      res.status(200).json(createApiResponse(true, result.message, result.client));
    } catch (error) {
      next(error);
    }
  };
}

export const clientController = new ClientController();
