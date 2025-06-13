// import React, { useState, useCallback } from 'react';
// import { LuTrash2, LuTrendingUp, LuTrendingDown, LuTarget, LuSettings, LuPlus, LuDownload, LuChevronDown } from 'react-icons/lu';
// import { FixedSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';

// const BudgetList = ({ 
//   budgetAnalysis, onEdit, onDelete, onDownload, onDownloadAll,
//   selectedMonth, selectedYear, viewMode, onCreateBudget 
// }) => {
//   const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

//   // Early return for empty budgets
//   if (!budgetAnalysis?.budgets?.length) {
//     return (
//       <div className="card">
//         <div className="flex items-center justify-between mb-4">
//           <h5 className="text-lg">Your Budgets</h5>
//           <button className="add-btn add-btn-fill" onClick={onCreateBudget}>
//             <LuPlus className="text-lg" />
//             Create Budget
//           </button>
//         </div>
//         <div className="text-center py-8 text-gray-500">
//           <LuTarget className="mx-auto text-4xl mb-2 text-gray-300" />
//           <p className="text-sm">No budgets set yet</p>
//           <p className="text-xs text-gray-400 mt-1">Create your first budget to get started</p>
//         </div>
//       </div>
//     );
//   }

//   const budgets = budgetAnalysis.budgets;

//   // Helper functions
//   const getMonthName = (monthNum) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(monthNum) - 1];
  
//   const getCurrentPeriodName = () => {
//     if (viewMode === 'monthly') {
//       const [year, month] = selectedMonth.split('-');
//       return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//     }
//     return selectedYear;
//   };

//   const getStatusColor = (status) => ({ over: 'text-red-500', warning: 'text-yellow-500' }[status] || 'text-green-500');
//   const getStatusIcon = (status) => ({ over: LuTrendingUp, warning: LuTrendingUp }[status] || LuTrendingDown);
//   const getProgressBarColor = (status) => ({ over: 'bg-red-500', warning: 'bg-yellow-500' }[status] || 'bg-green-500');

//   const renderBudgetIcon = (budget) => {
//     if (budget.icon?.startsWith('http') || budget.icon?.startsWith('data:')) {
//       return <img src={budget.icon} alt="Budget icon" className="w-6 h-6 object-cover" />;
//     }
//     return <span className="text-lg">{budget.icon || '💰'}</span>;
//   };

//   // Callbacks
//   const handleEdit = useCallback((budget) => onEdit(budget), [onEdit]);
//   const handleDelete = useCallback((budgetId) => onDelete(budgetId), [onDelete]);

//   // ✅ FIX: Virtual List Row Component - memoized to prevent re-renders
//   const VirtualBudgetRow = useCallback(({ index, style }) => {
//     const budget = budgets[index];
//     if (!budget) return null;

//     const StatusIcon = getStatusIcon(budget.status);
//     const progressWidth = Math.min((budget.spent / budget.amount) * 100, 100);
    
//     return (
//       <div style={style} className="px-2 pb-4">
//         <div className="group relative p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex items-center gap-3">
//               <div 
//                 className="w-10 h-10 rounded-full flex items-center justify-center border-2"
//                 style={{ 
//                   backgroundColor: budget.color + '20', 
//                   borderColor: budget.color + '40',
//                   color: budget.color 
//                 }}
//               >
//                 {renderBudgetIcon(budget)}
//               </div>
//               <div>
//                 <h6 className="font-medium text-gray-800">{budget.category}</h6>
//                 <span className="text-xs text-gray-500 capitalize">
//                   {budget.month && budget.year ? 
//                     `${getMonthName(budget.month)} ${budget.year} • ${budget.period}` :
//                     `${viewMode === 'monthly' ? 'Monthly' : 'Annual'} • ${budget.period}`
//                   }
//                 </span>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button onClick={() => handleEdit(budget)} className="p-1 text-gray-400 hover:text-blue-500">
//                 <LuSettings size={14} />
//               </button>
//               <button onClick={() => handleDelete(budget._id)} className="p-1 text-gray-400 hover:text-red-500">
//                 <LuTrash2 size={14} />
//               </button>
//             </div>
//           </div>
          
//           {/* Amount & Status */}
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-600">
//               ${budget.spent} / ${budget.amount}
//               {viewMode === 'annual' && budget.monthlyAmount && (
//                 <span className="text-xs text-gray-400 block">(${budget.monthlyAmount}/month × 12)</span>
//               )}
//             </span>
//             <div className="flex items-center gap-1">
//               <StatusIcon className={`text-sm ${getStatusColor(budget.status)}`} />
//               <span className={`text-sm font-medium ${getStatusColor(budget.status)}`}>
//                 {budget.isOverBudget ? `+${Math.abs(budget.remaining)}` : `${budget.remaining} left`}
//               </span>
//             </div>
//           </div>
          
//           {/* Progress Bar */}
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div 
//               className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.status)}`}
//               style={{ width: `${progressWidth}%` }}
//             />
//           </div>
          
//           {/* Percentage */}
//           <div className="mt-2 text-right">
//             <span className="text-xs text-gray-500">
//               {Math.round(budget.percentage)}% used{viewMode === 'annual' && ` in ${selectedYear}`}
//             </span>
//           </div>

//           {/* Monthly Breakdown for Annual View */}
//           {viewMode === 'annual' && budget.monthlyBreakdown && (
//             <div className="mt-3 pt-3 border-t border-gray-200">
//               <div className="text-xs font-medium text-gray-600 mb-2">Monthly Breakdown</div>
//               <div className="grid grid-cols-6 gap-1">
//                 {budget.monthlyBreakdown.slice(0, 12).map((month) => (
//                   <div key={month.month} className="text-center">
//                     <div className="text-xs text-gray-500">{month.monthName.slice(0, 3)}</div>
//                     <div className={`text-xs font-medium ${month.spent > 0 ? 'text-green-600' : 'text-gray-400'}`}>
//                       ${month.spent}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }, [budgets, viewMode, selectedYear, handleEdit, handleDelete]);

//   return (
//     <div className="card">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h5 className="text-lg">Your Budgets</h5>
//           <p className="text-xs text-gray-400 mt-0.5">
//             {getCurrentPeriodName()} • {budgets.filter(b => b.status === 'over').length} over budget
//             {viewMode === 'annual' && ` • ${budgets.length} categories tracked`}
//           </p>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <button className="add-btn add-btn-fill" onClick={onCreateBudget}>
//             <LuPlus className="text-lg" />
//             Create Budget
//           </button>

//           {/* Download Dropdown */}
//           <div className="relative">
//             <button 
//               onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
//               className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-100 transition-colors"
//             >
//               <LuDownload className="text-base" />
//               Download
//               <LuChevronDown className="text-sm" />
//             </button>
            
//             {showDownloadDropdown && (
//               <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//                 <div className="py-1">
//                   <button
//                     onClick={() => { onDownload(); setShowDownloadDropdown(false); }}
//                     className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <LuDownload className="text-sm" />
//                     <div>
//                       <div className="font-medium">Download {getCurrentPeriodName()}</div>
//                       <div className="text-xs text-gray-500">{budgets.length} budgets • ${budgetAnalysis.totalBudget}</div>
//                     </div>
//                   </button>
                  
//                   <button
//                     onClick={() => { onDownloadAll(); setShowDownloadDropdown(false); }}
//                     className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
//                   >
//                     <LuDownload className="text-sm" />
//                     <div>
//                       <div className="font-medium">Download All Data</div>
//                       <div className="text-xs text-gray-500">All time • Complete budget history</div>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Close dropdown when clicking outside */}
//       {showDownloadDropdown && (
//         <div className="fixed inset-0 z-5" onClick={() => setShowDownloadDropdown(false)}></div>
//       )}
      
//       {/* ✅ CRITICAL FIX: ALWAYS render react-window to maintain consistent hook count */}
//       <div style={{ height: '500px' }} className="border border-gray-200 rounded-lg">
//         <AutoSizer>
//           {({ height, width }) => (
//             <List
//               height={height}
//               width={width}
//               itemCount={budgets.length}
//               itemSize={220}
//               overscanCount={3}
//             >
//               {VirtualBudgetRow}
//             </List>
//           )}
//         </AutoSizer>
//       </div>
//     </div>
//   );
// };

// export default BudgetList;

import React, { useState } from 'react';
import { LuTrash2, LuTrendingUp, LuTrendingDown, LuTarget, LuSettings, LuPlus, LuDownload, LuChevronDown } from 'react-icons/lu';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const BudgetList = ({ 
  budgetAnalysis, onEdit, onDelete, onDownload, onDownloadAll,
  selectedMonth, selectedYear, viewMode, onCreateBudget 
}) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // Early return for empty budgets
  if (!budgetAnalysis?.budgets?.length) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg">Your Budgets</h5>
          <button className="add-btn add-btn-fill" onClick={onCreateBudget}>
            <LuPlus className="text-lg" />
            Create Budget
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <LuTarget className="mx-auto text-4xl mb-2 text-gray-300" />
          <p className="text-sm">No budgets set yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first budget to get started</p>
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
      return <img src={budget.icon} alt="Budget icon" className="w-6 h-6 object-cover" />;
    }
    return <span className="text-lg">{budget.icon || '💰'}</span>;
  };

  // Regular functions instead of useCallback
  const handleEdit = (budget) => onEdit(budget);
  const handleDelete = (budgetId) => onDelete(budgetId);

  // Virtual List Row Component - regular function, no useCallback
  const VirtualBudgetRow = ({ index, style }) => {
    const budget = budgets[index];
    if (!budget) return null;

    const StatusIcon = getStatusIcon(budget.status);
    const progressWidth = Math.min((budget.spent / budget.amount) * 100, 100);
    
    return (
      <div style={style} className="px-2 pb-4">
        <div className="group relative p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between mb-3">
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
                <h6 className="font-medium text-gray-800">{budget.category}</h6>
                <span className="text-xs text-gray-500 capitalize">
                  {budget.month && budget.year ? 
                    `${getMonthName(budget.month)} ${budget.year} • ${budget.period}` :
                    `${viewMode === 'monthly' ? 'Monthly' : 'Annual'} • ${budget.period}`
                  }
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(budget)} className="p-1 text-gray-400 hover:text-blue-500">
                <LuSettings size={14} />
              </button>
              <button onClick={() => handleDelete(budget._id)} className="p-1 text-gray-400 hover:text-red-500">
                <LuTrash2 size={14} />
              </button>
            </div>
          </div>
          
          {/* Amount & Status */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              ${budget.spent} / ${budget.amount}
              {viewMode === 'annual' && budget.monthlyAmount && (
                <span className="text-xs text-gray-400 block">(${budget.monthlyAmount}/month × 12)</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <StatusIcon className={`text-sm ${getStatusColor(budget.status)}`} />
              <span className={`text-sm font-medium ${getStatusColor(budget.status)}`}>
                {budget.isOverBudget ? `+${Math.abs(budget.remaining)}` : `${budget.remaining} left`}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.status)}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          
          {/* Percentage */}
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-500">
              {Math.round(budget.percentage)}% used{viewMode === 'annual' && ` in ${selectedYear}`}
            </span>
          </div>

          {/* Monthly Breakdown for Annual View */}
          {viewMode === 'annual' && budget.monthlyBreakdown && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-2">Monthly Breakdown</div>
              <div className="grid grid-cols-6 gap-1">
                {budget.monthlyBreakdown.slice(0, 12).map((month) => (
                  <div key={month.month} className="text-center">
                    <div className="text-xs text-gray-500">{month.monthName.slice(0, 3)}</div>
                    <div className={`text-xs font-medium ${month.spent > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      ${month.spent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-lg">Your Budgets</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            {getCurrentPeriodName()} • {budgets.filter(b => b.status === 'over').length} over budget
            {viewMode === 'annual' && ` • ${budgets.length} categories tracked`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
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
                      <div className="text-xs text-gray-500">{budgets.length} budgets • ${budgetAnalysis.totalBudget}</div>
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
      
      {/* Always render react-window to maintain consistent hook count */}
      <div style={{ height: '500px' }} className="border border-gray-200 rounded-lg">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={budgets.length}
              itemSize={220}
              overscanCount={3}
            >
              {VirtualBudgetRow}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default BudgetList;