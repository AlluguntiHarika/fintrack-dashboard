import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Target, TrendingDown, Lightbulb, Wallet, ArrowRight, History, X, Check } from "lucide-react";
import { allCategories } from "@/data/mockData";
import { Goal, Category, Transaction } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const GoalForm = ({
  onSubmit,
  initialData,
  onClose,
}: {
  onSubmit: (goal: Omit<Goal, "id" | "currentAmount">) => void;
  initialData?: Goal;
  onClose: () => void;
}) => {
  const { goals } = useFinance();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    targetAmount: initialData?.targetAmount || 0,
    deadline: initialData?.deadline || new Date().toISOString().split("T")[0],
    category: initialData?.category || "Other" as Category,
    allocationPercentage: initialData?.allocationPercentage || 0,
  });

  const totalAllocated = goals
    .filter(g => g.id !== initialData?.id)
    .reduce((acc, g) => acc + (Number(g.allocationPercentage) || 0), 0);
  
  const remainingAllocation = Math.max(0, 100 - totalAllocated);

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Goal Title</Label>
        <Input
          placeholder="e.g., New Laptop"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Target Amount</Label>
        <Input
          type="number"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Auto-Allocation Split (%)</Label>
          <span className="text-xs font-medium text-blue-600">{formData.allocationPercentage}%</span>
        </div>
        <Input
          type="range"
          min="0"
          max={remainingAllocation}
          step="5"
          value={formData.allocationPercentage}
          onChange={(e) => setFormData({ ...formData, allocationPercentage: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        />
        <p className="text-[10px] text-gray-500">
          Remaining available to split: {remainingAllocation - formData.allocationPercentage}%
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Deadline</Label>
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          >
            {Array.from(new Set(allCategories)).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onSubmit(formData); onClose(); }}>
          {initialData ? "Update Goal" : "Add Goal"}
        </Button>
      </div>
    </div>
  );
};

export function GoalsList() {
  const { goals, addGoal, deleteGoal, editGoal, role, getGoalSuggestions, contributeToGoal, allocateSavings, transactions, editTransaction, deleteTransaction } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [selectedGoalForSuggestions, setSelectedGoalForSuggestions] = useState<Goal | null>(null);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<Goal | null>(null);
  const [selectedGoalForHistory, setSelectedGoalForHistory] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense' && t.category !== 'Savings').reduce((acc, t) => acc + t.amount, 0);
  const savings = transactions.filter(t => t.category === 'Savings').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses - savings;

  const handleAddGoal = (data: Omit<Goal, "id" | "currentAmount">) => {
    addGoal({ ...data, currentAmount: 0 });
  };

  const handleEditGoal = (data: Omit<Goal, "id" | "currentAmount">) => {
    if (editingGoal) {
      editGoal({ ...data, id: editingGoal.id, currentAmount: editingGoal.currentAmount });
    }
  };

  const handleContribute = () => {
    if (selectedGoalForContribution && Number(contributionAmount) > 0) {
      contributeToGoal(selectedGoalForContribution.id, Number(contributionAmount));
      setContributionDialogOpen(false);
      setContributionAmount("");
      setSelectedGoalForContribution(null);
    }
  };

  const handleBulkAllocate = () => {
    if (Number(bulkAmount) > 0) {
      allocateSavings(Number(bulkAmount));
      setBulkDialogOpen(false);
      setBulkAmount("");
    }
  };

  const handleSaveTransactionEdit = (tx: Transaction) => {
    editTransaction({
      ...tx,
      amount: Number(editAmount),
      date: editDate
    });
    setEditingTransactionId(null);
  };

  const startEditingTransaction = (tx: Transaction) => {
    setEditingTransactionId(tx.id);
    setEditAmount(tx.amount.toString());
    setEditDate(tx.date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h2>
          <p className="text-gray-500 dark:text-gray-400">Track and achieve your savings targets</p>
        </div>
        {role === "admin" && (
          <div className="flex gap-2">
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger render={
                <Button variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/30 dark:text-blue-400">
                  <TrendingDown className="h-4 w-4" /> Auto-Split Savings
                </Button>
              } />
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Auto-Allocate Savings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">
                    This will split the amount between your goals based on their assigned percentages.
                  </p>
                  <div className="space-y-2">
                    {goals.filter(g => g.allocationPercentage > 0).map(g => (
                      <div key={g.id} className="flex justify-between text-xs">
                        <span>{g.title}</span>
                        <span className="font-bold">{g.allocationPercentage}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Total Amount to Allocate</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
                    <Button 
                      disabled={!bulkAmount || Number(bulkAmount) <= 0 || Number(bulkAmount) > balance}
                      onClick={handleBulkAllocate}
                    >
                      Allocate
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingGoal(undefined); }}>
              <DialogTrigger render={<Button className="gap-2"><Plus className="h-4 w-4" /> Add Goal</Button>} />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
                </DialogHeader>
                <GoalForm
                  onClose={() => setDialogOpen(false)}
                  onSubmit={editingGoal ? handleEditGoal : handleAddGoal}
                  initialData={editingGoal}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const suggestions = getGoalSuggestions(goal);

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Target className="h-5 w-5" />
                  </div>
                  {role === "admin" && (
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => { setEditingGoal(goal); setDialogOpen(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    {goal.allocationPercentage > 0 && (
                      <Badge variant="outline" className="bg-blue-50/50 text-[10px] text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {goal.allocationPercentage}% Split
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                      {goal.category}
                    </Badge>
                    <span>•</span>
                    <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{fmt(goal.currentAmount)}</span>
                    <span className="text-gray-500">Target: {fmt(goal.targetAmount)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <p className="text-right text-xs font-medium text-blue-600 dark:text-blue-400">
                    {progress.toFixed(0)}% Complete
                  </p>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button 
                    className="flex-1 gap-2" 
                    size="sm"
                    disabled={goal.currentAmount >= goal.targetAmount}
                    onClick={() => { setSelectedGoalForContribution(goal); setContributionDialogOpen(true); }}
                  >
                    <Wallet className="h-4 w-4" />
                    Contribute
                  </Button>
                  {suggestions.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedGoalForSuggestions(goal)}
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setSelectedGoalForHistory(goal); setHistoryDialogOpen(true); }}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </div>

                {suggestions.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <Lightbulb className="h-3 w-3" />
                      Savings Suggestions
                    </div>
                    {suggestions.slice(0, 2).map((s, i) => (
                      <div key={i} className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        <div className="flex items-center gap-2 font-medium">
                          <TrendingDown className="h-3 w-3" />
                          Reduce {s.category}
                        </div>
                        <p className="mt-1 opacity-80">{s.reason}</p>
                      </div>
                    ))}
                    {suggestions.length > 2 && (
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        className="w-full text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        onClick={() => setSelectedGoalForSuggestions(goal)}
                      >
                        View all suggestions
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Contribution Modal */}
      <Dialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Contribute to {selectedGoalForContribution?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">Available Savings</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">{fmt(balance)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount to Save</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="pl-8"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              </div>
              {Number(contributionAmount) > balance && (
                <p className="text-xs text-red-500">Amount exceeds available savings</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setContributionDialogOpen(false)}>Cancel</Button>
              <Button 
                disabled={!contributionAmount || Number(contributionAmount) <= 0 || Number(contributionAmount) > balance}
                onClick={handleContribute}
              >
                Confirm Contribution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggestions Modal */}
      <Dialog open={!!selectedGoalForSuggestions} onOpenChange={(o) => !o && setSelectedGoalForSuggestions(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedGoalForSuggestions && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Savings Plan for {selectedGoalForSuggestions.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Based on your spending patterns in the last 30 days, here's how you can save more to reach your target of {fmt(selectedGoalForSuggestions.targetAmount)}.
                </p>
                <div className="space-y-3">
                  {getGoalSuggestions(selectedGoalForSuggestions).map((s, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                      <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-200">{s.category}</h4>
                        <p className="text-sm text-amber-800/80 dark:text-amber-300/80">{s.reason}</p>
                        <div className="mt-2 flex gap-4 text-xs">
                          <div>
                            <span className="text-amber-600/60 dark:text-amber-400/60">Current Spend:</span>
                            <span className="ml-1 font-bold text-amber-900 dark:text-amber-200">{fmt(s.currentSpend)}</span>
                          </div>
                          <div>
                            <span className="text-amber-600/60 dark:text-amber-400/60">Potential Saving:</span>
                            <span className="ml-1 font-bold text-green-600 dark:text-green-400">+{fmt(s.potentialSaving)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
                    <Target className="h-4 w-4" />
                    Total Potential Monthly Savings
                  </div>
                  <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {fmt(getGoalSuggestions(selectedGoalForSuggestions).reduce((acc, s) => acc + s.potentialSaving, 0))}
                  </p>
                  {getGoalSuggestions(selectedGoalForSuggestions).reduce((acc, s) => acc + s.potentialSaving, 0) > 0 && (
                    <p className="mt-1 text-xs text-blue-800/60 dark:text-blue-300/60">
                      At this rate, you could reach your goal {Math.ceil((selectedGoalForSuggestions.targetAmount - selectedGoalForSuggestions.currentAmount) / getGoalSuggestions(selectedGoalForSuggestions).reduce((acc, s) => acc + s.potentialSaving, 0))} months sooner!
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedGoalForSuggestions(null)}>Got it, thanks!</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* History Modal */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              Contribution History: {selectedGoalForHistory?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <div className="space-y-3">
                {transactions
                  .filter(t => t.category === 'Savings' && t.description.includes(`[Goal: ${selectedGoalForHistory?.title}]`))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                      {editingTransactionId === tx.id ? (
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="h-8"
                            />
                            <Input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingTransactionId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleSaveTransactionEdit(tx)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{fmt(tx.amount)}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => startEditingTransaction(tx)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              className="text-red-500 hover:text-red-600"
                              onClick={() => deleteTransaction(tx.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                {transactions.filter(t => t.category === 'Savings' && t.description.includes(`[Goal: ${selectedGoalForHistory?.title}]`)).length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">No contributions yet.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
