import React from "react";
import { LuTarget, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import MonthYearPicker from '../MonthYearPicker';

const BudgetOverview = ({ 
  budgetAnalysis, 
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

  if (!budgetAnalysis || !budgetAnalysis.budgets || budgetAnalysis.budgets.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-lg">Budget Overview</h5>
            <p className="text-xs text-gray-400 mt-0.5">
              Set up your first budget to start tracking
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
        
        <div className="mt-10 text-center py-8">
          <LuTarget className="mx-auto text-4xl mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No Budgets Set
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first budget to start tracking your spending
          </p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalBudget = budgetAnalysis.totalBudget || 0;
  const totalSpent = budgetAnalysis.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const budgetsOverLimit = budgetAnalysis.budgets.filter(b => b.isOverBudget).length;

  // Get period text for display
  const getPeriodText = () => {
    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return selectedYear;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-lg">Budget Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your spending limits and monitor progress • {getPeriodText()}
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
      
      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTarget className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-800">
              {viewMode === 'monthly' ? 'Monthly Budget' : 'Annual Budget'}
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">${totalBudget}</div>
          <div className="text-xs text-blue-600 mt-1">
            {budgetAnalysis.budgets.length} categories
            {viewMode === 'annual' && ` × 12 months`}
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <LuTrendingUp className="text-purple-600" size={16} />
            <span className="text-sm font-medium text-purple-800">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">${totalSpent}</div>
          <div className="text-xs text-purple-600 mt-1">
            {Math.round(percentageUsed)}% of budget
            {viewMode === 'annual' && ` (${selectedYear})`}
          </div>
        </div>

        {/* Remaining */}
        <div className={`p-4 rounded-lg border ${
          remaining >= 0 
            ? 'bg-green-50 border-green-100' 
            : 'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <LuTrendingDown className={remaining >= 0 ? 'text-green-600' : 'text-red-600'} size={16} />
            <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            ${Math.abs(remaining)}
          </div>
          <div className={`text-xs mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remaining >= 0 ? 'Available to spend' : 'Exceeded limit'}
            {viewMode === 'annual' && remaining >= 0 && ` (${selectedYear})`}
          </div>
        </div>

        {/* Status */}
        <div className={`p-4 rounded-lg border ${
          budgetsOverLimit === 0 
            ? 'bg-green-50 border-green-100' 
            : 'bg-yellow-50 border-yellow-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <LuTarget className={budgetsOverLimit === 0 ? 'text-green-600' : 'text-yellow-600'} size={16} />
            <span className={`text-sm font-medium ${budgetsOverLimit === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
              Status
            </span>
          </div>
          <div className={`text-2xl font-bold ${budgetsOverLimit === 0 ? 'text-green-900' : 'text-yellow-900'}`}>
            {budgetsOverLimit === 0 ? '✓' : budgetsOverLimit}
          </div>
          <div className={`text-xs mt-1 ${budgetsOverLimit === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
            {budgetsOverLimit === 0 ? 'All on track' : `${budgetsOverLimit} over budget`}
            {viewMode === 'annual' && ` (${selectedYear})`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;