import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Plus, Pencil, Trash2, Download } from "lucide-react";
import { allCategories, type Transaction, type Category, type TransactionType, expenseCategories, incomeCategories } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const TransactionForm = ({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Transaction;
  onSubmit: (tx: Omit<Transaction, "id"> & { id?: string }) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({
    date: initial?.date || new Date().toISOString().slice(0, 10),
    description: initial?.description || "",
    amount: initial?.amount?.toString() || "",
    type: (initial?.type || "expense") as TransactionType,
    category: (initial?.category || "Food & Dining") as Category,
  });

  const cats = form.type === "income" ? incomeCategories : expenseCategories;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...(initial?.id ? { id: initial.id } : {}),
          date: form.date,
          description: form.description,
          amount: parseFloat(form.amount),
          type: form.type,
          category: form.category,
        });
        onClose();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <Label>Type</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType, category: (e.target.value === "income" ? "Salary" : "Food & Dining") as Category })}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div>
          <Label>Category</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
          >
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" className="w-full">{initial ? "Update" : "Add"} Transaction</Button>
    </form>
  );
};

export const TransactionList = () => {
  const {
    filteredTransactions,
    filters,
    setFilters,
    role,
    addTransaction,
    editTransaction,
    deleteTransaction,
  } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();

  const toggleSort = () => {
    if (filters.sortBy === "date") {
      setFilters((f) => ({ ...f, sortBy: "amount" }));
    } else {
      setFilters((f) => ({ ...f, sortBy: "date", sortOrder: f.sortOrder === "asc" ? "desc" : "asc" }));
    }
  };

  const exportCSV = () => {
    const header = "Date,Description,Amount,Type,Category\n";
    const rows = filteredTransactions
      .map((t) => `${t.date},${t.description},${t.amount},${t.type},${t.category}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transactions</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {role === "admin" && (
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingTx(undefined); }}>
              <DialogTrigger render={<Button size="sm" className="gap-1" />}>
                <Plus className="h-3.5 w-3.5" /> Add
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTx ? "Edit" : "Add"} Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm
                  initial={editingTx}
                  onSubmit={(tx) => {
                    if (tx.id) editTransaction(tx as Transaction);
                    else addTransaction(tx);
                  }}
                  onClose={() => { setDialogOpen(false); setEditingTx(undefined); }}
                />
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            className="pl-8 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any }))}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {Array.from(new Set(allCategories)).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button variant="outline" size="icon" onClick={toggleSort} title="Toggle sort">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No transactions found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs">Date</th>
                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs">Description</th>
                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs hidden sm:table-cell">Category</th>
                <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs">Amount</th>
                {role === "admin" && (
                  <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs w-20">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{tx.description}</td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    <Badge variant="secondary" className="font-normal text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {tx.category}
                    </Badge>
                  </td>
                  <td className={`py-3 px-2 text-right font-semibold whitespace-nowrap ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                  </td>
                  {role === "admin" && (
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => { setEditingTx(tx); setDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => deleteTransaction(tx.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
