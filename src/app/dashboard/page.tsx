"use client";

import * as React from "react";
import { Header } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { IDashboardStats, ICategory } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<IDashboardStats | null>(null);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [isTxModalOpen, setIsTxModalOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, categoriesRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/categories"),
      ]);

      if (!analyticsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const analyticsData = await analyticsRes.json();
      const categoriesData = await categoriesRes.json();

      setStats(analyticsData);
      setCategories(categoriesData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Financial Overview"
        subtitle="Real-time financial metrics, spending velocity & smart analytics"
        onAddTransaction={() => setIsTxModalOpen(true)}
        onRefresh={fetchData}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-28 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="col-span-1 lg:col-span-2 h-80 rounded-xl" />
              <Skeleton className="col-span-1 h-80 rounded-xl" />
            </div>
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Balance"
                amount={stats?.totalBalance || 0}
                type="balance"
                subtitle="Net lifetime accumulated"
              />
              <StatCard
                title="Total Income"
                amount={stats?.totalIncome || 0}
                type="income"
                trend={{
                  value: stats?.monthOverMonthIncomeGrowth || 0,
                  isPositiveGood: true,
                  label: "vs last month",
                }}
              />
              <StatCard
                title="Total Expenses"
                amount={stats?.totalExpenses || 0}
                type="expense"
                trend={{
                  value: stats?.monthOverMonthExpenseGrowth || 0,
                  isPositiveGood: false,
                  label: "vs last month",
                }}
              />
              <StatCard
                title="Monthly Savings"
                amount={stats?.monthlySavings || 0}
                type="savings"
                subtitle={`${stats?.savingsRate || 0}% Savings Rate`}
              />
            </div>

            {/* Smart Financial Insights */}
            <FinancialInsights insights={stats?.insights || []} />

            {/* Charts Row: Income vs Expense & Category Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <IncomeExpenseChart data={stats?.monthlyTrend || []} />
              <CategoryChart data={stats?.categorySpending || []} />
            </div>

            {/* Spending Trend Velocity Chart */}
            <SpendingTrendChart data={stats?.monthlyTrend || []} />

            {/* Recent Transactions List */}
            <RecentTransactions
              transactions={stats?.recentTransactions || []}
              onAddTransaction={() => setIsTxModalOpen(true)}
            />
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        open={isTxModalOpen}
        onOpenChange={setIsTxModalOpen}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}
