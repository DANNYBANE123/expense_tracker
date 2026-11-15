"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddTransaction?: () => void;
  onRefresh?: () => void;
}

export function Header({
  title,
  subtitle,
  onAddTransaction,
  onRefresh,
}: HeaderProps) {
  const [seeding, setSeeding] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed demo data");
      toast.success("Demo Financial Data Loaded!", {
        description: `Generated realistic transactions, budgets, and recurring schedules.`,
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to seed demo data");
    } finally {
      setSeeding(false);
    }
  };

  const handleProcessRecurring = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/recurring/process", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync recurring transactions");
      toast.success("Recurring Schedules Synced", {
        description: data.message,
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to process recurring transactions");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      {/* Title & Subtitle */}
      <div className="pl-10 lg:pl-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Seed Demo Data Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDemoData}
          disabled={seeding}
          className="hidden md:inline-flex text-xs border-dashed text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          title="Seed realistic transactions and budgets for major project demo"
        >
          <Database className={`h-3.5 w-3.5 mr-1.5 ${seeding ? "animate-spin" : ""}`} />
          {seeding ? "Seeding..." : "Load Demo Data"}
        </Button>

        {/* Sync Recurring */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleProcessRecurring}
          disabled={syncing}
          className="h-9 w-9 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          title="Sync & Process Due Recurring Transactions"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* New Transaction Button */}
        {onAddTransaction && (
          <Button
            size="sm"
            onClick={onAddTransaction}
            className="shadow-sm shadow-blue-500/20 text-xs sm:text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>
    </header>
  );
}
