import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password?: string;
  currency: string;
  defaultMonthlyBudget: number; // in paise
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    defaultMonthlyBudget: {
      type: Number,
      default: 5000000, // Default ₹50,000 in paise
      min: [0, "Budget cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during Next.js hot reload
export const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);

export default User;
