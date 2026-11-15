"use client";

import * as React from "react";
import { Header } from "@/components/dashboard/header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ITransaction, ICategory } from "@/types";
import { toast } from "sonner";

export default function TransactionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [transactions, setTransactions] = React.useState<ITransaction[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filter & Search states
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [categoryId, setCategoryId] = React.useState("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [sortBy, setSortBy] = React.useState("date");
  const [sortOrder, setSortOrder] = React.useState("desc");
  const [page, setPage] = React.useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTx, setSelectedTx] = React.useState<ITransaction | null>(null);

  // Fetch Categories once
  React.useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

  // Fetch Transactions with current filters
  const fetchTransactions = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (type !== "all") params.append("type", type);
      if (categoryId !== "all") params.append("categoryId", categoryId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err: any) {
      toast.error(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [search, type, categoryId, startDate, endDate, sortBy, sortOrder, page]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleEdit = (tx: ITransaction) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");

      toast.success("Transaction Deleted");
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (type !== "all") params.append("type", type);
    if (categoryId !== "all") params.append("categoryId", categoryId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    window.open(`/api/export?${params.toString()}`, "_blank");
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setCategoryId("all");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Transactions Ledger"
        subtitle="Search, filter, categorize, and audit all financial transactions"
        onAddTransaction={() => {
          setSelectedTx(null);
          setIsModalOpen(true);
        }}
        onRefresh={fetchTransactions}
      />

      <div className="p-4 sm:p-8 space-y-4 max-w-7xl mx-auto w-full">
        {/* Filter Controls */}
        <TransactionFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          type={type}
          onTypeChange={(v) => {
            setType(v);
            setPage(1);
          }}
          categoryId={categoryId}
          onCategoryChange={(v) => {
            setCategoryId(v);
            setPage(1);
          }}
          startDate={startDate}
          onStartDateChange={(v) => {
            setStartDate(v);
            setPage(1);
          }}
          endDate={endDate}
          onEndDateChange={(v) => {
            setEndDate(v);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          categories={categories}
          onExportCSV={handleExportCSV}
          onReset={handleResetFilters}
        />

        {/* Transactions Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={pagination}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Transaction Create / Edit Modal */}
      <TransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categories={categories}
        transactionToEdit={selectedTx}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
