import React from 'react';
import { LuTrendingUp, LuTrendingDown, LuTarget, LuWalletMinimal } from 'react-icons/lu';

const SmartInsights = ({ dashboardData }) => {
  // ✅ CLEANED: Generate Smart Insights using clean variables
  const generateSmartInsights = () => {
    if (!dashboardData) return [];
    
    const insights = [];
    const income = dashboardData.totalIncome || 0;
    const expenses = dashboardData.totalExpenses || 0;
    const balance = dashboardData.totalBalance || 0;
    
    // Savings insights
    if (balance > 0) {
      const savingsRate = ((balance / income) * 100).toFixed(1);
      insights.push({
        type: 'success',
        icon: LuTrendingUp,
        title: 'Great Savings!',
        message: `You saved ${savingsRate}% of your income this period`,
        amount: `+$${balance}`,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-400',
        iconColor: 'text-green-500',
        amountColor: 'text-green-600'
      });
    } else if (balance < 0) {
      insights.push({
        type: 'warning',
        icon: LuTrendingDown,
        title: 'Overspent',
        message: `You spent $${Math.abs(balance)} more than you earned`,
        amount: `-$${Math.abs(balance)}`,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-400',
        iconColor: 'text-red-500',
        amountColor: 'text-red-600'
      });
    }
    
    // ✅ CLEANED: Spending insights using filteredExpenses
    const expenseCategories = {};
    dashboardData.filteredExpenses?.forEach(expense => {
      expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + expense.amount;
    });
    
    if (Object.keys(expenseCategories).length > 0) {
      const topCategory = Object.entries(expenseCategories).reduce((a, b) => a[1] > b[1] ? a : b);
      insights.push({
        type: 'info',
        icon: LuTarget,
        title: 'Top Spending',
        message: `${topCategory[0]} is your biggest expense category`,
        amount: `$${topCategory[1]}`,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-400',
        iconColor: 'text-blue-500',
        amountColor: 'text-blue-600'
      });
    }
    
    // ✅ CLEANED: Income insights using filteredIncome
    const incomeSources = {};
    dashboardData.filteredIncome?.forEach(income => {
      incomeSources[income.source] = (incomeSources[income.source] || 0) + income.amount;
    });
    
    if (Object.keys(incomeSources).length > 0) {
      const topSource = Object.entries(incomeSources).reduce((a, b) => a[1] > b[1] ? a : b);
      insights.push({
        type: 'success',
        icon: LuWalletMinimal,
        title: 'Primary Income',
        message: `${topSource[0]} is your main income source`,
        amount: `$${topSource[1]}`,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-400',
        iconColor: 'text-green-500',
        amountColor: 'text-green-600'
      });
    }
    
    return insights.slice(0, 3); // Return top 3 insights
  };

  const smartInsights = generateSmartInsights();

  if (smartInsights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {smartInsights.map((insight, index) => (
        <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.bgColor} ${insight.borderColor}`}>
          <div className="flex items-start gap-3">
            <insight.icon className={`mt-1 ${insight.iconColor}`} size={20} />
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
              <p className={`text-lg font-bold mt-2 ${insight.amountColor}`}>
                {insight.amount}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartInsights;