export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

import moment from 'moment';

// Keep existing helper functions
export const addThousandsSeparator = (amount) => {
  if (!amount) return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Expense chart data - category-based (unchanged)
export const prepareExpenseBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
      category: item?.category,
      amount: item?.amount,
    }));
    
    return chartData;
};

// Income chart data - MONTHLY GROUPING (updated)
export const prepareIncomeBarChartData = (data = []) => {
    // First, remove duplicates (temporary fix for your current data issue)
    const deduplicatedData = data.filter((transaction, index, arr) => {
      return index === arr.findIndex(t => 
        t.source === transaction.source && 
        t.amount === transaction.amount && 
        t.date === transaction.date
      );
    });
    
    // Group by MONTH instead of individual dates
    const groupedByMonth = deduplicatedData.reduce((acc, item) => {
        // Use YYYY-MM format for grouping (ignoring the day)
        const monthKey = moment(item.date).format('YYYY-MM');
        const displayMonth = moment(item.date).format('MMM YYYY'); // "Jan 2025", "May 2025"
        
        if (!acc[monthKey]) {
            acc[monthKey] = {
                month: displayMonth,
                amount: 0,
                sources: [],
                count: 0,
                dateForSorting: moment(item.date).startOf('month').toDate()
            };
        }
        
        acc[monthKey].amount += item.amount;
        
        // Keep track of unique sources for this month
        if (!acc[monthKey].sources.includes(item.source)) {
            acc[monthKey].sources.push(item.source);
        }
        acc[monthKey].count += 1;
        
        return acc;
    }, {});
    
    // Convert to array and sort by date (chronological order)
    const chartData = Object.keys(groupedByMonth)
        .sort((a, b) => new Date(groupedByMonth[a].dateForSorting) - new Date(groupedByMonth[b].dateForSorting))
        .map(monthKey => ({
            month: groupedByMonth[monthKey].month,
            amount: groupedByMonth[monthKey].amount,
            sources: groupedByMonth[monthKey].sources.join(', '),
            count: groupedByMonth[monthKey].count
        }));
    
    console.log("📊 Monthly grouped chart data:", chartData);
    return chartData;
};

// BONUS: Alternative function for weekly grouping if you want to try it
export const prepareIncomeBarChartDataWeekly = (data = []) => {
    const deduplicatedData = data.filter((transaction, index, arr) => {
      return index === arr.findIndex(t => 
        t.source === transaction.source && 
        t.amount === transaction.amount && 
        t.date === transaction.date
      );
    });
    
    const groupedByWeek = deduplicatedData.reduce((acc, item) => {
        const weekKey = moment(item.date).startOf('week').format('YYYY-MM-DD');
        const displayWeek = `${moment(item.date).startOf('week').format('MMM DD')} - ${moment(item.date).endOf('week').format('MMM DD')}`;
        
        if (!acc[weekKey]) {
            acc[weekKey] = {
                month: displayWeek,
                amount: 0,
                sources: [],
                count: 0,
                dateForSorting: moment(item.date).startOf('week').toDate()
            };
        }
        
        acc[weekKey].amount += item.amount;
        if (!acc[weekKey].sources.includes(item.source)) {
            acc[weekKey].sources.push(item.source);
        }
        acc[weekKey].count += 1;
        
        return acc;
    }, {});
    
    const chartData = Object.keys(groupedByWeek)
        .sort((a, b) => new Date(groupedByWeek[a].dateForSorting) - new Date(groupedByWeek[b].dateForSorting))
        .map(weekKey => ({
            month: groupedByWeek[weekKey].month,
            amount: groupedByWeek[weekKey].amount,
            sources: groupedByWeek[weekKey].sources.join(', '),
            count: groupedByWeek[weekKey].count
        }));
    
    return chartData;
};

// Add this function to your existing helper.js file
export const prepareExpenseLineChartData = (data = []) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("📊 No expense data to process");
      return [];
    }
  
    console.log("📊 Processing expense data:", data);
  
    // First deduplicate (same logic as income)
    const deduplicatedData = data.filter((transaction, index, arr) => {
      return index === arr.findIndex(t => 
        t.category === transaction.category && 
        t.amount === transaction.amount && 
        t.date === transaction.date
      );
    });
  
    // Group by month (consistent with income page)
    const groupedByMonth = deduplicatedData.reduce((acc, item) => {
      const monthKey = moment(item.date).format('YYYY-MM');
      const displayMonth = moment(item.date).format('MMM YYYY');
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: displayMonth,
          amount: 0,
          categories: [],
          count: 0,
          dateForSorting: moment(item.date).startOf('month').toDate()
        };
      }
      
      acc[monthKey].amount += item.amount;
      if (!acc[monthKey].categories.includes(item.category)) {
        acc[monthKey].categories.push(item.category);
      }
      acc[monthKey].count += 1;
      
      return acc;
    }, {});
  
    // Convert to array and sort
    const chartData = Object.keys(groupedByMonth)
      .sort((a, b) => new Date(groupedByMonth[a].dateForSorting) - new Date(groupedByMonth[b].dateForSorting))
      .map(monthKey => ({
        month: groupedByMonth[monthKey].month,
        amount: groupedByMonth[monthKey].amount,
        categories: groupedByMonth[monthKey].categories.join(', '),
        count: groupedByMonth[monthKey].count
      }));
  
    console.log("📊 Final expense chart data:", chartData);
    return chartData;
  };