import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { getAuthUser } from "@/lib/auth/session";
import { getDashboardAnalytics } from "@/lib/services/analytics.service";
import { generateSmartInsights } from "@/lib/services/insights.service";
import { processRecurringTransactions } from "@/lib/services/recurring.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Auto-process any pending recurring transactions
    await processRecurringTransactions(user.id);

    const [analytics, insights] = await Promise.all([
      getDashboardAnalytics(user.id),
      generateSmartInsights(user.id),
    ]);

    return NextResponse.json({
      ...analytics,
      insights,
    });
  } catch (error: any) {
    console.error("Analytics route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
