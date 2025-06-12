import React from 'react';
import { LuTarget } from 'react-icons/lu';
import { IoMdCard } from 'react-icons/io'

import { addThousandsSeparator } from '../../utils/helper';

// Configuration for easy tuning
const HEALTH_THRESHOLDS = {
  savings: [
    { min: 0.30, points: 40, label: 'Excellent' },
    { min: 0.20, points: 35, label: 'Great' },
    { min: 0.10, points: 25, label: 'Good' },
    { min: 0.05, points: 15, label: 'Fair' },
    { min: 0.01, points: 10, label: 'Basic' },
    { min: -0.10, points: 5, label: 'Slight overspending' }
  ],
  expenses: [
    { max: 0.50, points: 25, label: 'Excellent' },
    { max: 0.70, points: 20, label: 'Good' },
    { max: 0.85, points: 15, label: 'Fair' },
    { max: 0.95, points: 10, label: 'Caution' },
    { max: 1.10, points: 5, label: 'Warning' }
  ],
  activity: [
    { min: 15, points: 20, label: 'Very active' },
    { min: 10, points: 15, label: 'Active' },
    { min: 5, points: 10, label: 'Moderate' },
    { min: 2, points: 5, label: 'Basic' }
  ],
  stability: [
    { min: 4, points: 10, label: 'Excellent stability' },
    { min: 2, points: 7, label: 'Good stability' },
    { min: 1, points: 4, label: 'Basic stability' }
  ],
  balance: [
    { min: 0.25, points: 5, label: 'Great balance' },
    { min: 0.10, points: 3, label: 'Good balance' },
    { min: 0.01, points: 1, label: 'Positive balance' }
  ]
};

const STATUS_LEVELS = [
  { min: 85, status: 'Excellent', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { min: 70, status: 'Very Good', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  { min: 55, status: 'Good', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
  { min: 40, status: 'Fair', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  { min: 25, status: 'Needs Work', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { min: 0, status: 'Poor', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-600' }
];

const FinancialHealthScore = ({ dashboardData, getPeriodDisplay }) => {
  // Helper function to get points from threshold array
  const getPointsFromThreshold = (value, thresholds, compareField = 'min') => {
    for (const threshold of thresholds) {
      if (compareField === 'min' && value >= threshold.min) {
        return threshold.points;
      }
      if (compareField === 'max' && value <= threshold.max) {
        return threshold.points;
      }
    }
    return 0;
  };

  // ✅ CLEANED: Calculate Financial Health Score using clean variables
  const calculateFinancialHealth = () => {
    if (!dashboardData) {
      return { 
        score: 0, 
        status: 'No Data', 
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        message: 'Connect your accounts to see your financial health score'
      };
    }
    
    const income = dashboardData.totalIncome || 0;
    const expenses = dashboardData.totalExpenses || 0;
    const balance = dashboardData.totalBalance || 0;
    
    // ✅ CLEAN: Use filteredIncome and filteredExpenses instead of confusing variables
    const incomeTransactions = dashboardData.filteredIncome?.length || 0;
    const expenseTransactions = dashboardData.filteredExpenses?.length || 0;
    const totalTransactions = incomeTransactions + expenseTransactions;
    
    // Handle edge case: No transactions at all
    if (totalTransactions === 0) {
      return {
        score: 0,
        status: 'Getting Started',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        message: 'Add your first transaction to begin tracking your financial health!'
      };
    }

    // Handle edge case: Zero income but has balance (savings/investments)
    if (income === 0 && balance > 0) {
      return {
        score: 30,
        status: 'Fair',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        message: 'You have savings but no recorded income. Consider adding income transactions.'
      };
    }

    // Handle edge case: Only expenses, no income
    if (income === 0 && expenses > 0) {
      return {
        score: 15,
        status: 'Needs Work',
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        message: 'Only expenses recorded. Add income transactions for better insights.'
      };
    }
    
    let score = 0;
    let scoreBreakdown = {};
    
    // 1. Savings Rate (40 points max) - Most Important
    if (income > 0) {
      const savingsRate = (income - expenses) / income;
      const savingsPoints = getPointsFromThreshold(savingsRate, HEALTH_THRESHOLDS.savings);
      score += savingsPoints;
      scoreBreakdown.savings = { rate: savingsRate, points: savingsPoints };
    }
    
    // 2. Expense Ratio (25 points max) - Spending Efficiency
    if (income > 0) {
      const expenseRatio = expenses / income;
      const expensePoints = getPointsFromThreshold(expenseRatio, HEALTH_THRESHOLDS.expenses, 'max');
      score += expensePoints;
      scoreBreakdown.expenses = { ratio: expenseRatio, points: expensePoints };
    }
    
    // 3. Financial Activity (20 points max) - Engagement
    const activityPoints = getPointsFromThreshold(totalTransactions, HEALTH_THRESHOLDS.activity);
    score += activityPoints;
    scoreBreakdown.activity = { transactions: totalTransactions, points: activityPoints };
    
    // 4. Income Stability (10 points max) - Having Regular Income
    const stabilityPoints = getPointsFromThreshold(incomeTransactions, HEALTH_THRESHOLDS.stability);
    score += stabilityPoints;
    scoreBreakdown.stability = { transactions: incomeTransactions, points: stabilityPoints };
    
    // 5. Balance Trend Bonus (5 points max) - Extra credit for positive balance
    if (balance > 0 && income > 0) {
      const balanceRatio = balance / income;
      const balancePoints = getPointsFromThreshold(balanceRatio, HEALTH_THRESHOLDS.balance);
      score += balancePoints;
      scoreBreakdown.balance = { ratio: balanceRatio, points: balancePoints };
    }
    
    // Cap score at 100
    score = Math.min(score, 100);
    
    // Determine status and color based on score
    const statusLevel = STATUS_LEVELS.find(level => score >= level.min) || STATUS_LEVELS[STATUS_LEVELS.length - 1];
    
    return { 
      score: Math.round(score), 
      status: statusLevel.status,
      color: statusLevel.color,
      bgColor: statusLevel.bgColor,
      textColor: statusLevel.textColor,
      breakdown: scoreBreakdown,
      message: getHealthMessage(score, scoreBreakdown)
    };
  };

  // Generate contextual health message
  const getHealthMessage = (score, breakdown) => {
    if (score >= 85) return 'Outstanding financial management! Keep up the excellent work!';
    if (score >= 70) return 'Very strong financial health! You\'re doing great!';
    if (score >= 55) return 'Good financial management! Small improvements can boost your score.';
    if (score >= 40) {
      // Provide specific guidance based on breakdown
      if (breakdown.savings?.points < 15) {
        return 'Focus on increasing your savings rate to improve your score.';
      }
      if (breakdown.expenses?.points < 10) {
        return 'Consider reviewing your spending habits to optimize your budget.';
      }
      return 'Room for improvement in spending habits and savings.';
    }
    if (score >= 25) return 'Focus on budgeting and building consistent saving habits.';
    return 'Consider reviewing your budget and tracking expenses more carefully.';
  };

  const healthScore = calculateFinancialHealth();

  return (
    <div className={`card p-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 ${healthScore.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Financial Health Score</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200 bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${healthScore.textColor}`}>
                    {healthScore.score}
                  </div>
                  <div className="text-xs text-gray-500">/ 100</div>
                </div>
              </div>
              {/* Progress ring visual enhancement */}
              <svg className="absolute top-0 left-0 w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={`${healthScore.color === 'green' ? '#10b981' : 
                           healthScore.color === 'blue' ? '#3b82f6' :
                           healthScore.color === 'indigo' ? '#6366f1' :
                           healthScore.color === 'yellow' ? '#f59e0b' :
                           healthScore.color === 'orange' ? '#f97316' : '#ef4444'}`}
                  strokeWidth="4"
                  strokeDasharray={`${healthScore.score * 2.83} 283`}
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div>
              <div className={`text-xl font-semibold ${healthScore.textColor}`}>
                {healthScore.status}
              </div>
              <p className="text-sm text-gray-600 mt-1 max-w-xs">
                {healthScore.message}
              </p>
            </div>
          </div>
        </div>
        
        {/* ✅ CLEANED: Quick Stats using clean variables */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <IoMdCard className="text-green-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Net Balance</p>
                <p className={`font-semibold ${(dashboardData?.totalBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${addThousandsSeparator(Math.abs(dashboardData?.totalBalance || 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <LuTarget className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Transactions</p>
                <p className="font-semibold text-gray-800">
                  {((dashboardData?.filteredIncome?.length || 0) + 
                    (dashboardData?.filteredExpenses?.length || 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScore;