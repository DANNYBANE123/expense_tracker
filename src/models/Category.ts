import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryDoc extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Category type is required"],
    },
    color: {
      type: String,
      default: "#6366f1",
      trim: true,
    },
    icon: {
      type: String,
      default: "Tag",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user and type
CategorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export const Category: Model<ICategoryDoc> =
  mongoose.models.Category || mongoose.model<ICategoryDoc>("Category", CategorySchema);

export default Category;
