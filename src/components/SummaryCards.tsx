import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ElementType;
  trend?: number;
  color: 'blue' | 'green' | 'red';
}

const StatCard = ({ title, amount, icon: Icon, trend, color }: StatCardProps) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {formatCurrency(amount)}
        </h3>
      </div>
    </motion.div>
  );
};

export const SummaryCards = () => {
  const { transactions } = useFinance();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total Income" 
        amount={totalIncome} 
        icon={TrendingUp} 
        trend={8.2}
        color="green" 
      />
      <StatCard 
        title="Savings" 
        amount={savings} 
        icon={Wallet} 
        trend={12.5}
        color="blue" 
      />
      <StatCard 
        title="Total Expenses" 
        amount={totalExpenses} 
        icon={TrendingDown} 
        trend={-3.1}
        color="red" 
      />
    </div>
  );
};
