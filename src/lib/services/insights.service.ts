import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";
import User from "@/models/User";
import { formatCurrency, paiseToRupees } from "@/lib/utils/currency";
import { IFinancialInsight } from "@/types";
import mongoose from "mongoose";

export async function generateSmartInsights(
  userId: string | mongoose.Types.ObjectId
): Promise<IFinancialInsight[]> {
  const insights: IFinancialInsight[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Date ranges
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // Fetch transactions for current and last month
  const [currentMonthTxs, lastMonthTxs, userDoc, budgetDocs] = await Promise.all([
    Transaction.find({
      userId,
      date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    }),
    Transaction.find({
      userId,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    User.findById(userId),
    Budget.find({
      userId,
      month: currentMonth + 1,
      year: currentYear,
    }),
  ]);

  if (currentMonthTxs.length === 0 && lastMonthTxs.length === 0) {
    insights.push({
      id: "get-started",
      type: "info",
      title: "Welcome to Expense Tracker",
      message: "Log your first income and expenses to activate automated smart financial analysis.",
      icon: "Sparkles",
    });
    return insights;
  }

  // 1. Current Month Totals
  let currentIncome = 0;
  let currentExpense = 0;
  const currentCategoryExpense: Record<string, number> = {};

  for (const tx of currentMonthTxs) {
    if (tx.type === "income") {
      currentIncome += tx.amount;
    } else {
      currentExpense += tx.amount;
      const cat = tx.categoryName || "Other";
      currentCategoryExpense[cat] = (currentCategoryExpense[cat] || 0) + tx.amount;
    }
  }

  // 2. Last Month Totals
  let lastIncome = 0;
  let lastExpense = 0;
  const lastCategoryExpense: Record<string, number> = {};

  for (const tx of lastMonthTxs) {
    if (tx.type === "income") {
      lastIncome += tx.amount;
    } else {
      lastExpense += tx.amount;
      const cat = tx.categoryName || "Other";
      lastCategoryExpense[cat] = (lastCategoryExpense[cat] || 0) + tx.amount;
    }
  }

  // Insight 1: Highest Expense Category
  const sortedCategories = Object.entries(currentCategoryExpense).sort(
    ([, a], [, b]) => b - a
  );

  if (sortedCategories.length > 0 && currentExpense > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const percentage = Math.round((topAmount / currentExpense) * 100);
    insights.push({
      id: "highest-spending-category",
      type: percentage > 40 ? "warning" : "info",
      title: "Top Spending Category",
      message: `${topCat} is your highest expense category, making up ${percentage}% of this month's expenses (${formatCurrency(topAmount)}).`,
      metric: `${percentage}%`,
      icon: "PieChart",
    });
  }

  // Insight 2: Category Month-over-Month Trend
  for (const [catName, currentAmt] of sortedCategories.slice(0, 3)) {
    const lastAmt = lastCategoryExpense[catName];
    if (lastAmt && lastAmt > 100000) {
      // minimum ₹1000 to be meaningful
      const changePct = Math.round(((currentAmt - lastAmt) / lastAmt) * 100);
      if (changePct >= 20) {
        insights.push({
          id: `surge-${catName.toLowerCase()}`,
          type: "warning",
          title: `${catName} Spending Surge`,
          message: `${catName} spending increased by ${changePct}% compared to last month (${formatCurrency(currentAmt)} vs ${formatCurrency(lastAmt)}).`,
          metric: `+${changePct}%`,
          icon: "TrendingUp",
        });
      } else if (changePct <= -20) {
        insights.push({
          id: `drop-${catName.toLowerCase()}`,
          type: "positive",
          title: `${catName} Savings`,
          message: `${catName} spending dropped by ${Math.abs(changePct)}% compared to last month. Great expense control!`,
          metric: `${changePct}%`,
          icon: "TrendingDown",
        });
      }
    }
  }

  // Insight 3: Budget Utilization & Alerts (80% and Exceeded)
  let totalAllocatedBudget = 0;
  const overallBudget = budgetDocs.find((b) => !b.categoryId);

  if (overallBudget) {
    totalAllocatedBudget = overallBudget.amount;
  } else if (budgetDocs.length > 0) {
    totalAllocatedBudget = budgetDocs.reduce((acc, b) => acc + b.amount, 0);
  } else if (userDoc?.defaultMonthlyBudget) {
    totalAllocatedBudget = userDoc.defaultMonthlyBudget;
  }

  if (totalAllocatedBudget > 0) {
    const utilization = Math.round((currentExpense / totalAllocatedBudget) * 100);
    if (utilization >= 100) {
      insights.push({
        id: "budget-exceeded",
        type: "danger",
        title: "Monthly Budget Exceeded",
        message: `You have consumed ${utilization}% of your monthly budget (${formatCurrency(currentExpense)} of ${formatCurrency(totalAllocatedBudget)}).`,
        metric: `${utilization}%`,
        icon: "AlertOctagon",
      });
    } else if (utilization >= 80) {
      insights.push({
        id: "budget-warning-80",
        type: "warning",
        title: "Budget Alert (80%+ Consumed)",
        message: `You have consumed ${utilization}% of your monthly budget. You have ${formatCurrency(totalAllocatedBudget - currentExpense)} remaining for the month.`,
        metric: `${utilization}%`,
        icon: "AlertTriangle",
      });
    } else if (now.getDate() >= 15 && utilization <= 45) {
      insights.push({
        id: "budget-healthy",
        type: "positive",
        title: "Disciplined Budgeting",
        message: `You are past mid-month and have only used ${utilization}% of your allocated budget.`,
        metric: `${utilization}%`,
        icon: "CheckCircle",
      });
    }
  }

  // Category specific budget alerts
  for (const b of budgetDocs) {
    if (b.categoryId) {
      const catSpent = currentCategoryExpense[b.categoryName] || 0;
      const catUtil = Math.round((catSpent / b.amount) * 100);
      if (catUtil >= 100) {
        insights.push({
          id: `cat-exceeded-${b._id}`,
          type: "danger",
          title: `${b.categoryName} Budget Exceeded`,
          message: `${b.categoryName} spending (${formatCurrency(catSpent)}) has exceeded your budget of ${formatCurrency(b.amount)}.`,
          metric: `${catUtil}%`,
          icon: "AlertCircle",
        });
      } else if (catUtil >= b.alertThreshold) {
        insights.push({
          id: `cat-warning-${b._id}`,
          type: "warning",
          title: `${b.categoryName} Alert (${b.alertThreshold}% threshold)`,
          message: `${b.categoryName} spending has reached ${catUtil}% of its limit. ${formatCurrency(b.amount - catSpent)} remaining.`,
          metric: `${catUtil}%`,
          icon: "AlertTriangle",
        });
      }
    }
  }

  // Insight 4: Savings Rate and Month-over-Month Comparison
  const currentSavings = currentIncome - currentExpense;
  const lastSavings = lastIncome - lastExpense;

  if (currentIncome > 0) {
    const savingsRate = Math.round((currentSavings / currentIncome) * 100);
    if (savingsRate >= 30) {
      insights.push({
        id: "high-savings-rate",
        type: "positive",
        title: "Exceptional Savings Rate",
        message: `You are saving ${savingsRate}% of your income this month (${formatCurrency(currentSavings)} saved).`,
        metric: `${savingsRate}%`,
        icon: "PiggyBank",
      });
    } else if (currentSavings < 0) {
      insights.push({
        id: "negative-savings",
        type: "danger",
        title: "Deficit Spending",
        message: `Your expenses exceed your income this month by ${formatCurrency(Math.abs(currentSavings))}. Review discretionary spending.`,
        icon: "TrendingDown",
      });
    }

    if (lastIncome > 0 && currentSavings > lastSavings && lastSavings > 0) {
      const growth = currentSavings - lastSavings;
      insights.push({
        id: "savings-growth",
        type: "positive",
        title: "Growing Savings",
        message: `Your net savings increased by ${formatCurrency(growth)} compared to last month.`,
        metric: `+${formatCurrency(growth)}`,
        icon: "ArrowUpRight",
      });
    }
  }

  return insights;
}
