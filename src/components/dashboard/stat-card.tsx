import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  title: string;
  amount: number; // in paise
  type: "balance" | "income" | "expense" | "savings";
  trend?: {
    value: number; // percentage
    isPositiveGood?: boolean;
    label?: string;
  };
  subtitle?: string;
}

export function StatCard({
  title,
  amount,
  type,
  trend,
  subtitle,
}: StatCardProps) {
  const config = {
    balance: {
      icon: Wallet,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
      accent: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/10 to-transparent",
    },
    income: {
      icon: ArrowDownLeft,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      accent: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500/10 to-transparent",
    },
    expense: {
      icon: ArrowUpRight,
      iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
      accent: "text-rose-600 dark:text-rose-400",
      gradient: "from-rose-500/10 to-transparent",
    },
    savings: {
      icon: PiggyBank,
      iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
      accent: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500/10 to-transparent",
    },
  }[type];

  const Icon = config.icon;

  return (
    <Card className="relative overflow-hidden border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/60 transition-all hover:shadow-md">
      {/* Subtle background glow */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-50 blur-2xl",
          config.gradient
        )}
      />

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              config.iconBg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {formatCurrency(amount)}
          </h3>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <div className="flex items-center space-x-1 ml-auto font-medium">
              {trend.value >= 0 ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    trend.isPositiveGood !== false
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                  )}
                >
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{trend.value}%
                </span>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    trend.isPositiveGood === false
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                  )}
                >
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                  {trend.value}%
                </span>
              )}
              {trend.label && <span className="text-[11px] text-slate-400">{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
