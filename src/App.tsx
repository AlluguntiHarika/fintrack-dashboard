import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Layout } from './components/Layout';
import { SummaryCards } from './components/SummaryCards';
import { DashboardCharts } from './components/DashboardCharts';
import { TransactionList } from './components/TransactionList';
import { Insights } from './components/Insights';
import { GoalsList } from './components/GoalsList';
import { motion, AnimatePresence } from 'motion/react';

const DashboardView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <header>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your money.</p>
    </header>

    <SummaryCards />
    <DashboardCharts />
    <Insights />
    <TransactionList />
  </motion.div>
);

const TransactionsView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <header>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your transaction history.</p>
    </header>
    <TransactionList />
  </motion.div>
);

const AnalyticsView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <header>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into your spending habits and financial trends.</p>
    </header>
    <DashboardCharts />
    <Insights />
  </motion.div>
);

const GoalsView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <GoalsList />
  </motion.div>
);

const SettingsView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <header>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and application settings.</p>
    </header>
    <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
      <p className="text-gray-500 dark:text-gray-400">Settings configuration coming soon...</p>
    </div>
  </motion.div>
);

const MainContent = () => {
  const { activeView } = useFinance();

  return (
    <AnimatePresence mode="wait">
      {activeView === 'dashboard' && <DashboardView key="dashboard" />}
      {activeView === 'transactions' && <TransactionsView key="transactions" />}
      {activeView === 'analytics' && <AnalyticsView key="analytics" />}
      {activeView === 'goals' && <GoalsView key="goals" />}
      {activeView === 'settings' && <SettingsView key="settings" />}
    </AnimatePresence>
  );
};

function App() {
  return (
    <FinanceProvider>
      <Layout>
        <MainContent />
      </Layout>
    </FinanceProvider>
  );
}

export default App;
