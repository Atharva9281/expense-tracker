import React from "react";
import { LuTarget, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import MonthYearPicker from '../MonthYearPicker';

const IncomeOverview = ({ 
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

  // Calculate income statistics based on view mode (FILTERING HAPPENS HERE)
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return { totalTransactions: 0, totalAmount: 0, averageIncome: 0, topSource: 'None' };
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
    const totalTransactions = filteredTransactions.length;
    const averageIncome = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    // Find top source
    const sourceTotals = filteredTransactions.reduce((acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + t.amount;
      return acc;
    }, {});

    const topSource = Object.keys(sourceTotals).length > 0 
      ? Object.entries(sourceTotals).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'None';

    return { totalTransactions, totalAmount, averageIncome, topSource };
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
          <h5 className="text-lg">Income Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your earnings and analyze your income trends • {getPeriodText()}
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

      {/* Income Stats Cards - Shows filtered data based on selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTrendingUp className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-green-900">${stats.totalAmount.toFixed(2)}</div>
          <div className="text-xs text-green-600 mt-1">
            {getPeriodText()}
          </div>
        </div>

        {/* Number of Income Sources */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTarget className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-800">Income Sources</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalTransactions}</div>
          <div className="text-xs text-blue-600 mt-1">
            Total transactions
          </div>
        </div>

        {/* Average Income */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTrendingUp className="text-purple-600" size={16} />
            <span className="text-sm font-medium text-purple-800">Average</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">${stats.averageIncome.toFixed(2)}</div>
          <div className="text-xs text-purple-600 mt-1">
            Per transaction
          </div>
        </div>

        {/* Top Source */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTarget className="text-yellow-600" size={16} />
            <span className="text-sm font-medium text-yellow-800">Top Source</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">{stats.topSource}</div>
          <div className="text-xs text-yellow-600 mt-1">
            Highest earning
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeOverview;