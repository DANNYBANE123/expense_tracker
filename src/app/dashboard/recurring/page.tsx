"use client";

import * as React from "react";
import { Header } from "@/components/dashboard/header";
import { RecurringModal } from "@/components/recurring/recurring-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IRecurringTransaction, ICategory } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import {
  Repeat,
  PlusCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function RecurringPage() {
  const [loading, setLoading] = React.useState(true);
  const [recurring, setRecurring] = React.useState<IRecurringTransaction[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [syncing, setSyncing] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedRecurring, setSelectedRecurring] =
    React.useState<IRecurringTransaction | null>(null);

  React.useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchRecurring = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/recurring");
      if (!res.ok) throw new Error("Failed to load recurring schedules");
      const data = await res.json();
      setRecurring(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load recurring schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/recurring/process", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process recurring transactions");
      toast.success("Execution Complete", { description: data.message });
      fetchRecurring();
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (rec: IRecurringTransaction) => {
    setSelectedRecurring(rec);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete recurring schedule "${name}"?`)) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete recurring schedule");
      toast.success("Schedule deleted");
      fetchRecurring();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  // Summaries
  const activeSchedules = recurring.filter((r) => r.isActive);
  const monthlyExpenseCommitment = activeSchedules
    .filter((r) => r.type === "expense")
    .reduce((acc, r) => acc + r.amount, 0);
  const monthlyIncomeCommitment = activeSchedules
    .filter((r) => r.type === "income")
    .reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Recurring Transactions & Subscriptions"
        subtitle="Automate repetitive financial streams with automated deduplication checks"
        onRefresh={fetchRecurring}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
            <Card className="px-4 py-3 border-slate-200/80 dark:border-slate-800/80 min-w-[160px]">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Active Schedules
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {activeSchedules.length}
              </p>
            </Card>
            <Card className="px-4 py-3 border-slate-200/80 dark:border-slate-800/80 min-w-[160px]">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Monthly Commitments
              </span>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(monthlyExpenseCommitment)}
              </p>
            </Card>
            <Card className="px-4 py-3 border-slate-200/80 dark:border-slate-800/80 min-w-[160px]">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Monthly Inflows
              </span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(monthlyIncomeCommitment)}
              </p>
            </Card>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncNow}
              disabled={syncing}
              className="text-xs"
              title="Check for and execute any due recurring transactions right now"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
              Process Due Now
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedRecurring(null);
                setIsModalOpen(true);
              }}
              className="text-xs font-semibold shadow-sm shadow-blue-500/20"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              New Schedule
            </Button>
          </div>
        </div>

        {/* Schedules Grid / List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : recurring.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <Repeat className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              No recurring transactions scheduled
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Set up monthly rent, software subscriptions, SIP investments, or salaries to be automatically recorded without manual intervention.
            </p>
            <Button
              onClick={() => {
                setSelectedRecurring(null);
                setIsModalOpen(true);
              }}
              className="mt-4 text-xs font-semibold"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create First Schedule
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurring.map((rec) => {
              const isIncome = rec.type === "income";
              return (
                <Card
                  key={rec._id}
                  className="hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800/80"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {rec.description || rec.categoryName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {rec.categoryName} • {rec.frequency.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(rec)}
                          className="rounded-md p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec._id, rec.description || rec.categoryName)}
                          className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Amount
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(rec.amount)}
                        </span>
                      </div>

                      <Badge
                        variant={rec.isActive ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {rec.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1 text-[11px]">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Next: {format(new Date(rec.nextExecutionDate), "dd MMM yyyy")}</span>
                      </span>

                      <span className="uppercase text-[10px] font-medium text-slate-400">
                        {rec.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <RecurringModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categories={categories}
        recurringToEdit={selectedRecurring}
        onSuccess={fetchRecurring}
      />
    </div>
  );
}
