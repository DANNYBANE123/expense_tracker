"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { transactionSchema, TransactionInput } from "@/lib/validations/transaction.schema";
import { ICategory, ITransaction } from "@/types";
import { paiseToRupees } from "@/lib/utils/currency";
import { toast } from "sonner";
import { format } from "date-fns";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ICategory[];
  transactionToEdit?: ITransaction | null;
  onSuccess: () => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  categories,
  transactionToEdit,
  onSuccess,
}: TransactionModalProps) {
  const isEditing = !!transactionToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      categoryId: "",
      categoryName: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "upi",
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("categoryId");

  // Filter categories matching the selected type
  const availableCategories = React.useMemo(() => {
    return categories.filter((c) => c.type === selectedType);
  }, [categories, selectedType]);

  // Reset or populate form when opened or editing changes
  React.useEffect(() => {
    if (transactionToEdit) {
      setValue("type", transactionToEdit.type);
      setValue("amount", paiseToRupees(transactionToEdit.amount));
      const catId =
        typeof transactionToEdit.categoryId === "object"
          ? (transactionToEdit.categoryId as any)._id
          : transactionToEdit.categoryId;
      setValue("categoryId", catId);
      setValue("categoryName", transactionToEdit.categoryName);
      setValue("description", transactionToEdit.description || "");
      setValue(
        "date",
        format(new Date(transactionToEdit.date), "yyyy-MM-dd")
      );
      setValue("paymentMethod", transactionToEdit.paymentMethod);
    } else {
      reset({
        type: "expense",
        amount: undefined as any,
        categoryId: "",
        categoryName: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        paymentMethod: "upi",
      });
    }
  }, [transactionToEdit, setValue, reset, open]);

  // Auto-select categoryName when categoryId changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setValue("categoryId", id);
    const cat = categories.find((c) => c._id === id);
    if (cat) {
      setValue("categoryName", cat.name);
    }
  };

  const onSubmit = async (data: TransactionInput) => {
    try {
      const url = isEditing
        ? `/api/transactions/${transactionToEdit._id}`
        : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save transaction");
      }

      toast.success(
        isEditing ? "Transaction Updated" : "Transaction Created",
        {
          description: `${data.categoryName} • ₹${data.amount}`,
        }
      );
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "Record New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update transaction details in your ledger."
              : "Enter amount and category to log an income or expense."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Toggle: Income vs Expense */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setValue("type", "expense");
                  setValue("categoryId", "");
                  setValue("categoryName", "");
                }}
                className={`rounded-md py-1.5 text-xs font-bold transition-all ${
                  selectedType === "expense"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("type", "income");
                  setValue("categoryId", "");
                  setValue("categoryName", "");
                }}
                className={`rounded-md py-1.5 text-xs font-bold transition-all ${
                  selectedType === "income"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount (in INR) */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 text-base font-bold"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select a category</option>
              {availableCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Description / Note (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Grocery restock, Swiggy dinner, Tech Salary..."
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Date & Payment Method (Two columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Date
              </label>
              <Input type="date" {...register("date")} />
              {errors.date && (
                <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Payment Method
              </label>
              <select
                {...register("paymentMethod")}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="net_banking">Net Banking</option>
                <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Transaction"
                : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
