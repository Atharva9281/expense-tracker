// import React, { useState, useEffect, useCallback } from "react";
// import DashboardLayout from "../../components/layouts/DashboardLayout";
// import { useUserAuth } from "../../hooks/useUserAuth";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPath";
// import toast from "react-hot-toast";
// import Modal from "../../components/Modal";
// import BudgetOverview from "../../components/Budget/BudgetOverview";
// import BudgetList from "../../components/Budget/BudgetList";
// import AddBudgetForm from "../../components/Budget/AddBudgetForm";
// import DeleteAlert from "../../components/DeleteAlert";

// const Budget = () => {
//   useUserAuth();

//   const [budgetAnalysis, setBudgetAnalysis] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [openAddBudgetModal, setOpenAddBudgetModal] = useState(false);
//   const [editingBudget, setEditingBudget] = useState(null);
//   const [openDeleteAlert, setOpenDeleteAlert] = useState({
//     show: false,
//     data: null,
//   });
  
//   // New state for view mode
//   const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'annual'
  
//   const [selectedMonth, setSelectedMonth] = useState(() => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//   });
  
//   const [selectedYear, setSelectedYear] = useState(() => {
//     return new Date().getFullYear().toString();
//   });

//   // ✅ FIX: Remove 'loading' from dependencies to prevent infinite loop
//   const fetchBudgetAnalysis = useCallback(async () => {
//     if (loading) return;
//     setLoading(true);

//     try {
//       let response;
      
//       if (viewMode === 'monthly') {
//         const [year, month] = selectedMonth.split('-');
//         response = await axiosInstance.get(
//           `${API_PATHS.BUDGET.GET_ANALYSIS}?year=${year}&month=${month}`
//         );
//       } else {
//         // Annual view - call endpoint with viewMode parameter
//         response = await axiosInstance.get(
//           `${API_PATHS.BUDGET.GET_ANALYSIS}?year=${selectedYear}&viewMode=annual`
//         );
//       }
      
//       setBudgetAnalysis(response.data);
//     } catch (error) {
//       console.error("Error fetching budget analysis:", error);
//       toast.error("Failed to fetch budget data");
//     } finally {
//       setLoading(false);
//     }
//   }, [viewMode, selectedMonth, selectedYear]); // ✅ REMOVED 'loading' from dependencies

//   // ✅ FIX: Wrap handleAddBudget in useCallback to prevent recreation on every render
//   const handleAddBudget = useCallback(async (budgetData) => {
//     console.log("🔍 Budget data being sent:", budgetData);
//     const { category, amount, period, month, year, color, icon, copyToFutureMonths } = budgetData;

//     if (!category.trim()) {
//       toast.error("Category is required.");
//       return;
//     }

//     if (!amount || isNaN(amount) || Number(amount) <= 0) {
//       toast.error("Amount should be a valid number greater than 0.");
//       return;
//     }

//     // NEW: Validate month and year for new budgets
//     if (!editingBudget && (!month || !year)) {
//       toast.error("Month and year are required.");
//       return;
//     }

//     try {
//       if (editingBudget) {
//         // UPDATE: Don't send month/year when editing (they're locked)
//         await axiosInstance.put(API_PATHS.BUDGET.UPDATE_BUDGET(editingBudget._id), {
//           category: category.trim(),
//           amount: Number(amount),
//           period,
//           color,
//           icon
//         });
//         toast.success("Budget updated successfully!");
//       } else {
//         // CREATE: Send month/year for new budgets
//         const response = await axiosInstance.post(API_PATHS.BUDGET.ADD_BUDGET, {
//           category: category.trim(),
//           amount: Number(amount),
//           period,
//           month,
//           year,
//           color,
//           icon,
//           copyToFutureMonths
//         });
//         toast.success(response.data.message || "Budget added successfully!");
//       }

//       setOpenAddBudgetModal(false);
//       setEditingBudget(null);
//       fetchBudgetAnalysis();
//     } catch (error) {
//       console.error("Error adding/updating budget:", error);
//       toast.error(error.response?.data?.message || "Failed to save budget. Please try again.");
//     }
//   }, [editingBudget, fetchBudgetAnalysis]);

//   // ✅ FIX: Wrap deleteBudget in useCallback
//   const deleteBudget = useCallback(async (id) => {
//     try {
//       await axiosInstance.delete(API_PATHS.BUDGET.DELETE_BUDGET(id));
//       toast.success("Budget deleted successfully!");
//       setOpenDeleteAlert({ show: false, data: null });
//       fetchBudgetAnalysis();
//     } catch (error) {
//       console.error("Error deleting budget:", error);
//       toast.error("Failed to delete budget. Please try again.");
//     }
//   }, [fetchBudgetAnalysis]);

//   // ✅ FIX: Wrap handleEditBudget in useCallback
//   const handleEditBudget = useCallback((budget) => {
//     setEditingBudget(budget);
//     setOpenAddBudgetModal(true);
//   }, []);

//   // ✅ FIX: Wrap handleAddBudgetClick in useCallback
//   const handleAddBudgetClick = useCallback(() => {
//     setEditingBudget(null);
//     setOpenAddBudgetModal(true);
//   }, []);

//   // ✅ FIX: Wrap handleDownloadBudgetDetails in useCallback
//   const handleDownloadBudgetDetails = useCallback(async (downloadAll = false) => {
//     try {
//       let url = `${API_PATHS.BUDGET.GET_ANALYSIS.replace('/analysis', '/download')}`;
//       let filename = "budget_all_data.xlsx";
//       let successMessage = "All budget data downloaded successfully!";
      
//       if (!downloadAll) {
//         // Context-aware download based on current view
//         const params = new URLSearchParams();
        
//         if (viewMode === 'monthly') {
//           const [year, month] = selectedMonth.split('-');
//           params.append('month', month);
//           params.append('year', year);
//           params.append('viewMode', 'monthly');
          
//           const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//           const monthName = monthNames[parseInt(month) - 1];
//           filename = `budget_${monthName.toLowerCase()}_${year}.xlsx`;
//           successMessage = `${monthName} ${year} budget data downloaded successfully!`;
          
//         } else if (viewMode === 'annual') {
//           params.append('year', selectedYear);
//           params.append('viewMode', 'annual');
//           filename = `budget_annual_${selectedYear}.xlsx`;
//           successMessage = `${selectedYear} annual budget data downloaded successfully!`;
//         }
        
//         if (params.toString()) {
//           url += `?${params.toString()}`;
//         }
//       }
      
//       console.log("🔍 Budget download request:", { url, viewMode, selectedMonth, selectedYear, downloadAll });
      
//       const response = await axiosInstance.get(url, { responseType: "blob" });
      
//       const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = downloadUrl;
//       link.setAttribute("download", filename);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
      
//       toast.success(successMessage);
      
//     } catch (error) {
//       console.error("Error downloading budget details:", error);
//       toast.error("Failed to download budget details. Please try again.");
//     }
//   }, [viewMode, selectedMonth, selectedYear]);

//   // ✅ FIX: Wrap handle functions in useCallback
//   const handleMonthChange = useCallback((newMonth) => {
//     setSelectedMonth(newMonth);
//   }, []);

//   const handleYearChange = useCallback((newYear) => {
//     setSelectedYear(newYear);
//   }, []);

//   const handleViewModeChange = useCallback((mode) => {
//     setViewMode(mode);
//   }, []);

//   // ✅ FIX: Wrap modal handlers in useCallback
//   const handleCloseBudgetModal = useCallback(() => {
//     setOpenAddBudgetModal(false);
//     setEditingBudget(null);
//   }, []);

//   const handleCloseDeleteAlert = useCallback(() => {
//     setOpenDeleteAlert({ show: false, data: null });
//   }, []);

//   const handleConfirmDelete = useCallback(() => {
//     deleteBudget(openDeleteAlert.data);
//   }, [deleteBudget, openDeleteAlert.data]);

//   // ✅ FIX: Clean useEffect with proper dependencies
//   useEffect(() => {
//     fetchBudgetAnalysis();
//   }, [fetchBudgetAnalysis]);

//   return (
//     <DashboardLayout activeMenu="Budget">
//       <div className="my-5 mx-auto">
//         <div className="space-y-6">
          
//           {/* Budget Overview with View Toggle and Date Picker */}
//           <BudgetOverview 
//             budgetAnalysis={budgetAnalysis}
//             selectedMonth={selectedMonth}
//             selectedYear={selectedYear}
//             viewMode={viewMode}
//             onMonthChange={handleMonthChange}
//             onYearChange={handleYearChange}
//             onViewModeChange={handleViewModeChange}
//           />

//           {/* Budget List with Create Button and Download */}
//           <BudgetList
//             budgetAnalysis={budgetAnalysis}
//             onEdit={handleEditBudget}
//             onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
//             onDownload={handleDownloadBudgetDetails}
//             onDownloadAll={() => handleDownloadBudgetDetails(true)}
//             selectedMonth={selectedMonth}
//             selectedYear={selectedYear}
//             viewMode={viewMode}
//             onMonthChange={handleMonthChange}
//             onCreateBudget={handleAddBudgetClick}
//           />

//         </div>

//         {/* ✅ CRITICAL FIX: Always render Modals to maintain consistent hook count */}
//         {/* Add/Edit Budget Modal - Always rendered, visibility controlled by isOpen */}
//         <Modal
//           isOpen={openAddBudgetModal}
//           onClose={handleCloseBudgetModal}
//           title={editingBudget ? "Edit Budget" : "Add Budget"}
//         >
//           <AddBudgetForm 
//             onAddBudget={handleAddBudget}
//             editingBudget={editingBudget}
//             selectedMonth={selectedMonth}
//             selectedYear={selectedYear}
//             onCancel={handleCloseBudgetModal}
//           />
//         </Modal>

//         {/* Delete Confirmation Modal - Always rendered, visibility controlled by isOpen */}
//         <Modal
//           isOpen={openDeleteAlert.show}
//           onClose={handleCloseDeleteAlert}
//           title="Delete Budget"
//         >
//           <DeleteAlert
//             content="Are you sure you want to delete this budget? This action cannot be undone."
//             onDelete={handleConfirmDelete}
//             onCancel={handleCloseDeleteAlert}
//           />
//         </Modal>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Budget;

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import BudgetOverview from "../../components/Budget/BudgetOverview";
import BudgetList from "../../components/Budget/BudgetList";
import AddBudgetForm from "../../components/Budget/AddBudgetForm";
import DeleteAlert from "../../components/DeleteAlert";

const Budget = () => {
  useUserAuth();
  
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });
  const [openAddBudgetModal, setOpenAddBudgetModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });
  const [editingBudget, setEditingBudget] = useState(null);

  return (
    <DashboardLayout activeMenu="Budget">
      <div className="my-5 mx-auto">
        <div className="space-y-6">
          <BudgetOverview 
            budgetAnalysis={budgetAnalysis}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
            onMonthChange={(m) => setSelectedMonth(m)}
            onYearChange={(y) => setSelectedYear(y)}
            onViewModeChange={(m) => setViewMode(m)}
          />
          
          <BudgetList
            budgetAnalysis={budgetAnalysis}
            onEdit={(budget) => {
              setEditingBudget(budget);
              setOpenAddBudgetModal(true);
            }}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={() => console.log('Download')}
            onDownloadAll={() => console.log('Download All')}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            viewMode={viewMode}
            onMonthChange={(m) => setSelectedMonth(m)}
            onCreateBudget={() => setOpenAddBudgetModal(true)}
          />
        </div>

        {/* Add AddBudgetForm */}
        <Modal
          isOpen={openAddBudgetModal}
          onClose={() => {
            setOpenAddBudgetModal(false);
            setEditingBudget(null);
          }}
          title={editingBudget ? "Edit Budget" : "Add Budget"}
        >
          <AddBudgetForm 
            onAddBudget={(data) => console.log('Add budget:', data)}
            editingBudget={editingBudget}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onCancel={() => {
              setOpenAddBudgetModal(false);
              setEditingBudget(null);
            }}
          />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Budget"
        >
          <DeleteAlert
            content="Are you sure you want to delete this budget? This action cannot be undone."
            onDelete={() => console.log('Delete:', openDeleteAlert.data)}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Budget;