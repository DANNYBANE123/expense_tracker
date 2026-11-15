"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, paiseToRupees } from "@/lib/utils/currency";

interface CategorySpendingItem {
  name: string;
  amount: number; // in paise
  color: string;
  percentage: number;
}

interface CategoryChartProps {
  data: CategorySpendingItem[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = React.useMemo(() => {
    return (data || []).map((item) => ({
      name: item.name,
      value: paiseToRupees(item.amount),
      color: item.color,
      percentage: item.percentage,
      amountPaise: item.amount,
    }));
  }, [data]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Current month's expense distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-400">
            No expenses recorded this month.
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `₹${Number(value || 0).toLocaleString("en-IN")} (${props.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "rgba(51, 65, 85, 0.6)",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "0.85rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown list */}
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {chartData.slice(0, 5).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.amountPaise)}
                    </span>
                    <span className="text-slate-400 w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
