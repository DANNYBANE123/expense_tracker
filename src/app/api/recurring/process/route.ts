import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { getAuthUser } from "@/lib/auth/session";
import { processRecurringTransactions } from "@/lib/services/recurring.service";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const generated = await processRecurringTransactions(user.id);

    return NextResponse.json({
      message: `Processed recurring schedules successfully. Generated ${generated.length} new transaction(s).`,
      generatedCount: generated.length,
      transactions: generated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
