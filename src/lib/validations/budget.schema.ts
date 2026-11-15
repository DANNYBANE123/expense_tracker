import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().min(1, "Category name is required"),
  amount: z
    .number({ invalid_type_error: "Budget amount must be a number" })
    .positive("Budget must be greater than 0"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  alertThreshold: z.number().int().min(1).max(100).default(80),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
