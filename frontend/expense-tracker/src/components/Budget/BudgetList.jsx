import React, { useState } from 'react';
import { LuTrash2, LuTrendingUp, LuTrendingDown, LuTarget, LuSettings, LuPlus, LuDownload, LuChevronDown } from 'react-icons/lu';

const BudgetList = ({ 
  budgetAnalysis, onEdit, onDelete, onDownload, onDownloadAll,
  selectedMonth, selectedYear, viewMode, onCreateBudget 
}) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // Early return for empty budgets
  if (!budgetAnalysis?.budgets?.length) {
    return (
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h5 className="text-lg">Your Budgets</h5>
            <p className="text-xs text-gray-400 mt-0.5">
              No budgets set yet
            </p>
          </div>
          <button className="add-btn add-btn-fill" onClick={onCreateBudget}>
            <LuPlus className="text-lg" />
            Create Budget
          </button>
        </div>
        <div className="text-center py-12">
          <LuTarget className="mx-auto text-4xl mb-4 text-gray-300" />
          <h6 className="text-lg font-medium text-gray-600 mb-2">
            No budgets found
          </h6>
          <p className="text-gray-500">
            Start adding budgets to track your spending
          </p>
        </div>
      </div>
    );
  }

  const budgets = budgetAnalysis.budgets;

  // Helper functions
  const getMonthName = (monthNum) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(monthNum) - 1];
  
  const getCurrentPeriodName = () => {
    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return selectedYear;
  };

  const getStatusColor = (status) => ({ over: 'text-red-500', warning: 'text-yellow-500' }[status] || 'text-green-500');
  const getStatusIcon = (status) => ({ over: LuTrendingUp, warning: LuTrendingUp }[status] || LuTrendingDown);
  const getProgressBarColor = (status) => ({ over: 'bg-red-500', warning: 'bg-yellow-500' }[status] || 'bg-green-500');

  const renderBudgetIcon = (budget) => {
    if (budget.icon?.startsWith('http') || budget.icon?.startsWith('data:')) {
      return <img src={budget.icon} alt="Budget icon" className="w-5 h-5 object-cover" />;
    }
    return <span className="text-base">{budget.icon || '💰'}</span>;
  };

  // Regular functions instead of useCallback
  const handleEdit = (budget) => onEdit(budget);
  const handleDelete = (budgetId) => onDelete(budgetId);

  // Budget Card Component (matching ExpenseList styling)
  const BudgetCard = ({ budget }) => {
    const StatusIcon = getStatusIcon(budget.status);
    const progressWidth = Math.min((budget.spent / budget.amount) * 100, 100);
    
    return (
      <div className="group relative p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{ 
                backgroundColor: budget.color + '20', 
                borderColor: budget.color + '40',
                color: budget.color 
              }}
            >
              {renderBudgetIcon(budget)}
            </div>
            <div>
              <h6 className="text-sm font-medium text-gray-800">{budget.category}</h6>
              <p className="text-xs text-gray-500">
                {budget.month && budget.year ? 
                  `${getMonthName(budget.month)} ${budget.year}` :
                  `${viewMode === 'monthly' ? 'Monthly' : 'Annual'} Budget`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className={`text-sm font-semibold ${getStatusColor(budget.status)}`}>
                {budget.isOverBudget ? `+$${Math.abs(budget.remaining)}` : `$${budget.remaining} left`}
              </div>
            </div>
            
            {/* Edit/Delete buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(budget)}
                className="p-1 text-gray-400 hover:text-blue-500"
                title="Edit budget"
              >
                <LuSettings size={14} />
              </button>
              <button
                onClick={() => handleDelete(budget._id)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Delete budget"
              >
                <LuTrash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Amount & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              ${budget.spent} / ${budget.amount}
            </span>
            <span className="text-gray-500">
              {Math.round(budget.percentage)}% used
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(budget.status)}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* Monthly Breakdown for Annual View */}
        {viewMode === 'annual' && budget.monthlyBreakdown && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-600 mb-2">Monthly Breakdown</div>
            <div className="grid grid-cols-6 gap-1">
              {budget.monthlyBreakdown.slice(0, 12).map((month) => (
                <div key={month.month} className="text-center">
                  <div className="text-xs text-gray-400">{month.monthName.slice(0, 3)}</div>
                  <div className={`text-xs font-medium ${month.spent > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                    ${month.spent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h5 className="text-lg">Your Budgets</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            {getCurrentPeriodName()} • {budgets.length} budgets • ${budgetAnalysis.totalBudget} total
            {budgets.filter(b => b.status === 'over').length > 0 && 
              ` • ${budgets.filter(b => b.status === 'over').length} over budget`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Create Budget Button */}
          <button className="add-btn add-btn-fill" onClick={onCreateBudget}>
            <LuPlus className="text-lg" />
            Create Budget
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-100 transition-colors"
            >
              <LuDownload className="text-base" />
              Download
              <LuChevronDown className="text-sm" />
            </button>
            
            {showDownloadDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => { onDownload(); setShowDownloadDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LuDownload className="text-sm" />
                    <div>
                      <div className="font-medium">Download {getCurrentPeriodName()}</div>
                      <div className="text-xs text-gray-500">
                        {budgets.length} budgets • ${budgetAnalysis.totalBudget}
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => { onDownloadAll(); setShowDownloadDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <LuDownload className="text-sm" />
                    <div>
                      <div className="font-medium">Download All Data</div>
                      <div className="text-xs text-gray-500">All time • Complete budget history</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDownloadDropdown && (
        <div className="fixed inset-0 z-5" onClick={() => setShowDownloadDropdown(false)}></div>
      )}
      
      {/* Budget Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {budgets.map((budget) => (
          <BudgetCard key={budget._id} budget={budget} />
        ))}
      </div>
    </div>
  );
};

export default BudgetList;