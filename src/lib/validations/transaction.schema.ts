import { z } from "zod";

export const transactionSchema = z.object({
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
  date: z.string().or(z.date()),
  paymentMethod: z.enum(
    [
      "cash",
      "upi",
      "credit_card",
      "debit_card",
      "bank_transfer",
      "net_banking",
      "other",
    ],
    {
      errorMap: () => ({ message: "Invalid payment method" }),
    }
  ),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
