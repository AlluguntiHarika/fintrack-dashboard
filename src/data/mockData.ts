import { Transaction, Category, TransactionType } from '../types';
import { subDays } from 'date-fns';

export type { Transaction, Category, TransactionType };

export const incomeCategories: Category[] = ['Salary', 'Freelance', 'Other'];
export const expenseCategories: Category[] = ['Housing', 'Food & Dining', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Savings', 'Other'];
export const allCategories: Category[] = [...incomeCategories, ...expenseCategories];

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const type: TransactionType = Math.random() > 0.3 ? 'expense' : 'income';
    const categoryList = type === 'income' ? incomeCategories : expenseCategories;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    const date = subDays(now, Math.floor(Math.random() * 30));
    
    transactions.push({
      id: Math.random().toString(36).substr(2, 9),
      date: date.toISOString().slice(0, 10),
      amount: type === 'income' 
        ? Math.floor(Math.random() * 100000) + 30000 
        : Math.floor(Math.random() * 5000) + 100,
      category,
      type,
      description: `${category} ${type === 'income' ? 'Received' : 'Payment'}`,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_TRANSACTIONS = [
  ...generateMockTransactions(),
  {
    id: 's1',
    date: new Date().toISOString().slice(0, 10),
    description: 'Contribution to [Goal: New Laptop]',
    amount: 15000,
    type: 'expense' as TransactionType,
    category: 'Savings' as Category
  },
  {
    id: 's2',
    date: new Date().toISOString().slice(0, 10),
    description: 'Contribution to [Goal: Emergency Fund]',
    amount: 25000,
    type: 'expense' as TransactionType,
    category: 'Savings' as Category
  }
];

export const MOCK_GOALS = [
  {
    id: '1',
    title: 'New Laptop',
    targetAmount: 100000,
    currentAmount: 0,
    deadline: '2026-12-31',
    category: 'Shopping' as Category,
    allocationPercentage: 0
  },
  {
    id: '2',
    title: 'Emergency Fund',
    targetAmount: 300000,
    currentAmount: 0,
    deadline: '2027-06-30',
    category: 'Other' as Category,
    allocationPercentage: 0
  }
];
