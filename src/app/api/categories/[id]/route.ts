import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import { getAuthUser } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validations/category.schema";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await req.json();
    const validated = categorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { name, type, color, icon } = validated.data;

    const updated = await Category.findOneAndUpdate(
      { _id: id, userId: user.id },
      { name: name.trim(), type, color, icon },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Also update categoryName in transactions if name changed
    await Transaction.updateMany(
      { categoryId: id, userId: user.id },
      { categoryName: name.trim() }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if category has transactions
    const transactionCount = await Transaction.countDocuments({
      categoryId: id,
      userId: user.id,
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. It is referenced by ${transactionCount} transaction(s). Reassign them first.`,
        },
        { status: 400 }
      );
    }

    const deleted = await Category.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
