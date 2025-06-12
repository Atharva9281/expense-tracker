// backend/utils/queryOptimizer.js - SIMPLIFIED REPLACEMENT
const mongoose = require('mongoose');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// REPLACE your existing getOptimizedDashboardData with this
const getOptimizedDashboardData = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(String(userId));
  
  // Run all queries in parallel (much faster)
  const [
    totalIncomeResult,
    totalExpenseResult,
    allIncomeTransactions,
    allExpenseTransactions,
    recentIncomeTransactions,
    recentExpenseTransactions
  ] = await Promise.all([
    
    // Total income (same as before)
    Income.aggregate([
      { $match: { userId: userObjectId }},
      { $group: {_id: null, total: { $sum: "$amount" } } },
    ]),
    
    // Total expense (same as before)
    Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: {_id: null, total: { $sum: "$amount" } } },
    ]),

    // ALL income transactions (for frontend filtering)
    Income.find({ userId }).sort({ date: -1 }).lean(),

    // ALL expense transactions (for frontend filtering)
    Expense.find({ userId }).sort({ date: -1 }).lean(),

    // Recent income for last transactions
    Income.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),

    // Recent expense for last transactions
    Expense.find({ userId }).sort({ createdAt: -1 }).limit(5).lean()
  ]);

  // Combine recent transactions (same logic as before)
  const lastTransactions = [
    ...recentIncomeTransactions.map(txn => ({ ...txn, type: "income" })),
    ...recentExpenseTransactions.map(txn => ({ ...txn, type: "expense" }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // CLEAN RETURN - Remove confusing 30/60 days, add ALL data
  return {
    totalBalance: (totalIncomeResult[0]?.total || 0) - (totalExpenseResult[0]?.total || 0),
    totalIncome: totalIncomeResult[0]?.total || 0,
    totalExpenses: totalExpenseResult[0]?.total || 0,
    
    // NEW: Send ALL transactions for proper frontend filtering
    allIncome: allIncomeTransactions,
    allExpenses: allExpenseTransactions,
    
    // Keep recent transactions for dashboard
    recentTransactions: lastTransactions,
    
    // REMOVED: Confusing last30DaysExpenses and last60DaysIncome
    // Your frontend will filter allIncome and allExpenses instead
  };
};

module.exports = { getOptimizedDashboardData };