import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// Memoized transaction item to prevent unnecessary re-renders
const TransactionItem = React.memo(({ transaction, onEdit, onDelete, style }) => {
  return (
    <div style={style} className="px-4">
      <div className="border-b border-gray-200 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {transaction.icon || (transaction.type === 'income' ? '💰' : '💳')}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {transaction.source || transaction.category}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`font-semibold text-lg ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit?.(transaction)}
                className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(transaction._id)}
                className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if transaction data actually changed
  return (
    prevProps.transaction._id === nextProps.transaction._id &&
    prevProps.transaction.amount === nextProps.transaction.amount &&
    prevProps.transaction.date === nextProps.transaction.date
  );
});

// Main virtualized list component
const VirtualizedTransactionList = ({ 
  transactions = [], 
  onEdit, 
  onDelete,
  height = 400,
  itemHeight = 80 
}) => {
  // Memoize the row renderer
  const Row = useMemo(() => {
    return ({ index, style }) => {
      const transaction = transactions[index];
      if (!transaction) return null;

      return (
        <TransactionItem
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          style={style}
        />
      );
    };
  }, [transactions, onEdit, onDelete]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No transactions found</p>
          <p className="text-gray-500 text-sm mt-1">
            Add some transactions to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className="border border-gray-200 rounded-lg">
      <AutoSizer>
        {({ height: autoHeight, width }) => (
          <List
            height={autoHeight}
            width={width}
            itemCount={transactions.length}
            itemSize={itemHeight}
            overscanCount={5} // Render 5 extra items for smooth scrolling
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedTransactionList;