import { z } from "zod";

export const getDashboardQuerySchema = z.object({
  timeframe: z.enum(["30D", "6M", "12M"]).optional().default("12M"),
});

export type GetDashboardQuery = z.infer<typeof getDashboardQuerySchema>;
