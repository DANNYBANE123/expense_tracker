"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { paiseToRupees } from "@/lib/utils/currency";

interface MonthlyTrendItem {
  month: string;
  income: number; // in paise
  expense: number; // in paise
  savings: number; // in paise
}

interface IncomeExpenseChartProps {
  data: MonthlyTrendItem[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const formattedData = React.useMemo(() => {
    return (data || []).map((item) => ({
      month: item.month,
      Income: paiseToRupees(item.income),
      Expense: paiseToRupees(item.expense),
      Savings: paiseToRupees(item.savings),
    }));
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Income vs Expense Analysis</CardTitle>
        <CardDescription>
          Compare your total earnings, expenditures, and net savings across the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-400">
            No transaction history recorded yet.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                barGap={8}
              >
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
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="Expense"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
