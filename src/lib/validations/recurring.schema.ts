import { z } from "zod";

export const recurringSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be either income or expense" }),
  }),
  categoryId: z.string().min(1, "Please select a category"),
  categoryName: z.string().min(1, "Category name is required"),
  description: z
    .string()
    .max(250, "Description cannot exceed 250 characters")
    .optional()
    .default(""),
  paymentMethod: z.string().default("upi"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"], {
    errorMap: () => ({ message: "Invalid frequency" }),
  }),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type RecurringInput = z.infer<typeof recurringSchema>;
