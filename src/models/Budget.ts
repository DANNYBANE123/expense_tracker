import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBudgetDoc extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  categoryName: string;
  amount: number; // in integer paise
  month: number; // 1 - 12
  year: number;
  alertThreshold: number; // default 80%
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudgetDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
      default: null,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
      default: "Overall Budget",
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [1, "Budget amount must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value in paise",
      },
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 2000,
      max: 2100,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Unique budget per user per category (or overall) per month & year
BudgetSchema.index(
  { userId: 1, categoryId: 1, month: 1, year: 1 },
  { unique: true }
);

export const Budget: Model<IBudgetDoc> =
  mongoose.models.Budget || mongoose.model<IBudgetDoc>("Budget", BudgetSchema);

export default Budget;
