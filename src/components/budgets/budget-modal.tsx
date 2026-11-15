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
import { budgetSchema, BudgetInput } from "@/lib/validations/budget.schema";
import { ICategory, IBudget } from "@/types";
import { paiseToRupees } from "@/lib/utils/currency";
import { toast } from "sonner";

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ICategory[];
  budgetToEdit?: IBudget | null;
  onSuccess: () => void;
  selectedMonth: number;
  selectedYear: number;
}

export function BudgetModal({
  open,
  onOpenChange,
  categories,
  budgetToEdit,
  onSuccess,
  selectedMonth,
  selectedYear,
}: BudgetModalProps) {
  const isEditing = !!budgetToEdit;
  const expenseCategories = React.useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: "",
      categoryName: "Overall Monthly Budget",
      amount: 0,
      month: selectedMonth,
      year: selectedYear,
      alertThreshold: 80,
    },
  });

  const selectedCategoryId = watch("categoryId");

  React.useEffect(() => {
    if (budgetToEdit) {
      const catId =
        budgetToEdit.categoryId && typeof budgetToEdit.categoryId === "object"
          ? (budgetToEdit.categoryId as any)._id
          : budgetToEdit.categoryId || "";
      setValue("categoryId", catId);
      setValue("categoryName", budgetToEdit.categoryName);
      setValue("amount", paiseToRupees(budgetToEdit.amount));
      setValue("month", budgetToEdit.month);
      setValue("year", budgetToEdit.year);
      setValue("alertThreshold", budgetToEdit.alertThreshold || 80);
    } else {
      reset({
        categoryId: "",
        categoryName: "Overall Monthly Budget",
        amount: undefined as any,
        month: selectedMonth,
        year: selectedYear,
        alertThreshold: 80,
      });
    }
  }, [budgetToEdit, selectedMonth, selectedYear, setValue, reset, open]);

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("categoryId", val || null);
    if (!val) {
      setValue("categoryName", "Overall Monthly Budget");
    } else {
      const cat = expenseCategories.find((c) => c._id === val);
      if (cat) {
        setValue("categoryName", cat.name);
      }
    }
  };

  const onSubmit = async (data: BudgetInput) => {
    try {
      const url = isEditing
        ? `/api/budgets/${budgetToEdit._id}`
        : "/api/budgets";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save budget");
      }

      toast.success(isEditing ? "Budget Updated" : "Budget Created", {
        description: `${data.categoryName} set to ₹${data.amount}`,
      });
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
            {isEditing ? "Edit Budget Limit" : "Set New Budget Target"}
          </DialogTitle>
          <DialogDescription>
            Allocate financial ceilings for the whole month or a specific expense category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Budget Scope / Category
            </label>
            <select
              value={selectedCategoryId || ""}
              onChange={handleCategorySelect}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Overall Monthly Budget (All Expenses)</option>
              {expenseCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} Category
                </option>
              ))}
            </select>
          </div>

          {/* Amount (₹) */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Budget Target Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
                ₹
              </span>
              <Input
                type="number"
                step="1"
                placeholder="e.g. 15000"
                className="pl-8 text-base font-bold"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Alert Threshold Slider / Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Warning Alert Threshold
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {watch("alertThreshold") || 80}%
              </span>
            </div>
            <Input
              type="number"
              min={10}
              max={100}
              {...register("alertThreshold", { valueAsNumber: true })}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              You will be alerted automatically on the dashboard when spending exceeds this percentage.
            </p>
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Month
              </label>
              <Input
                type="number"
                min={1}
                max={12}
                {...register("month", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Year
              </label>
              <Input
                type="number"
                min={2020}
                max={2030}
                {...register("year", { valueAsNumber: true })}
              />
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
                ? "Update Budget"
                : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
