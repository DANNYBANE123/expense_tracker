import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import RecurringTransaction from "@/models/RecurringTransaction";
import { getAuthUser } from "@/lib/auth/session";
import { recurringSchema } from "@/lib/validations/recurring.schema";
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
      return NextResponse.json({ error: "Invalid recurring ID" }, { status: 400 });
    }

    const body = await req.json();
    const validated = recurringSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const {
      amount,
      type,
      categoryId,
      categoryName,
      description,
      paymentMethod,
      frequency,
      startDate,
      endDate,
      isActive,
    } = validated.data;

    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        amount: rupeesToPaise(amount),
        type,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        categoryName,
        description: description || "",
        paymentMethod,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Recurring schedule not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Invalid recurring ID" }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await RecurringTransaction.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Recurring schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Recurring schedule deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
