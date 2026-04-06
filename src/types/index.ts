export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Housing' 
  | 'Food & Dining' 
  | 'Transport' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Health' 
  | 'Salary' 
  | 'Freelance' 
  | 'Savings'
  | 'Other';

export interface TransactionFilters {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: Category;
  type: TransactionType;
  description: string;
}

export type UserRole = 'admin' | 'viewer';
export type View = 'dashboard' | 'transactions' | 'analytics' | 'goals' | 'settings';

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: Category;
  allocationPercentage: number;
}

export interface DashboardState {
  transactions: Transaction[];
  goals: Goal[];
  role: UserRole;
  isDarkMode: boolean;
  activeView: View;
}
