import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Transaction, UserRole, View, TransactionFilters, Goal, Category } from '../types';
import { MOCK_TRANSACTIONS, MOCK_GOALS } from '../data/mockData';

interface FinanceContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  goals: Goal[];
  filters: TransactionFilters;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  role: UserRole;
  isDarkMode: boolean;
  activeView: View;
  setRole: (role: UserRole) => void;
  setActiveView: (view: View) => void;
  toggleDarkMode: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: string) => void;
  editGoal: (goal: Goal) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  allocateSavings: (amount: number) => void;
  getGoalSuggestions: (goal: Goal) => { category: Category; currentSpend: number; potentialSaving: number; reason: string }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : MOCK_GOALS;
  });

  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      const contributions = transactions
        .filter(t => t.category === 'Savings' && t.description.includes(`[Goal: ${goal.title}]`))
        .reduce((acc, t) => acc + t.amount, 0);
      return { 
        ...goal, 
        currentAmount: contributions,
        allocationPercentage: Number(goal.allocationPercentage) || 0 
      };
    });
  }, [goals, transactions]);

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('userRole');
    return (saved as UserRole) || 'admin';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    category: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = filters.type === 'all' || t.type === filters.type;
        const matchesCategory = !filters.category || t.category === filters.category;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return filters.sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [transactions, filters]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions([transaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const editTransaction = (updatedTx: Transaction) => {
    setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Math.random().toString(36).substr(2, 9),
    };
    setGoals([goal, ...goals]);
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const editGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().slice(0, 10),
      amount,
      type: 'expense',
      category: 'Savings',
      description: `Contribution to [Goal: ${goal.title}]`,
    };

    setTransactions([transaction, ...transactions]);
  };

  const allocateSavings = (amount: number) => {
    const activeGoals = goals.filter(g => g.allocationPercentage > 0);
    if (activeGoals.length === 0) return;

    const newTransactions: Transaction[] = activeGoals.map(goal => ({
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().slice(0, 10),
      amount: (amount * goal.allocationPercentage) / 100,
      type: 'expense',
      category: 'Savings',
      description: `Auto-Allocation to [Goal: ${goal.title}] (${goal.allocationPercentage}%)`,
    }));

    setTransactions([...newTransactions, ...transactions]);
  };

  const getGoalSuggestions = (goal: Goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return [];

    // Analyze last 30 days of expenses
    const last30Days = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const categorySpending = last30Days.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const suggestions: { category: Category; currentSpend: number; potentialSaving: number; reason: string }[] = [];

    // Suggest reductions in non-essential categories
    const nonEssentialCategories: Category[] = ['Entertainment', 'Shopping', 'Food & Dining', 'Other'];
    
    nonEssentialCategories.forEach(cat => {
      const spend = categorySpending[cat] || 0;
      if (spend > 2000) { // If spending more than 2000 in a month
        suggestions.push({
          category: cat,
          currentSpend: spend,
          potentialSaving: Math.floor(spend * 0.3), // Suggest 30% reduction
          reason: `High spending in ${cat}. Reducing this by 30% could save ${fmt(spend * 0.3)} monthly.`
        });
      }
    });

    return suggestions;
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  return (
    <FinanceContext.Provider value={{
      transactions,
      filteredTransactions,
      goals: goalsWithProgress,
      filters,
      setFilters,
      role,
      isDarkMode,
      activeView,
      setRole,
      setActiveView,
      toggleDarkMode,
      addTransaction,
      deleteTransaction,
      editTransaction,
      addGoal,
      deleteGoal,
      editGoal,
      contributeToGoal,
      allocateSavings,
      getGoalSuggestions
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
