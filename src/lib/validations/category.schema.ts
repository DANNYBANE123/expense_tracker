import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be either income or expense" }),
  }),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid HEX color code")
    .default("#6366f1"),
  icon: z.string().default("Tag"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
