import React, {useState, useEffect} from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { Navigate, useNavigate } from 'react-router-dom'
import { API_PATHS } from '../../utils/apiPath'
import axiosInstance from '../../utils/axiosInstance'
import { IoMdCard } from 'react-icons/io'
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu'
import InfoCard from '../../components/Cards/InfoCard'
import { addThousandsSeparator } from '../../utils/helper'
import FinanceOverview from '../../components/Dashboard/FinanceOverview'
import FinancialHealthScore from '../../components/Dashboard/FinancialHealthScore'
import SmartInsights from '../../components/Dashboard/SmartInsights'
import BudgetStyleSpending from '../../components/Dashboard/BudgetStyleSpending'
import MonthYearPicker from '../../components/MonthYearPicker'
import moment from 'moment'

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // View mode and date selection state
  const [viewMode, setViewMode] = useState('monthly');
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });
  
  // Year Picker Component
  const YearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i);
    
    return (
      <select
        value={selectedYear}
        onChange={(e) => handleYearChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };

  // Deduplication helper function
  const deduplicateTransactions = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter((transaction, index, arr) => {
      return index === arr.findIndex(t => t._id === transaction._id);
    });
  };

  // ✅ COMPLETELY CLEAN: No more confusing variable names
  const filterDataByPeriod = (allData) => {
    if (!allData) return null;

    let filteredIncome = [];
    let filteredExpenses = [];

    if (viewMode === 'monthly') {
      // Filter by selected month
      if (allData.allIncome) {
        filteredIncome = allData.allIncome.filter(transaction => {
          const transactionMonth = moment(transaction.date).format('YYYY-MM');
          return transactionMonth === selectedMonth;
        });
      }

      if (allData.allExpenses) {
        filteredExpenses = allData.allExpenses.filter(transaction => {
          const transactionMonth = moment(transaction.date).format('YYYY-MM');
          return transactionMonth === selectedMonth;
        });
      }
    } else {
      // Annual view - filter by selected year
      if (allData.allIncome) {
        filteredIncome = allData.allIncome.filter(transaction => {
          const transactionYear = moment(transaction.date).format('YYYY');
          return transactionYear === selectedYear;
        });
      }

      if (allData.allExpenses) {
        filteredExpenses = allData.allExpenses.filter(transaction => {
          const transactionYear = moment(transaction.date).format('YYYY');
          return transactionYear === selectedYear;
        });
      }
    }

    // Calculate totals for selected period
    const totalIncome = filteredIncome.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    // ✅ CLEAN DATA STRUCTURE - No more confusing names!
    return {
      ...allData,
      totalIncome,
      totalExpenses,
      totalBalance,
      filteredIncome,     // ✅ CLEAN: Instead of last60DaysIncome
      filteredExpenses,   // ✅ CLEAN: Instead of last30DaysExpenses
      recentTransactions: allData.recentTransactions || []
    };
  };
  
  // ✅ SIMPLIFIED: Single API call
  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Single API call - backend sends clean allIncome and allExpenses
      const dashboardResponse = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
        
      if (dashboardResponse.data) {
        const cleanedData = { ...dashboardResponse.data };
        
        // Deduplicate if needed
        if (cleanedData.allIncome) {
          cleanedData.allIncome = deduplicateTransactions(cleanedData.allIncome);
        }
        
        if (cleanedData.allExpenses) {
          cleanedData.allExpenses = deduplicateTransactions(cleanedData.allExpenses);
        }
        
        // Store all data for filtering
        setAllData(cleanedData);
        
        // Apply initial filtering
        const filteredData = filterDataByPeriod(cleanedData);
        setDashboardData(filteredData);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Re-filter data when view mode or period changes
  useEffect(() => {
    if (allData) {
      const filteredData = filterDataByPeriod(allData);
      setDashboardData(filteredData);
    }
  }, [viewMode, selectedMonth, selectedYear, allData]);

  useEffect(() => {
    fetchDashboardData();
    return () => {}; 
  }, []);

  // Get period display text
  const getPeriodDisplay = () => {
    if (viewMode === 'monthly') {
      return moment(selectedMonth).format('MMMM YYYY');
    } else {
      return selectedYear;
    }
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Your complete financial overview for {getPeriodDisplay()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'monthly' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleViewModeChange('annual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'annual' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annual
              </button>
            </div>
            
            {/* Date Picker */}
            {viewMode === 'monthly' ? (
              <MonthYearPicker
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            ) : (
              <YearPicker />
            )}
          </div>
        </div>

        {/* Financial Health Score */}
        <FinancialHealthScore 
          dashboardData={dashboardData} 
          getPeriodDisplay={getPeriodDisplay} 
        />

        {/* Smart Insights Row */}
        <SmartInsights dashboardData={dashboardData} />

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
            color="bg-green-500"
          />
          
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={addThousandsSeparator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
          
          <InfoCard
            icon={<IoMdCard />}
            label="Net Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Overview Donut Chart */}
          <div className="bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 p-6">
            <FinanceOverview
              totalBalance={dashboardData?.totalBalance || 0}
              totalIncome={dashboardData?.totalIncome || 0}
              totalExpense={dashboardData?.totalExpenses || 0}
              period={getPeriodDisplay()}
            />
          </div>

          {/* ✅ CLEAN: Budget Style Spending now uses filteredExpenses */}
          <BudgetStyleSpending 
            dashboardData={dashboardData} 
            viewMode={viewMode}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;