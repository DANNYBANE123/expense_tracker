import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransactionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // in integer paise (100 paise = 1 INR)
  type: "income" | "expense";
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  description: string;
  date: Date;
  paymentMethod:
    | "cash"
    | "upi"
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "net_banking"
    | "other";
  recurringTransactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value in paise",
      },
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
      index: true,
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "upi",
        "credit_card",
        "debit_card",
        "bank_transfer",
        "net_banking",
        "other",
      ],
      default: "upi",
    },
    recurringTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "RecurringTransaction",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed queries, date ranges and filters
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1, date: -1 });

export const Transaction: Model<ITransactionDoc> =
  mongoose.models.Transaction ||
  mongoose.model<ITransactionDoc>("Transaction", TransactionSchema);

export default Transaction;
