import React, { useMemo, useState, useCallback } from 'react';
import { LuDownload, LuTrash2, LuCalendar, LuPlus, LuSettings, LuChevronDown } from 'react-icons/lu';
import moment from 'moment';
import VirtualizedTransactionList from '../Optimized/VirtualizedTransactionList';

const VIRTUAL_SCROLLING_THRESHOLD = 50; // Enable virtual scrolling with 50+ items

const ExpenseList = ({ 
  transactions, 
  onDelete, 
  onDownload, 
  onDownloadAll,
  onAddExpense,
  onEditExpense,
  selectedMonth, 
  selectedYear,
  viewMode 
}) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // ✅ FIXED: Filter transactions with proper UTC date handling
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      return transactions.filter(transaction => {
        // ✅ FIX: Use UTC methods to avoid timezone conversion issues
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getUTCFullYear();
        const transactionMonth = transactionDate.getUTCMonth() + 1;
        
        return transactionYear === parseInt(year) && transactionMonth === parseInt(month);
      });
    } else if (viewMode === 'annual') {
      return transactions.filter(transaction => {
        // ✅ FIX: Use UTC methods for year comparison too
        const transactionDate = new Date(transaction.date);
        return transactionDate.getUTCFullYear() === parseInt(selectedYear);
      });
    }

    return transactions; // All time view
  }, [transactions, selectedMonth, selectedYear, viewMode]);

  // Calculate totals for filtered data
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Get period text for display
  const getPeriodText = () => {
    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'annual') {
      return selectedYear;
    }
    return 'All Time';
  };

  // Prepare transactions for VirtualizedTransactionList
  const virtualizedTransactions = useMemo(() => {
    return filteredTransactions.map(transaction => ({
      ...transaction,
      type: 'expense',
      source: transaction.category, // Map category to source for consistency
    }));
  }, [filteredTransactions]);

  // Callbacks for virtualized list
  const handleEdit = useCallback((transaction) => {
    onEditExpense(transaction);
  }, [onEditExpense]);

  const handleDelete = useCallback((transactionId) => {
    onDelete(transactionId);
  }, [onDelete]);

  // Enhanced Transaction Card Component (for regular grid view)
  const TransactionCard = ({ transaction }) => {
    const renderIcon = () => {
      if (transaction.icon) {
        if (transaction.icon.startsWith('http') || transaction.icon.startsWith('data:')) {
          return <img src={transaction.icon} alt="Icon" className="w-5 h-5 object-cover" />;
        } else {
          return <span className="text-base">{transaction.icon}</span>;
        }
      }
      return <span className="text-base">💰</span>;
    };

    return (
      <div className="group relative p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{ 
                backgroundColor: '#fee2e2', // red-50 equivalent
                borderColor: '#fecaca' // red-200 equivalent
              }}
            >
              {renderIcon()}
            </div>
            <div>
              <h6 className="text-sm font-medium text-gray-800">{transaction.category}</h6>
              <p className="text-xs text-gray-500">
                {moment(transaction.date).format("Do MMM YYYY")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-sm font-semibold text-red-600">
                -${transaction.amount}
              </div>
            </div>
            
            {/* Edit/Delete buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEditExpense(transaction)}
                className="p-1 text-gray-400 hover:text-blue-500"
                title="Edit expense"
              >
                <LuSettings size={14} />
              </button>
              <button
                onClick={() => onDelete(transaction._id)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Delete expense"
              >
                <LuTrash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const shouldUseVirtualScrolling = filteredTransactions.length >= VIRTUAL_SCROLLING_THRESHOLD;

  return (
    <div className="card">
      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h5 className="text-lg">Your Expenses</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            {getPeriodText()} • {filteredTransactions.length} expenses • ${totalAmount.toFixed(2)} total
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Add Expense Button */}
          <button className="add-btn add-btn-fill" onClick={onAddExpense}>
            <LuPlus className="text-lg" />
            Add Expense
          </button>

          {/* Download Dropdown Button */}
          <div className="relative">
            <button 
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-100 transition-colors"
            >
              <LuDownload className="text-base" />
              Download
              <LuChevronDown className="text-sm" />
            </button>
            
            {/* Dropdown Menu */}
            {showDownloadDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {/* Current View Download */}
                  <button
                    onClick={() => {
                      onDownload();
                      setShowDownloadDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LuDownload className="text-sm" />
                    <div>
                      <div className="font-medium">Download {getPeriodText()}</div>
                      <div className="text-xs text-gray-500">
                        {filteredTransactions.length} transactions • ${totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </button>
                  
                  {/* All Data Download */}
                  <button
                    onClick={() => {
                      onDownloadAll();
                      setShowDownloadDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <LuDownload className="text-sm" />
                    <div>
                      <div className="font-medium">Download All Data</div>
                      <div className="text-xs text-gray-500">
                        All time • Complete expense history
                      </div>
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
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDownloadDropdown(false)}
        ></div>
      )}

      {/* Expense Display - Virtual Scrolling for Large Datasets */}
      {filteredTransactions.length > 0 ? (
        shouldUseVirtualScrolling ? (
          <VirtualizedTransactionList
            transactions={virtualizedTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            height={600}
            itemHeight={80}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction._id} transaction={transaction} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <LuCalendar className="mx-auto text-4xl text-gray-300 mb-4" />
          <h6 className="text-lg font-medium text-gray-600 mb-2">
            No expenses found
          </h6>
          <p className="text-gray-500">
            {viewMode === 'monthly' || viewMode === 'annual'
              ? `No expenses recorded for ${getPeriodText()}`
              : 'Start adding expenses to see them here'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;