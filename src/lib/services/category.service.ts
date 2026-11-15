import Category from "@/models/Category";
import mongoose from "mongoose";

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food", type: "expense", color: "#f97316", icon: "UtensilsCrossed" },
  { name: "Transportation", type: "expense", color: "#3b82f6", icon: "Car" },
  { name: "Shopping", type: "expense", color: "#ec4899", icon: "ShoppingBag" },
  { name: "Entertainment", type: "expense", color: "#8b5cf6", icon: "Film" },
  { name: "Healthcare", type: "expense", color: "#ef4444", icon: "HeartPulse" },
  { name: "Education", type: "expense", color: "#06b6d4", icon: "GraduationCap" },
  { name: "Bills", type: "expense", color: "#eab308", icon: "Receipt" },
  { name: "Rent", type: "expense", color: "#14b8a6", icon: "Home" },
  { name: "Travel", type: "expense", color: "#6366f1", icon: "Plane" },
  { name: "Other", type: "expense", color: "#64748b", icon: "MoreHorizontal" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", type: "income", color: "#10b981", icon: "Briefcase" },
  { name: "Freelancing", type: "income", color: "#059669", icon: "Laptop" },
  { name: "Investments", type: "income", color: "#84cc16", icon: "TrendingUp" },
  { name: "Business", type: "income", color: "#0ea5e9", icon: "Building2" },
  { name: "Gifts", type: "income", color: "#d946ef", icon: "Gift" },
  { name: "Other", type: "income", color: "#64748b", icon: "PlusCircle" },
];

export async function seedDefaultCategories(userId: string | mongoose.Types.ObjectId) {
  const existingCount = await Category.countDocuments({ userId });
  if (existingCount > 0) {
    return;
  }

  const allDefaults = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      ...c,
      userId,
      isDefault: true,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      ...c,
      userId,
      isDefault: true,
    })),
  ];

  await Category.insertMany(allDefaults, { ordered: false });
}
