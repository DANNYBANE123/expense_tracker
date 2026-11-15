import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import RecurringTransaction from "@/models/RecurringTransaction";
import { getAuthUser } from "@/lib/auth/session";
import { recurringSchema } from "@/lib/validations/recurring.schema";
import { rupeesToPaise } from "@/lib/utils/currency";
import { processRecurringTransactions } from "@/lib/services/recurring.service";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Process any overdue recurring transactions first
    await processRecurringTransactions(user.id);

    const recurring = await RecurringTransaction.find({
      userId: new mongoose.Types.ObjectId(user.id),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(recurring);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const start = new Date(startDate);

    const created = await RecurringTransaction.create({
      userId: new mongoose.Types.ObjectId(user.id),
      amount: rupeesToPaise(amount),
      type,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      categoryName,
      description: description || "",
      paymentMethod: paymentMethod || "upi",
      frequency,
      startDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
      nextExecutionDate: start,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Run processing in case start date is today or in the past
    await processRecurringTransactions(user.id);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
