"use client";

import * as React from "react";
import { Search, Filter, Download, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ICategory } from "@/types";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  type: string;
  onTypeChange: (val: string) => void;
  categoryId: string;
  onCategoryChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortOrder: string;
  onSortOrderChange: (val: string) => void;
  categories: ICategory[];
  onExportCSV: () => void;
  onReset: () => void;
}

export function TransactionFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  categories,
  onExportCSV,
  onReset,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search notes or categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => onTypeChange("all")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                type === "all"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => onTypeChange("expense")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => onTypeChange("income")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Income
            </button>
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="h-9 text-xs font-medium ml-auto"
            title="Export filtered transactions as CSV"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Advanced Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {/* Category Select */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            From Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            To Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* Sort Controls */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Sort Order
          </label>
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
