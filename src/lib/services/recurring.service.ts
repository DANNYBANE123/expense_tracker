import RecurringTransaction from "@/models/RecurringTransaction";
import Transaction from "@/models/Transaction";
import { addDays, addWeeks, addMonths, addYears, isAfter } from "date-fns";
import mongoose from "mongoose";

export async function processRecurringTransactions(
  userId: string | mongoose.Types.ObjectId
) {
  const now = new Date();

  // Find all active recurring transactions that are due
  const dueRecurring = await RecurringTransaction.find({
    userId,
    isActive: true,
    nextExecutionDate: { $lte: now },
  });

  const generatedTransactions = [];

  for (const rec of dueRecurring) {
    // Check if endDate has passed
    if (rec.endDate && isAfter(rec.nextExecutionDate, new Date(rec.endDate))) {
      rec.isActive = false;
      await rec.save();
      continue;
    }

    // Check if a transaction was already generated for this recurring transaction on this exact execution date
    const startOfTargetDay = new Date(rec.nextExecutionDate);
    startOfTargetDay.setHours(0, 0, 0, 0);
    const endOfTargetDay = new Date(rec.nextExecutionDate);
    endOfTargetDay.setHours(23, 59, 59, 999);

    const alreadyExists = await Transaction.findOne({
      userId,
      recurringTransactionId: rec._id,
      date: { $gte: startOfTargetDay, $lte: endOfTargetDay },
    });

    if (!alreadyExists) {
      const newTx = await Transaction.create({
        userId,
        amount: rec.amount,
        type: rec.type,
        categoryId: rec.categoryId,
        categoryName: rec.categoryName,
        description: rec.description
          ? `[Recurring] ${rec.description}`
          : `[Recurring] ${rec.categoryName}`,
        date: rec.nextExecutionDate,
        paymentMethod: rec.paymentMethod || "upi",
        recurringTransactionId: rec._id,
      });
      generatedTransactions.push(newTx);
    }

    // Calculate next execution date
    let nextDate = new Date(rec.nextExecutionDate);
    switch (rec.frequency) {
      case "daily":
        nextDate = addDays(nextDate, 1);
        break;
      case "weekly":
        nextDate = addWeeks(nextDate, 1);
        break;
      case "monthly":
        nextDate = addMonths(nextDate, 1);
        break;
      case "yearly":
        nextDate = addYears(nextDate, 1);
        break;
      default:
        nextDate = addMonths(nextDate, 1);
    }

    rec.lastExecutedDate = now;
    rec.nextExecutionDate = nextDate;

    if (rec.endDate && isAfter(nextDate, new Date(rec.endDate))) {
      rec.isActive = false;
    }

    await rec.save();
  }

  return generatedTransactions;
}
