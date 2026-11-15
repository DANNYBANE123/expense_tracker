import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { ITransaction } from "@/types";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
} from "lucide-react";

interface RecentTransactionsProps {
  transactions: ITransaction[];
  onAddTransaction?: () => void;
}

export function RecentTransactions({
  transactions,
  onAddTransaction,
}: RecentTransactionsProps) {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "upi":
        return <Smartphone className="h-3.5 w-3.5 text-blue-500" />;
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-3.5 w-3.5 text-purple-500" />;
      case "bank_transfer":
      case "net_banking":
        return <Building className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Banknote className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest ledger entries across all income and expense streams
          </CardDescription>
        </div>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No recent transactions recorded.
            </p>
            {onAddTransaction && (
              <button
                onClick={onAddTransaction}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Add your first transaction
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {tx.description || tx.categoryName}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>{tx.categoryName}</span>
                        <span>•</span>
                        <span>{format(new Date(tx.date), "dd MMM yyyy")}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 uppercase text-[10px] font-medium text-slate-500">
                          {getMethodIcon(tx.paymentMethod)}
                          <span>{tx.paymentMethod.replace("_", " ")}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p
                      className={`text-sm font-bold tracking-tight ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
