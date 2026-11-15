import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IFinancialInsight } from "@/types";
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  PieChart,
  Info,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FinancialInsightsProps {
  insights: IFinancialInsight[];
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  const getIcon = (iconName?: string, type?: string) => {
    switch (iconName) {
      case "AlertTriangle":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "AlertOctagon":
      case "AlertCircle":
        return <AlertOctagon className="h-4 w-4 text-rose-500" />;
      case "TrendingUp":
        return <TrendingUp className="h-4 w-4 text-amber-500" />;
      case "TrendingDown":
        return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      case "CheckCircle":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "PieChart":
        return <PieChart className="h-4 w-4 text-blue-500" />;
      case "PiggyBank":
        return <PiggyBank className="h-4 w-4 text-purple-500" />;
      case "ArrowUpRight":
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      default:
        return type === "danger" ? (
          <AlertOctagon className="h-4 w-4 text-rose-500" />
        ) : type === "warning" ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : type === "positive" ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : (
          <Sparkles className="h-4 w-4 text-blue-500" />
        );
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-rose-200/80 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20";
      case "warning":
        return "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20";
      case "positive":
        return "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20";
      default:
        return "border-blue-200/80 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20";
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-3 border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-r from-white via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/10 dark:to-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Smart Financial Intelligence
            </CardTitle>
            <CardDescription className="text-xs">
              Rule-based analytics derived in real time from your MongoDB transaction ledger
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-xs text-slate-400">
            No specific anomalies or alerts detected this month. Financial indicators are balanced.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "rounded-lg border p-3.5 transition-all hover:shadow-sm flex flex-col justify-between",
                  getBorderColor(insight.type)
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      {getIcon(insight.icon, insight.type)}
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {insight.title}
                      </h4>
                    </div>
                    {insight.metric && (
                      <Badge
                        variant={
                          insight.type === "danger"
                            ? "destructive"
                            : insight.type === "warning"
                            ? "warning"
                            : insight.type === "positive"
                            ? "success"
                            : "default"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {insight.metric}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
