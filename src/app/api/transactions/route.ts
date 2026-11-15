import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Transaction from "@/models/Transaction";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth/session";
import { transactionSchema } from "@/lib/validations/transaction.schema";
import { rupeesToPaise } from "@/lib/utils/currency";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20")));

    const query: any = {
      userId: new mongoose.Types.ObjectId(user.id),
    };

    if (type && type !== "all") {
      query.type = type;
    }

    if (categoryId && categoryId !== "all") {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search.trim()) {
      query.$or = [
        { description: { $regex: search.trim(), $options: "i" } },
        { categoryName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const sortObj: any = {};
    if (sortBy === "amount") {
      sortObj.amount = sortOrder;
    } else {
      sortObj.date = sortOrder;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const amountInPaise = rupeesToPaise(amount);

    const transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(user.id),
      amount: amountInPaise,
      type,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      categoryName,
      description: description || "",
      date: new Date(date),
      paymentMethod,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("POST transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}
