"use client";

import * as React from "react";
import { Header } from "@/components/dashboard/header";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetModal } from "@/components/budgets/budget-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IBudget, ICategory } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Target,
  PlusCircle,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function BudgetsPage() {
  const [loading, setLoading] = React.useState(true);
  const [budgets, setBudgets] = React.useState<IBudget[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);

  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBudget, setSelectedBudget] = React.useState<IBudget | null>(null);

  // Fetch categories once
  React.useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch budgets for the selected month/year
  const fetchBudgets = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to load budgets");
      const data = await res.json();
      setBudgets(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  React.useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleEdit = (b: IBudget) => {
    setSelectedBudget(b);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget");
      toast.success("Budget Deleted");
      fetchBudgets();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  // Summaries
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage =
    totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const exceededBudgets = budgets.filter((b) => (b.percentageUsed || 0) >= 100);
  const warningBudgets = budgets.filter(
    (b) =>
      (b.percentageUsed || 0) >= (b.alertThreshold || 80) &&
      (b.percentageUsed || 0) < 100
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Budget Planning & Limits"
        subtitle="Set strict spending thresholds and receive proactive budget utilization alerts"
        onRefresh={fetchBudgets}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Month Picker & Set Budget CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-xs font-semibold uppercase text-slate-500">
              <Calendar className="h-4 w-4 mr-1.5" />
              Period:
            </span>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="shadow-sm shadow-blue-500/20 text-xs sm:text-sm"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Set New Budget
          </Button>
        </div>

        {/* Warning Banners if any budget exceeded or 80%+ */}
        {exceededBudgets.length > 0 && (
          <div className="flex items-center space-x-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300">
            <AlertOctagon className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="text-xs">
              <strong className="font-semibold block sm:inline">
                Budget Exceeded Alert:{" "}
              </strong>
              {exceededBudgets.map((b) => b.categoryName).join(", ")} has breached its
              limit. Review recent purchases immediately.
            </div>
          </div>
        )}

        {warningBudgets.length > 0 && (
          <div className="flex items-center space-x-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs">
              <strong className="font-semibold block sm:inline">
                Utilization Warning (80%+ Consumed):{" "}
              </strong>
              {warningBudgets
                .map((b) => `${b.categoryName} (${b.percentageUsed}%)`)
                .join(", ")}{" "}
              is near its limit.
            </div>
          </div>
        )}

        {/* Overall Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Total Budgeted
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(totalBudgeted)}
            </p>
          </Card>
          <Card className="p-4 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Total Actual Spent
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(totalSpent)}
            </p>
          </Card>
          <Card className="p-4 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Remaining Budget
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalRemaining)}
            </p>
          </Card>
        </div>

        {/* Budgets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <Target className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              No budgets established for this period
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Create a monthly overall budget or define category-specific caps to stay disciplined.
            </p>
            <Button
              onClick={() => {
                setSelectedBudget(null);
                setIsModalOpen(true);
              }}
              className="mt-4 text-xs font-semibold"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Set First Budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <BudgetCard
                key={b._id}
                budget={b}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categories={categories}
        budgetToEdit={selectedBudget}
        onSuccess={fetchBudgets}
        selectedMonth={month}
        selectedYear={year}
      />
    </div>
  );
}
