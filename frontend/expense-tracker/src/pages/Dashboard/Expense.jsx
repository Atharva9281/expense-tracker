import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import Modal from "../../components/Modal";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import ExpenseChart from "../../components/Expense/ExpenseChart";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";

const Expense = () => {
  useUserAuth();
  
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false, 
    data: null,
  });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // View mode and date selection state (like budget page)
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'annual'
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });

  // Deduplication helper function
  const deduplicateTransactions = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter((transaction, index, arr) => {
      return index === arr.findIndex(t => 
        t.category === transaction.category && 
        t.amount === transaction.amount && 
        t.date === transaction.date
      );
    });
  };

  // Get All Expense Details
  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        const deduplicatedData = deduplicateTransactions(response.data);
        setExpenseData(deduplicatedData);
      } else {
        setExpenseData([]);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to fetch expense data");
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add/Edit Expense Data
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    // Validation Checks
    if (!category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      if (editingExpense) {
        // Update existing expense
        await axiosInstance.put(`${API_PATHS.EXPENSE.UPDATE_EXPENSE(editingExpense._id)}`, {
          category,
          amount: Number(amount),
          date,
          icon,
        });
        toast.success("Expense updated successfully!");
      } else {
        // Add new expense
        await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
          category,
          amount: Number(amount),
          date,
          icon,
        });
        toast.success("Expense added successfully!");
      }
      
      setOpenAddExpenseModal(false);
      setEditingExpense(null);
      
      // Refresh data after successful add/update
      setTimeout(() => {
        fetchExpenseDetails();
      }, 500);
      
    } catch (error) {
      console.error("Error adding/updating expense:", error);
      toast.error(error.response?.data?.message || "Failed to save expense. Please try again.");
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      toast.success("Expense deleted successfully!");
      
      setOpenDeleteAlert({ show: false, data: null });
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  // Handle Edit Expense
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setOpenAddExpenseModal(true);
  };

  // ENHANCED: Smart Context-Aware Download with All Data Option
  const handleDownloadExpenseDetails = async (downloadAll = false) => {
    try {
      let url = API_PATHS.EXPENSE.DOWNLOAD_EXPENSE;
      let filename = "expense_all_data.xlsx";
      let successMessage = "All expense data downloaded successfully!";
      
      if (!downloadAll) {
        // Context-aware download based on current view
        const params = new URLSearchParams();
        
        if (viewMode === 'monthly') {
          const [year, month] = selectedMonth.split('-');
          params.append('month', month);
          params.append('year', year);
          params.append('viewMode', 'monthly');
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthName = monthNames[parseInt(month) - 1];
          filename = `expense_${monthName.toLowerCase()}_${year}.xlsx`;
          successMessage = `${monthName} ${year} expense data downloaded successfully!`;
          
        } else if (viewMode === 'annual') {
          params.append('year', selectedYear);
          params.append('viewMode', 'annual');
          filename = `expense_annual_${selectedYear}.xlsx`;
          successMessage = `${selectedYear} annual expense data downloaded successfully!`;
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      console.log("🔍 Download request:", { url, viewMode, selectedMonth, selectedYear, downloadAll });
      
      const response = await axiosInstance.get(url, { responseType: "blob" });
      
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(successMessage);
      
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again.");
    }
  };

  // Handle month change
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  // Handle year change (for annual view)
  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle add expense button
  const handleAddExpenseClick = () => {
    setEditingExpense(null);
    setOpenAddExpenseModal(true);
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, []);

  return (
    <DashboardLayout activeMenu="Expense"> 
      <div className="my-5 mx-auto">
        <div className="space-y-6">
          {/* Expense Overview with Toggle and Date Picker - FILTERING HAPPENS HERE */}
          <ExpenseOverview
            transactions={expenseData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onViewModeChange={handleViewModeChange}
          />

          {/* Expense Chart - NOW FILTERS BY MONTHLY/ANNUAL SELECTION */}
          <ExpenseChart
            transactions={expenseData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
          />

          {/* Expense List with Add Button and Edit Functionality */}
          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadExpenseDetails}
            onDownloadAll={() => handleDownloadExpenseDetails(true)}
            onAddExpense={handleAddExpenseClick}
            onEditExpense={handleEditExpense}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
          />
        </div>

        {/* Modal for adding/editing expenses */}
        {openAddExpenseModal && (
          <Modal
            isOpen={openAddExpenseModal}
            onClose={() => {
              setOpenAddExpenseModal(false);
              setEditingExpense(null);
            }}
            title={editingExpense ? "Edit Expense" : "Add Expense"}
          >
            <AddExpenseForm 
              onAddExpense={handleAddExpense}
              editingExpense={editingExpense}
              selectedMonth={selectedMonth}
              viewMode={viewMode}
              selectedYear={selectedYear}
            />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {openDeleteAlert.show && (
          <Modal
            isOpen={openDeleteAlert.show}
            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
            title="Delete Expense"
          >
            <DeleteAlert
              content="Are you sure you want to delete this expense detail?"
              onDelete={() => deleteExpense(openDeleteAlert.data)}
              onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            />
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Expense;