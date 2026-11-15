import Transaction from "@/models/Transaction";
import mongoose from "mongoose";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface AnalyticsQueryOptions {
  startDate?: Date;
  endDate?: Date;
  type?: "income" | "expense";
  categoryId?: string;
}

export async function getDashboardAnalytics(
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // 1. Overall Lifetime Balance & Totals
  const lifetimeStats = await Transaction.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const s of lifetimeStats) {
    if (s._id === "income") totalIncome = s.total;
    if (s._id === "expense") totalExpenses = s.total;
  }
  const totalBalance = totalIncome - totalExpenses;

  // 2. Current Month Totals
  const currentMonthStats = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;
  for (const s of currentMonthStats) {
    if (s._id === "income") currentMonthIncome = s.total;
    if (s._id === "expense") currentMonthExpenses = s.total;
  }
  const monthlySavings = currentMonthIncome - currentMonthExpenses;
  const savingsRate =
    currentMonthIncome > 0
      ? Math.max(0, Math.round((monthlySavings / currentMonthIncome) * 100))
      : 0;

  // 3. Last Month Totals for Month-over-Month comparisons
  const lastMonthStats = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let lastMonthIncome = 0;
  let lastMonthExpenses = 0;
  for (const s of lastMonthStats) {
    if (s._id === "income") lastMonthIncome = s.total;
    if (s._id === "expense") lastMonthExpenses = s.total;
  }

  const momExpenseGrowth =
    lastMonthExpenses > 0
      ? Math.round(
          ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        )
      : 0;

  const momIncomeGrowth =
    lastMonthIncome > 0
      ? Math.round(
          ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
        )
      : 0;

  // 4. Monthly Trend (Past 6 Months)
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));
  const trendAgg = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: sixMonthsAgo, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const monthlyTrendMap: Record<
    string,
    { month: string; income: number; expense: number; savings: number }
  > = {};

  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const key = format(d, "MMM yyyy");
    monthlyTrendMap[key] = { month: key, income: 0, expense: 0, savings: 0 };
  }

  for (const item of trendAgg) {
    const d = new Date(item._id.year, item._id.month - 1, 1);
    const key = format(d, "MMM yyyy");
    if (monthlyTrendMap[key]) {
      if (item._id.type === "income") {
        monthlyTrendMap[key].income = item.total;
      } else {
        monthlyTrendMap[key].expense = item.total;
      }
      monthlyTrendMap[key].savings =
        monthlyTrendMap[key].income - monthlyTrendMap[key].expense;
    }
  }

  const monthlyTrend = Object.values(monthlyTrendMap);

  // 5. Current Month Category-wise Spending
  const categoryAgg = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: "expense",
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: "$categoryName",
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { amount: -1 } },
  ]);

  const palette = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#64748b",
  ];

  const categorySpending = categoryAgg.map((cat, idx) => ({
    name: cat._id || "Other",
    amount: cat.amount,
    color: palette[idx % palette.length],
    percentage:
      currentMonthExpenses > 0
        ? Math.round((cat.amount / currentMonthExpenses) * 100)
        : 0,
  }));

  // 6. Recent Transactions (last 7)
  const recentTransactions = await Transaction.find({ userId: userObjectId })
    .sort({ date: -1, createdAt: -1 })
    .limit(7)
    .lean();

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    currentMonthIncome,
    currentMonthExpenses,
    monthlySavings,
    savingsRate,
    monthOverMonthExpenseGrowth: momExpenseGrowth,
    monthOverMonthIncomeGrowth: momIncomeGrowth,
    monthlyTrend,
    categorySpending,
    recentTransactions,
  };
}
