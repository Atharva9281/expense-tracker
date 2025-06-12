import React from 'react';
import { LuArrowRight, LuTrendingDown, LuTarget } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const BudgetStyleSpending = ({ dashboardData, viewMode, selectedMonth, selectedYear }) => {
  const navigate = useNavigate();

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

  // ✅ CLEANED: Use filteredExpenses instead of confusing last30DaysExpenses
  const prepareSpendingData = () => {
    if (!dashboardData?.filteredExpenses || dashboardData.filteredExpenses.length === 0) return [];
    
    const categoryTotals = {};

    // Calculate totals for each category
    dashboardData.filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    // Convert to array and sort
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentageOfTotal: dashboardData.totalExpenses > 0 ? 
          ((amount / dashboardData.totalExpenses) * 100) : 0,
        circlePercentage: dashboardData.totalExpenses > 0 ? 
          Math.min(((amount / dashboardData.totalExpenses) * 100), 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
  };

  const spendingData = prepareSpendingData();
  const overBudgetCount = 0; // Since we don't have budget data, set to 0

  if (spendingData.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h5 className="text-lg">Top Spending Categories</h5>
            <p className="text-sm text-gray-500 mt-1">{getPeriodText()}</p>
          </div>
          
          <button 
            onClick={() => navigate("/expense")}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:bg-purple-50 px-3 py-1 rounded-md transition-colors"
          >
            View All <LuArrowRight size={14} />
          </button>
        </div>
        
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <LuTarget size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No expense data available for {getPeriodText()}</p>
            <button 
              onClick={() => navigate("/expense")}
              className="text-sm text-purple-600 hover:text-purple-700 mt-2"
            >
              Add Your First Expense
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-lg">Top Spending Categories</h5>
          <p className="text-sm text-gray-500 mt-1">{getPeriodText()}</p>
        </div>
        
        <button 
          onClick={() => navigate("/expense")}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:bg-purple-50 px-3 py-1 rounded-md transition-colors"
        >
          View All <LuArrowRight size={14} />
        </button>
      </div>

      {/* Category List with Fixed Percentage Circles */}
      <div className="space-y-5">
        {spendingData.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Fixed Percentage Circle */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${item.circlePercentage * 1.256} 125.6`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-red-600">
                    {Math.round(item.percentageOfTotal)}%
                  </span>
                </div>
              </div>

              {/* Category Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h6 className="font-medium text-gray-800 text-sm">{item.category}</h6>
                  <LuTrendingDown className="text-red-500" size={14} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  ${item.amount.toLocaleString()} spent in {viewMode === 'monthly' ? 'this month' : 'this year'}
                </p>
              </div>
            </div>

            {/* Amount Info */}
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">
                ${item.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {item.percentageOfTotal.toFixed(1)}% of total
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {overBudgetCount} over budget • {viewMode === 'monthly' ? 'Monthly' : 'Annual'} view
          </span>
          <button 
            onClick={() => navigate("/expense")}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors"
          >
            Manage Expenses <LuArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetStyleSpending;