import { Request, Response } from "express";
import { healthService } from "./health.service";

class HealthController {
    getHealth(req: Request, res: Response) {
        const result = healthService.getHealth();
        res.status(200).json(result);
    }
}
export const healthController = new HealthController();