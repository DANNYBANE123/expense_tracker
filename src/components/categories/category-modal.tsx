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
import { categorySchema, CategoryInput } from "@/lib/validations/category.schema";
import { ICategory } from "@/types";
import { toast } from "sonner";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: ICategory | null;
  onSuccess: () => void;
}

const COLOR_PRESETS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

export function CategoryModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess,
}: CategoryModalProps) {
  const isEditing = !!categoryToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "expense",
      color: "#3b82f6",
      icon: "Tag",
    },
  });

  const selectedColor = watch("color");
  const selectedType = watch("type");

  React.useEffect(() => {
    if (categoryToEdit) {
      setValue("name", categoryToEdit.name);
      setValue("type", categoryToEdit.type);
      setValue("color", categoryToEdit.color || "#3b82f6");
      setValue("icon", categoryToEdit.icon || "Tag");
    } else {
      reset({
        name: "",
        type: "expense",
        color: "#3b82f6",
        icon: "Tag",
      });
    }
  }, [categoryToEdit, setValue, reset, open]);

  const onSubmit = async (data: CategoryInput) => {
    try {
      const url = isEditing
        ? `/api/categories/${categoryToEdit._id}`
        : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save category");
      }

      toast.success(isEditing ? "Category Updated" : "Category Created", {
        description: `${data.name} (${data.type})`,
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
            {isEditing ? "Edit Category" : "Add Custom Category"}
          </DialogTitle>
          <DialogDescription>
            Organize and classify your income and spending streams.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Type */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setValue("type", "expense")}
                className={`rounded-md py-1.5 text-xs font-bold transition-all ${
                  selectedType === "expense"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "income")}
                className={`rounded-md py-1.5 text-xs font-bold transition-all ${
                  selectedType === "income"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                Income Category
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
              Category Name
            </label>
            <Input
              placeholder="e.g. Subscriptions, Crypto, Freelance..."
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Color Tag & Presets */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">
              Color Tag
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <span
                className="h-8 w-8 rounded-lg shadow-sm border border-slate-300 dark:border-slate-700 shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <Input
                type="text"
                placeholder="#3b82f6"
                {...register("color")}
                className="font-mono text-xs uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`h-6 w-6 rounded-md transition-transform hover:scale-110 ${
                    selectedColor === color
                      ? "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {errors.color && (
              <p className="mt-1 text-xs text-red-500">{errors.color.message}</p>
            )}
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
                ? "Update Category"
                : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
