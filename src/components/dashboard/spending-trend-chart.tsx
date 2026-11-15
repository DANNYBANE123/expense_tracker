"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { paiseToRupees } from "@/lib/utils/currency";

interface MonthlyTrendItem {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

interface SpendingTrendChartProps {
  data: MonthlyTrendItem[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const chartData = React.useMemo(() => {
    return (data || []).map((item) => ({
      month: item.month,
      Expense: paiseToRupees(item.expense),
      Savings: paiseToRupees(item.savings),
    }));
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Monthly Spending Velocity & Net Savings</CardTitle>
        <CardDescription>
          Visualize how expenditures and savings have progressed over recent billing cycles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No spending velocity data available yet.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  stroke="currentColor"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-500 dark:text-slate-400"
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value || 0).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(51, 65, 85, 0.6)",
                    borderRadius: "0.5rem",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="Monthly Expense"
                />
                <Area
                  type="monotone"
                  dataKey="Savings"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                  name="Net Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
