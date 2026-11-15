import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecurringTransactionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // in integer paise
  type: "income" | "expense";
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  description: string;
  paymentMethod: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  nextExecutionDate: Date;
  lastExecutedDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransactionDoc>(
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
      required: [true, "Type is required"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"],
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "upi",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: [true, "Frequency is required"],
      default: "monthly",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: false,
    },
    nextExecutionDate: {
      type: Date,
      required: [true, "Next execution date is required"],
      index: true,
    },
    lastExecutedDate: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch recurring transactions ready to process
RecurringTransactionSchema.index({
  userId: 1,
  isActive: 1,
  nextExecutionDate: 1,
});

export const RecurringTransaction: Model<IRecurringTransactionDoc> =
  mongoose.models.RecurringTransaction ||
  mongoose.model<IRecurringTransactionDoc>(
    "RecurringTransaction",
    RecurringTransactionSchema
  );

export default RecurringTransaction;
