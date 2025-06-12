import React, { useEffect, useState } from "react";
import CustomLineChart from "../Charts/CustomLineChart";
import { prepareExpenseLineChartData } from "../../utils/helper";
import moment from 'moment';

const ExpenseChart = ({ 
  transactions, 
  selectedMonth, 
  selectedYear, 
  viewMode 
}) => {
  const [chartData, setChartData] = useState([]);

  // Filter and prepare chart data based on view mode
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([]);
      return;
    }

    try {
      let filteredTransactions = [];

      if (viewMode === 'monthly') {
        // Monthly view: Show daily data for the selected month
        filteredTransactions = transactions.filter(transaction => {
          const transactionMonth = moment(transaction.date).format('YYYY-MM');
          return transactionMonth === selectedMonth;
        });

        // Group by day for monthly view
        const groupedByDay = filteredTransactions.reduce((acc, item) => {
          const dayKey = moment(item.date).format('YYYY-MM-DD');
          const displayDay = moment(item.date).format('MMM DD');
          
          if (!acc[dayKey]) {
            acc[dayKey] = {
              month: displayDay, // Using 'month' to match chart data structure
              amount: 0,
              categories: [],
              count: 0,
              dateForSorting: moment(item.date).toDate()
            };
          }
          
          acc[dayKey].amount += item.amount;
          if (!acc[dayKey].categories.includes(item.category)) {
            acc[dayKey].categories.push(item.category);
          }
          acc[dayKey].count += 1;
          
          return acc;
        }, {});

        // Convert to array and sort by date
        const dailyChartData = Object.keys(groupedByDay)
          .sort((a, b) => new Date(groupedByDay[a].dateForSorting) - new Date(groupedByDay[b].dateForSorting))
          .map(dayKey => ({
            month: groupedByDay[dayKey].month,
            amount: groupedByDay[dayKey].amount,
            categories: groupedByDay[dayKey].categories.join(', '),
            count: groupedByDay[dayKey].count
          }));

        setChartData(dailyChartData);

      } else {
        // Annual view: Show monthly data for the selected year
        filteredTransactions = transactions.filter(transaction => {
          const transactionYear = moment(transaction.date).format('YYYY');
          return transactionYear === selectedYear;
        });

        // Use the existing helper function for monthly grouping
        const result = prepareExpenseLineChartData(filteredTransactions);
        setChartData(result);
      }

    } catch (error) {
      console.error("Error preparing expense chart data:", error);
      setChartData([]);
    }
  }, [transactions, selectedMonth, selectedYear, viewMode]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      const emptyMessage = viewMode === 'monthly' 
        ? `No expenses found for ${moment(selectedMonth).format('MMMM YYYY')}`
        : `No expenses found for ${selectedYear}`;
        
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded">
          <div className="text-center">
            <p className="text-gray-600 font-medium">No Data</p>
            <p className="text-gray-500 text-sm mt-1">
              {emptyMessage}
            </p>
          </div>
        </div>
      );
    }

    return <CustomLineChart data={chartData} />;
  };

  const getChartTitle = () => {
    if (viewMode === 'monthly') {
      return `Daily Expenses - ${moment(selectedMonth).format('MMMM YYYY')}`;
    } else {
      return `Monthly Expenses - ${selectedYear}`;
    }
  };

  const getChartDescription = () => {
    if (viewMode === 'monthly') {
      return "Daily spending patterns for the selected month";
    } else {
      return "Monthly spending trends for the selected year";
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-lg">{getChartTitle()}</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            {getChartDescription()}
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        {renderChart()}
      </div>
    </div>
  );
};

export default ExpenseChart;