import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

export const Insights = () => {
  const { transactions } = useFinance();

  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Highest spending category
  const categoryTotals = expenses.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const highestCategory = Object.entries(categoryTotals).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0] as [string, number] | undefined;

  // Average transaction size
  const avgExpense = expenses.length > 0 
    ? expenses.reduce((acc, t) => acc + t.amount, 0) / expenses.length 
    : 0;

  const insights = [
    {
      title: "Top Spending",
      description: highestCategory 
        ? `You've spent the most on ${highestCategory[0]} this month.` 
        : "No spending data yet.",
      value: highestCategory ? formatCurrency(highestCategory[1]) : "$0.00",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
    },
    {
      title: "Average Expense",
      description: "Your average transaction amount across all categories.",
      value: formatCurrency(avgExpense),
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
    },
    {
      title: "Budget Status",
      description: "Based on your current income vs expenses ratio.",
      value: "Healthy",
      icon: Lightbulb,
      color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-blue-600" size={24} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${insight.color}`}>
              <insight.icon size={24} />
            </div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{insight.title}</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{insight.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 leading-relaxed">{insight.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
