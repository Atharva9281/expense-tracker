import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import Modal from "../../components/Modal";
import IncomeOverview from "../../components/Income/IncomeOverview";
import IncomeChart from "../../components/Income/IncomeChart";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import IncomeList from "../../components/Income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";

const Income = () => {
  useUserAuth();
  
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false, 
    data: null,
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // View mode and date selection state (like budget and expense pages)
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
        t.source === transaction.source && 
        t.amount === transaction.amount && 
        t.date === transaction.date
      );
    });
  };

  // Get All Income Details
  const fetchIncomeDetails = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.INCOME.GET_ALL_INCOME}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        const deduplicatedData = deduplicateTransactions(response.data);
        setIncomeData(deduplicatedData);
      } else {
        setIncomeData([]);
      }
    } catch (error) {
      console.error("Error fetching income:", error);
      toast.error("Failed to fetch income data");
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add/Edit Income Data
  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    // Validation Checks
    if (!source.trim()) {
      toast.error("Income source is required.");
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
      if (editingIncome) {
        // Update existing income
        await axiosInstance.put(`${API_PATHS.INCOME.UPDATE_INCOME(editingIncome._id)}`, {
          source,
          amount: Number(amount),
          date,
          icon,
        });
        toast.success("Income updated successfully!");
      } else {
        // Add new income
        await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
          source,
          amount: Number(amount),
          date,
          icon,
        });
        toast.success("Income added successfully!");
      }
      
      setOpenAddIncomeModal(false);
      setEditingIncome(null);
      
      // Refresh data after successful add/update
      setTimeout(() => {
        fetchIncomeDetails();
      }, 500);
      
    } catch (error) {
      console.error("Error adding/updating income:", error);
      toast.error(error.response?.data?.message || "Failed to save income. Please try again.");
    }
  };

  // Delete Income
  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      toast.success("Income deleted successfully!");
      
      setOpenDeleteAlert({ show: false, data: null });
      fetchIncomeDetails();
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income. Please try again.");
    }
  };

  // Handle Edit Income
  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setOpenAddIncomeModal(true);
  };

  // ENHANCED: Smart Context-Aware Download with All Data Option
  const handleDownloadIncomeDetails = async (downloadAll = false) => {
    try {
      let url = API_PATHS.INCOME.DOWNLOAD_INCOME;
      let filename = "income_all_data.xlsx";
      let successMessage = "All income data downloaded successfully!";
      
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
          filename = `income_${monthName.toLowerCase()}_${year}.xlsx`;
          successMessage = `${monthName} ${year} income data downloaded successfully!`;
          
        } else if (viewMode === 'annual') {
          params.append('year', selectedYear);
          params.append('viewMode', 'annual');
          filename = `income_annual_${selectedYear}.xlsx`;
          successMessage = `${selectedYear} annual income data downloaded successfully!`;
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
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details. Please try again.");
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

  // Handle add income button
  const handleAddIncomeClick = () => {
    setEditingIncome(null);
    setOpenAddIncomeModal(true);
  };

  useEffect(() => {
    fetchIncomeDetails();
  }, []);

  return (
    <DashboardLayout activeMenu="Income"> 
      <div className="my-5 mx-auto">
        <div className="space-y-6">
          {/* Income Overview with Toggle and Date Picker - FILTERING HAPPENS HERE */}
          <IncomeOverview
            transactions={incomeData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onViewModeChange={handleViewModeChange}
          />

          {/* Income Chart - FILTERS BY MONTHLY/ANNUAL SELECTION */}
          <IncomeChart
            transactions={incomeData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
          />

          {/* Income List with Add Button and Edit Functionality */}
          <IncomeList
            transactions={incomeData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadIncomeDetails}
            onDownloadAll={() => handleDownloadIncomeDetails(true)}
            onAddIncome={handleAddIncomeClick}
            onEditIncome={handleEditIncome}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
          />
        </div>

        {/* Modal for adding/editing income */}
        {openAddIncomeModal && (
          <Modal
            isOpen={openAddIncomeModal}
            onClose={() => {
              setOpenAddIncomeModal(false);
              setEditingIncome(null);
            }}
            title={editingIncome ? "Edit Income" : "Add Income"}
          >
            <AddIncomeForm 
              onAddIncome={handleAddIncome}
              editingIncome={editingIncome}
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
            title="Delete Income"
          >
            <DeleteAlert
              content="Are you sure you want to delete this income entry?"
              onDelete={() => deleteIncome(openDeleteAlert.data)}
              onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            />
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Income;