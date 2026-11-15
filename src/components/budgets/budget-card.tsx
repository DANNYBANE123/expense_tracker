import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IBudget } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Edit2,
  Trash2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BudgetCardProps {
  budget: IBudget;
  onEdit: (budget: IBudget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const percentage = budget.percentageUsed || 0;
  const isExceeded = percentage >= 100;
  const isWarning = percentage >= (budget.alertThreshold || 80) && !isExceeded;

  const getStatusBadge = () => {
    if (isExceeded) {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <AlertOctagon className="h-3 w-3 mr-1" />
          Exceeded ({percentage}%)
        </Badge>
      );
    }
    if (isWarning) {
      return (
        <Badge variant="warning" className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Alert: {percentage}% Used
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="flex items-center space-x-1">
        <CheckCircle className="h-3 w-3 mr-1" />
        On Track ({percentage}%)
      </Badge>
    );
  };

  const getIndicatorColor = () => {
    if (isExceeded) return "bg-rose-600 dark:bg-rose-500";
    if (isWarning) return "bg-amber-500 dark:bg-amber-400";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md border",
        isExceeded
          ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/10"
          : isWarning
          ? "border-amber-300 dark:border-amber-900/50 bg-amber-50/10"
          : "border-slate-200/80 dark:border-slate-800/80"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Target className="h-4 w-4" />
              </span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {budget.categoryName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Monthly target for {budget.month}/{budget.year}
            </p>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(budget)}
              className="rounded-md p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit budget"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete budget for "${budget.categoryName}"?`
                  )
                ) {
                  onDelete(budget._id);
                }
              }}
              className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete budget"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Percent */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Utilization</span>
            {getStatusBadge()}
          </div>
          <Progress
            value={Math.min(100, percentage)}
            indicatorClassName={getIndicatorColor()}
          />
        </div>

        {/* Spent vs Budgeted breakdown */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block">Spent</span>
            <span
              className={cn(
                "font-bold text-sm",
                isExceeded
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-slate-100"
              )}
            >
              {formatCurrency(budget.spent || 0)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block">Budget Limit</span>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {formatCurrency(budget.amount)}
            </span>
          </div>
        </div>

        {/* Remaining info */}
        <div className="mt-2 text-center text-xs pt-1">
          {isExceeded ? (
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Over budget by {formatCurrency(Math.abs(budget.remaining || 0))}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(budget.remaining || 0)}
              </strong>{" "}
              remaining this month
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
