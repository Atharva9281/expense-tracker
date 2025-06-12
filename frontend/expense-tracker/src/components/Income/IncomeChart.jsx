import React, { useEffect, useState } from "react";
import CustomBarChart from "../Charts/CustomBarChart";
import { prepareIncomeBarChartData } from "../../utils/helper";
import moment from 'moment';

const IncomeChart = ({ 
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
        // Monthly view: Show individual transactions for the selected month
        filteredTransactions = transactions.filter(transaction => {
          const transactionMonth = moment(transaction.date).format('YYYY-MM');
          return transactionMonth === selectedMonth;
        });

        // FIXED: Sort transactions by date before converting to chart data
        const sortedTransactions = filteredTransactions.sort((a, b) => {
          return moment(a.date).valueOf() - moment(b.date).valueOf();
        });

        // Convert each transaction to chart data (individual bars)
        const individualChartData = sortedTransactions.map((transaction, index) => ({
          month: moment(transaction.date).format('MMM DD'), // Short label for X-axis
          amount: transaction.amount,
          source: transaction.source, // Source name for label on bar
          date: moment(transaction.date).format('MMM DD'),
          count: 1,
          sortKey: moment(transaction.date).valueOf() // Add sort key for additional sorting if needed
        }));

        console.log("🔍 Monthly view - filtered transactions:", filteredTransactions);
        console.log("📊 Sorted individual transaction bars:", individualChartData);
        
        setChartData(individualChartData);

      } else {
        // Annual view: Show monthly data for the selected year
        filteredTransactions = transactions.filter(transaction => {
          const transactionYear = moment(transaction.date).format('YYYY');
          return transactionYear === selectedYear;
        });

        // Use the existing helper function for monthly grouping
        const result = prepareIncomeBarChartData(filteredTransactions);
        
        // FIXED: Ensure annual data is also sorted by month
        const sortedAnnualData = result.sort((a, b) => {
          // Assuming the month property is in format like "Jan", "Feb", etc.
          const monthA = moment(a.month, 'MMM').month();
          const monthB = moment(b.month, 'MMM').month();
          return monthA - monthB;
        });
        
        setChartData(sortedAnnualData);
      }

    } catch (error) {
      console.error("Error preparing income chart data:", error);
      setChartData([]);
    }
  }, [transactions, selectedMonth, selectedYear, viewMode]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      const emptyMessage = viewMode === 'monthly' 
        ? `No income found for ${moment(selectedMonth).format('MMMM YYYY')}`
        : `No income found for ${selectedYear}`;
        
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

    return <CustomBarChart data={chartData} />;
  };

  const getChartTitle = () => {
    if (viewMode === 'monthly') {
      return `Daily Income - ${moment(selectedMonth).format('MMMM YYYY')}`;
    } else {
      return `Monthly Income - ${selectedYear}`;
    }
  };

  const getChartDescription = () => {
    if (viewMode === 'monthly') {
      return "Daily income patterns for the selected month";
    } else {
      return "Monthly income trends for the selected year";
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

export default IncomeChart;