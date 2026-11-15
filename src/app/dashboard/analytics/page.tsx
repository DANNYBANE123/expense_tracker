"use client";

import * as React from "react";
import { Header } from "@/components/dashboard/header";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IDashboardStats, ICategory } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";
import { Download, TrendingUp, TrendingDown, PiggyBank, PieChart, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<IDashboardStats | null>(null);
  const [categories, setCategories] = React.useState<ICategory[]>([]);

  // Custom date-range export filters
  const [reportStartDate, setReportStartDate] = React.useState("");
  const [reportEndDate, setReportEndDate] = React.useState("");
  const [reportType, setReportType] = React.useState("all");

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, categoriesRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/categories"),
      ]);

      if (!analyticsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to load analytics");
      }

      const analyticsData = await analyticsRes.json();
      const categoriesData = await categoriesRes.json();

      setStats(analyticsData);
      setCategories(categoriesData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCustomReport = () => {
    const params = new URLSearchParams();
    if (reportType !== "all") params.append("type", reportType);
    if (reportStartDate) params.append("startDate", reportStartDate);
    if (reportEndDate) params.append("endDate", reportEndDate);

    window.open(`/api/export?${params.toString()}`, "_blank");
  };

  const highestCat =
    stats?.categorySpending && stats.categorySpending.length > 0
      ? stats.categorySpending[0]
      : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Analytics & Deep Financial Insights"
        subtitle="Comprehensive breakdown of spending velocity, category metrics & lifetime savings"
        onRefresh={fetchData}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <>
            {/* High Level Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold uppercase">Current Savings Rate</span>
                  <PiggyBank className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.savingsRate || 0}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Net saved: {formatCurrency(stats?.monthlySavings || 0)} this month
                </p>
              </Card>

              <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold uppercase">Top Spending Category</span>
                  <PieChart className="h-4 w-4 text-rose-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {highestCat?.name || "None"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {highestCat
                    ? `${formatCurrency(highestCat.amount)} (${highestCat.percentage}%)`
                    : "No expenses recorded"}
                </p>
              </Card>

              <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold uppercase">MoM Income Growth</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {(stats?.monthOverMonthIncomeGrowth || 0) >= 0 ? "+" : ""}
                  {stats?.monthOverMonthIncomeGrowth || 0}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Compared to previous month's gross earnings
                </p>
              </Card>

              <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold uppercase">MoM Expense Growth</span>
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {(stats?.monthOverMonthExpenseGrowth || 0) >= 0 ? "+" : ""}
                  {stats?.monthOverMonthExpenseGrowth || 0}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Compared to previous month's expenditures
                </p>
              </Card>
            </div>

            {/* Smart Insights Component */}
            <FinancialInsights insights={stats?.insights || []} />

            {/* Income vs Expense Comparison Chart & Category Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <IncomeExpenseChart data={stats?.monthlyTrend || []} />
              <CategoryChart data={stats?.categorySpending || []} />
            </div>

            {/* Spending Velocity Area Chart */}
            <SpendingTrendChart data={stats?.monthlyTrend || []} />

            {/* Custom Range Report Generator Card */}
            <Card className="border-slate-200/80 dark:border-slate-800/80">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <CardTitle>Custom Date-Range Report Generator</CardTitle>
                    <CardDescription>
                      Export official audit statements in CSV format for tax preparation, compliance, or academic evaluation.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      Stream Type
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="all">All Transactions</option>
                      <option value="expense">Expenses Only</option>
                      <option value="income">Income Only</option>
                    </select>
                  </div>
                  <div>
                    <Button
                      onClick={handleExportCustomReport}
                      className="w-full text-xs sm:text-sm font-semibold"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
