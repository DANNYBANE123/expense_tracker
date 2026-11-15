import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Transaction from "@/models/Transaction";
import { getAuthUser } from "@/lib/auth/session";
import { transactionSchema } from "@/lib/validations/transaction.schema";
import { rupeesToPaise } from "@/lib/utils/currency";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
    }

    await connectToDatabase();

    const transaction = await Transaction.findOne({
      _id: id,
      userId: user.id,
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
    }

    const body = await req.json();
    const validated = transactionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { amount, type, categoryId, categoryName, description, date, paymentMethod } =
      validated.data;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        amount: rupeesToPaise(amount),
        type,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        categoryName,
        description: description || "",
        date: new Date(date),
        paymentMethod,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
