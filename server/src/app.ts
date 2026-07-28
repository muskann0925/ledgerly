import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import healthRoutes from "./modules/health/health.routes";
import { authRoutes } from "./modules/auth";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { clientRoutes } from "./modules/client";
import { invoiceRoutes } from "./modules/invoices";
import { paymentRoutes } from "./modules/payments";
import { quotationRoutes } from "./modules/quotations";
import { expenseRoutes } from "./modules/expenses";
import { reportRoutes } from "./modules/reports";
import { taxRoutes } from "./modules/taxes";
import { notificationRoutes } from "./modules/notifications";
import { settingsRoutes } from "./modules/settings";
import { userRoutes } from "./modules/users";
import auditLogRoutes from "./modules/audit-logs";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/clients", clientRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/payments", paymentRoutes);
app.use("/quotations", quotationRoutes);
app.use("/expenses", expenseRoutes);
app.use("/reports", reportRoutes);
app.use("/taxes", taxRoutes);
app.use("/notifications", notificationRoutes);
app.use("/settings", settingsRoutes);
app.use("/users", userRoutes);
app.use("/audit-logs", auditLogRoutes);

// Catch-all 404 Handler for Unmatched API Routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found",
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

export default app;