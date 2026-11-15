import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Transaction from "@/models/Transaction";
import { getAuthUser } from "@/lib/auth/session";
import { paiseToRupees } from "@/lib/utils/currency";
import { format } from "date-fns";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    // Generate CSV content
    const headers = [
      "Transaction ID",
      "Date",
      "Type",
      "Category",
      "Amount (INR)",
      "Payment Method",
      "Description",
    ];

    const rows = transactions.map((tx) => [
      `"${tx._id.toString()}"`,
      `"${format(new Date(tx.date), "yyyy-MM-dd HH:mm")}"`,
      `"${tx.type.toUpperCase()}"`,
      `"${(tx.categoryName || "").replace(/"/g, '""')}"`,
      paiseToRupees(tx.amount).toFixed(2),
      `"${tx.paymentMethod}"`,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const filename = `expense_tracker_export_${format(
      new Date(),
      "yyyyMMdd_HHmm"
    )}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
