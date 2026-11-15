import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Budget from "@/models/Budget";
import Transaction from "@/models/Transaction";
import { getAuthUser } from "@/lib/auth/session";
import { budgetSchema } from "@/lib/validations/budget.schema";
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
    const now = new Date();
    const month = parseInt(searchParams.get("month") || `${now.getMonth() + 1}`);
    const year = parseInt(searchParams.get("year") || `${now.getFullYear()}`);

    const userObjectId = new mongoose.Types.ObjectId(user.id);
    const budgets = await Budget.find({
      userId: userObjectId,
      month,
      year,
    }).lean();

    // Determine actual spending for each budget
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (b) => {
        const matchQuery: any = {
          userId: userObjectId,
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        };

        if (b.categoryId) {
          matchQuery.categoryId = b.categoryId;
        }

        const spentResult = await Transaction.aggregate([
          { $match: matchQuery },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent = spentResult.length > 0 ? spentResult[0].total : 0;
        const percentageUsed =
          b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
        const remaining = b.amount - spent;

        let status: "normal" | "warning" | "exceeded" = "normal";
        if (percentageUsed >= 100) {
          status = "exceeded";
        } else if (percentageUsed >= (b.alertThreshold || 80)) {
          status = "warning";
        }

        return {
          ...b,
          spent,
          percentageUsed,
          remaining,
          status,
        };
      })
    );

    return NextResponse.json(budgetsWithSpending);
  } catch (error: any) {
    console.error("GET budgets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch budgets" },
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

    const userObjectId = new mongoose.Types.ObjectId(user.id);
    const catId =
      categoryId && categoryId !== "all" && categoryId !== ""
        ? new mongoose.Types.ObjectId(categoryId)
        : null;

    // Check if budget already exists for this user, category, month, and year
    const existing = await Budget.findOne({
      userId: userObjectId,
      categoryId: catId,
      month,
      year,
    });

    if (existing) {
      // Update existing
      existing.amount = rupeesToPaise(amount);
      existing.categoryName = categoryName;
      existing.alertThreshold = alertThreshold || 80;
      await existing.save();
      return NextResponse.json(existing);
    }

    const newBudget = await Budget.create({
      userId: userObjectId,
      categoryId: catId,
      categoryName,
      amount: rupeesToPaise(amount),
      month,
      year,
      alertThreshold: alertThreshold || 80,
    });

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error: any) {
    console.error("POST budget error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save budget" },
      { status: 500 }
    );
  }
}
