import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { LayoutDashboard, ReceiptText, PieChart, Settings, Sun, Moon, UserCircle, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      active 
        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
    )}
  >
    <Icon size={20} />
    {label}
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleDarkMode, role, setRole, activeView, setActiveView } = useFinance();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 hidden md:block">
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FinTrack</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')}
            />
            <SidebarItem 
              icon={ReceiptText} 
              label="Transactions" 
              active={activeView === 'transactions'} 
              onClick={() => setActiveView('transactions')}
            />
            <SidebarItem 
              icon={PieChart} 
              label="Analytics" 
              active={activeView === 'analytics'} 
              onClick={() => setActiveView('analytics')}
            />
            <SidebarItem 
              icon={Target} 
              label="Goals" 
              active={activeView === 'goals'} 
              onClick={() => setActiveView('goals')}
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')}
            />
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3 mb-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Current Role</p>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun size={20} className="text-yellow-500" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon size={20} className="text-blue-600" />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white md:hidden capitalize">{activeView}</h1>
            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Harika Allugunti</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
