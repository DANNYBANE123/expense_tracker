"use client";

import * as React from "react";
import { ITransaction } from "@/types";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import {
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  CreditCard,
  Building,
  Banknote,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionTableProps {
  transactions: ITransaction[];
  onEdit: (tx: ITransaction) => void;
  onDelete: (id: string) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
  onPageChange?: (newPage: number) => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: TransactionTableProps) {
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
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
            <tr>
              <th className="py-3 px-4">Transaction / Note</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <tr
                    key={tx._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Note / Description */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
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
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                            {tx.description || tx.categoryName}
                          </p>
                          {tx.recurringTransactionId && (
                            <span className="inline-flex items-center text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                              <Repeat className="h-2.5 w-2.5 mr-0.5" />
                              Auto Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs font-medium">
                        {tx.categoryName}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {format(new Date(tx.date), "dd MMM yyyy")}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5 uppercase font-medium text-[11px]">
                        {getMethodIcon(tx.paymentMethod)}
                        <span>{tx.paymentMethod.replace("_", " ")}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                      <span
                        className={
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-slate-100"
                        }
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEdit(tx)}
                          className="rounded-md p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete this transaction of ${formatCurrency(
                                  tx.amount
                                )}?`
                              )
                            ) {
                              onDelete(tx._id);
                            }
                          }}
                          className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-500">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} records)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
