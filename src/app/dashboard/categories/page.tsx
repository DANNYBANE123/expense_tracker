"use client";

import * as React from "react";
import { Header } from "@/components/dashboard/header";
import { CategoryModal } from "@/components/categories/category-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ICategory } from "@/types";
import { PlusCircle, Edit2, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [loading, setLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [activeTab, setActiveTab] = React.useState<"expense" | "income">("expense");

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<ICategory | null>(null);

  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => c.type === activeTab);
  }, [categories, activeTab]);

  const handleEdit = (category: ICategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Category Architecture"
        subtitle="Configure default and custom classification buckets for income and spending"
        onRefresh={fetchCategories}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Type Toggle & Add Category Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab("expense")}
              className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "expense"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              Expense Categories (
              {categories.filter((c) => c.type === "expense").length})
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              Income Categories (
              {categories.filter((c) => c.type === "income").length})
            </button>
          </div>

          <Button
            onClick={() => {
              setSelectedCategory(null);
              setIsModalOpen(true);
            }}
            className="shadow-sm shadow-blue-500/20 text-xs sm:text-sm font-semibold"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Add Custom Category
          </Button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <Tags className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              No categories configured for {activeTab}
            </h3>
            <Button
              onClick={() => {
                setSelectedCategory(null);
                setIsModalOpen(true);
              }}
              className="mt-4 text-xs font-semibold"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((c) => (
              <Card
                key={c._id}
                className="hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800/80"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span
                      className="h-4 w-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: c.color || "#6366f1" }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {c.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 mt-0.5"
                      >
                        {c.isDefault ? "Default" : "Custom"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleEdit(c)}
                      className="rounded-md p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!c.isDefault && (
                      <button
                        onClick={() => handleDelete(c._id, c.name)}
                        className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categoryToEdit={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
