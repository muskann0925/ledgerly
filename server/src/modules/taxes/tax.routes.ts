import { Router } from "express";
import { TaxController } from "./tax.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { Role } from "@prisma/client";

const router = Router();
const controller = new TaxController();

router.use(authenticate);

router.post("/", authorize(Role.OWNER, Role.ADMIN), controller.createTax);
router.get("/", controller.getAllTaxes);
router.get("/active", controller.getActiveTaxes);
router.post("/calculate", controller.calculateTaxes);
router.get("/:id", controller.getTaxById);
router.put("/:id", authorize(Role.OWNER, Role.ADMIN), controller.updateTax);
router.patch("/:id/status", authorize(Role.OWNER, Role.ADMIN), controller.toggleTaxStatus);
router.delete("/:id", authorize(Role.OWNER, Role.ADMIN), controller.softDeleteTax);

export default router;
