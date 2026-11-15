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
import { recurringSchema, RecurringInput } from "@/lib/validations/recurring.schema";
import { ICategory, IRecurringTransaction } from "@/types";
import { paiseToRupees } from "@/lib/utils/currency";
import { toast } from "sonner";
import { format } from "date-fns";

interface RecurringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ICategory[];
  recurringToEdit?: IRecurringTransaction | null;
  onSuccess: () => void;
}

export function RecurringModal({
  open,
  onOpenChange,
  categories,
  recurringToEdit,
  onSuccess,
}: RecurringModalProps) {
  const isEditing = !!recurringToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecurringInput>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      categoryId: "",
      categoryName: "",
      description: "",
      frequency: "monthly",
      paymentMethod: "upi",
      startDate: format(new Date(), "yyyy-MM-dd"),
      isActive: true,
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("categoryId");

  const availableCategories = React.useMemo(() => {
    return categories.filter((c) => c.type === selectedType);
  }, [categories, selectedType]);

  React.useEffect(() => {
    if (recurringToEdit) {
      setValue("type", recurringToEdit.type);
      setValue("amount", paiseToRupees(recurringToEdit.amount));
      const catId =
        typeof recurringToEdit.categoryId === "object"
          ? (recurringToEdit.categoryId as any)._id
          : recurringToEdit.categoryId;
      setValue("categoryId", catId);
      setValue("categoryName", recurringToEdit.categoryName);
      setValue("description", recurringToEdit.description || "");
      setValue("frequency", recurringToEdit.frequency);
      setValue("paymentMethod", recurringToEdit.paymentMethod);
      setValue(
        "startDate",
        format(new Date(recurringToEdit.startDate), "yyyy-MM-dd")
      );
      if (recurringToEdit.endDate) {
        setValue(
          "endDate",
          format(new Date(recurringToEdit.endDate), "yyyy-MM-dd")
        );
      }
      setValue("isActive", recurringToEdit.isActive);
    } else {
      reset({
        type: "expense",
        amount: undefined as any,
        categoryId: "",
        categoryName: "",
        description: "",
        frequency: "monthly",
        paymentMethod: "upi",
        startDate: format(new Date(), "yyyy-MM-dd"),
        isActive: true,
      });
    }
  }, [recurringToEdit, setValue, reset, open]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setValue("categoryId", id);
    const cat = categories.find((c) => c._id === id);
    if (cat) {
      setValue("categoryName", cat.name);
    }
  };

  const onSubmit = async (data: RecurringInput) => {
    try {
      const url = isEditing
        ? `/api/recurring/${recurringToEdit._id}`
        : "/api/recurring";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save recurring schedule");
      }

      toast.success(
        isEditing
          ? "Recurring Schedule Updated"
          : "Recurring Schedule Created",
        {
          description: `${data.frequency.toUpperCase()} • ${data.categoryName} • ₹${data.amount}`,
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
            {isEditing ? "Edit Recurring Schedule" : "New Recurring Schedule"}
          </DialogTitle>
          <DialogDescription>
            Automate routine transactions such as monthly rent, subscriptions, or salaries.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">
              Type
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
                Recurring Expense
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
                Recurring Income
              </button>
            </div>
          </div>

          {/* Amount */}
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

          {/* Category */}
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

          {/* Frequency & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Cadence Frequency
              </label>
              <select
                {...register("frequency")}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Payment Method
              </label>
              <select
                {...register("paymentMethod")}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="bank_transfer">Bank Transfer (Auto-Debit)</option>
                <option value="credit_card">Credit Card Subscription</option>
                <option value="upi">UPI Auto-pay</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                Start Date
              </label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                End Date (Optional)
              </label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Label / Notes
            </label>
            <Input
              type="text"
              placeholder="e.g. Netflix, Rent to Landlord, Gym membership..."
              {...register("description")}
            />
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
                ? "Update Schedule"
                : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
