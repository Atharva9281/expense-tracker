import React from "react";
import { LuTarget, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import MonthYearPicker from '../MonthYearPicker';

const ExpenseOverview = ({ 
  transactions, 
  selectedMonth, 
  selectedYear,
  viewMode,
  onMonthChange, 
  onYearChange,
  onViewModeChange 
}) => {

  // Year Picker Component for Annual View
  const YearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i);
    
    return (
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };

  // Calculate expense statistics based on view mode (FILTERING HAPPENS HERE)
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return { totalExpenses: 0, totalAmount: 0, averageExpense: 0, topCategory: 'None' };
    }

    let filteredTransactions = transactions;

    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === parseInt(year) && 
               (tDate.getMonth() + 1) === parseInt(month);
      });
    } else if (viewMode === 'annual') {
      filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === parseInt(selectedYear);
      });
    }

    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.length;
    const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Find top category
    const categoryTotals = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const topCategory = Object.keys(categoryTotals).length > 0 
      ? Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'None';

    return { totalExpenses, totalAmount, averageExpense, topCategory };
  };

  const stats = calculateStats();

  // Get period text for display
  const getPeriodText = () => {
    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'annual') {
      return selectedYear;
    } else {
      return 'All Time';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-lg">Expense Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your spending trends and analyze where your money goes • {getPeriodText()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('monthly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => onViewModeChange('annual')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'annual' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
            </button>
          </div>
          
          {/* Date Picker */}
          {viewMode === 'monthly' ? (
            <MonthYearPicker
              selectedMonth={selectedMonth}
              onMonthChange={onMonthChange}
            />
          ) : (
            <YearPicker />
          )}
        </div>
      </div>

      {/* Expense Stats Cards - Shows filtered data based on selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Amount */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTrendingDown className="text-red-600" size={16} />
            <span className="text-sm font-medium text-red-800">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-red-900">${stats.totalAmount.toFixed(2)}</div>
          <div className="text-xs text-red-600 mt-1">
            {getPeriodText()}
          </div>
        </div>

        {/* Number of Expenses */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTarget className="text-orange-600" size={16} />
            <span className="text-sm font-medium text-orange-800">Transactions</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{stats.totalExpenses}</div>
          <div className="text-xs text-orange-600 mt-1">
            Total expenses
          </div>
        </div>

        {/* Average Expense */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTrendingUp className="text-yellow-600" size={16} />
            <span className="text-sm font-medium text-yellow-800">Average</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">${stats.averageExpense.toFixed(2)}</div>
          <div className="text-xs text-yellow-600 mt-1">
            Per transaction
          </div>
        </div>

        {/* Top Category */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTarget className="text-purple-600" size={16} />
            <span className="text-sm font-medium text-purple-800">Top Category</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{stats.topCategory}</div>
          <div className="text-xs text-purple-600 mt-1">
            Highest spending
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseOverview;

