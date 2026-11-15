import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Budget from "@/models/Budget";
import { getAuthUser } from "@/lib/auth/session";
import { budgetSchema } from "@/lib/validations/budget.schema";
import { rupeesToPaise } from "@/lib/utils/currency";
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
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const body = await req.json();
    const validated = budgetSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { categoryId, categoryName, amount, month, year, alertThreshold } =
      validated.data;

    const catId =
      categoryId && categoryId !== "all" && categoryId !== ""
        ? new mongoose.Types.ObjectId(categoryId)
        : null;

    const updated = await Budget.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        categoryId: catId,
        categoryName,
        amount: rupeesToPaise(amount),
        month,
        year,
        alertThreshold: alertThreshold || 80,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

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
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Budget.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
