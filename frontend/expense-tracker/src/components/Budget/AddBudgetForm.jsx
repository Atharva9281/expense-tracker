import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddBudgetForm = ({ onAddBudget, editingBudget, selectedMonth, selectedYear }) => {
  const [budget, setBudget] = useState({
    category: "",
    amount: "",
    period: "monthly",
    month: "",
    year: "",
    icon: "",
    color: "#875cf5"
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [copyToFutureMonths, setCopyToFutureMonths] = useState(false);

  // ✅ FIX: Wrap getCurrentMonthYear in useCallback
  const getCurrentMonthYear = useCallback(() => {
    if (selectedMonth && selectedYear) {
      const [year, month] = selectedMonth.split('-');
      return { month, year };
    }
    const now = new Date();
    return {
      month: String(now.getMonth() + 1).padStart(2, '0'),
      year: String(now.getFullYear())
    };
  }, [selectedMonth, selectedYear]);

  // ✅ FIX: Wrap getMonthName in useCallback
  const getMonthName = useCallback((monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNum) - 1];
  }, []);

  // ✅ FIX: Now useEffect can include getCurrentMonthYear safely
  useEffect(() => {
    const currentPeriod = getCurrentMonthYear();
    
    if (editingBudget) {
      setBudget({
        category: editingBudget.category || "",
        amount: editingBudget.amount?.toString() || "",
        period: editingBudget.period || "monthly",
        month: editingBudget.month || currentPeriod.month,
        year: editingBudget.year || currentPeriod.year,
        icon: editingBudget.icon || "",
        color: editingBudget.color || "#875cf5"
      });
      setSelectedCategory(editingBudget.category || "");
    } else {
      // Reset form for new budget
      setBudget({
        category: "",
        amount: "",
        period: "monthly",
        month: currentPeriod.month,
        year: currentPeriod.year,
        icon: "",
        color: "#875cf5"
      });
      setSelectedCategory("");
      setCopyToFutureMonths(false);
    }
  }, [editingBudget, getCurrentMonthYear]); // ✅ Now includes getCurrentMonthYear properly

  // ✅ FIX: Wrap handleChange in useCallback
  const handleChange = useCallback((key, value) => {
    setBudget(prev => ({ ...prev, [key]: value }));
  }, []);

  // Quick budget categories with default icons and colors
  const budgetCategories = [
    { name: "Food & Dining", icon: "🍽️", color: "#ef4444", description: "Restaurants, groceries" },
    { name: "Transportation", icon: "🚗", color: "#3b82f6", description: "Gas, public transit" },
    { name: "Shopping", icon: "🛍️", color: "#8b5cf6", description: "Clothes, electronics" },
    { name: "Entertainment", icon: "🎬", color: "#f59e0b", description: "Movies, games" },
    { name: "Bills & Utilities", icon: "⚡", color: "#10b981", description: "Electricity, internet" },
    { name: "Healthcare", icon: "🏥", color: "#06b6d4", description: "Doctor, pharmacy" },
    { name: "Education", icon: "📚", color: "#6366f1", description: "Books, courses" },
    { name: "Travel", icon: "✈️", color: "#f97316", description: "Flights, hotels" },
    { name: "Home & Garden", icon: "🏠", color: "#84cc16", description: "Furniture, repairs" },
    { name: "Personal Care", icon: "💄", color: "#ec4899", description: "Haircut, cosmetics" },
    { name: "Gifts & Donations", icon: "🎁", color: "#14b8a6", description: "Presents, charity" },
    { name: "Groceries", icon: "🛒", color: "#22c55e", description: "Food shopping" },
    { name: "Rent", icon: "🏠", color: "#f59e0b", description: "Monthly rent" },
    { name: "Savings", icon: "💰", color: "#22c55e", description: "Emergency fund, investments" }
  ];

  // ✅ FIX: Wrap handleCategorySelect in useCallback
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category.name);
    setBudget(prev => ({
      ...prev,
      category: category.name,
      icon: prev.icon || category.icon, // Use custom icon if set, otherwise use default
      color: category.color
    }));
  }, []);

  // ✅ FIX: Wrap handleSubmit in useCallback
  const handleSubmit = useCallback(() => {
    // Prevent double submission
    if (!budget.category || !budget.amount || !budget.month || !budget.year) {
      alert("Please fill in all required fields");
      return;
    }

    // Create a copy of budget data
    const submissionData = { 
      ...budget,
      amount: Number(budget.amount),
      copyToFutureMonths: copyToFutureMonths && !editingBudget // Only for new budgets
    };
    
    if (isNaN(submissionData.amount) || submissionData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    console.log("📊 Submitting budget data:", submissionData);
    onAddBudget(submissionData);
  }, [budget, copyToFutureMonths, editingBudget, onAddBudget]);

  return (
    <div>
      {/* Emoji Picker */}
      <EmojiPickerPopup
        icon={budget.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />
      
      {/* Quick Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Categories
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {budgetCategories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={`p-3 border rounded-lg text-left transition-all hover:shadow-md ${
                selectedCategory === category.name
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Input */}
      <Input
        value={budget.category}
        onChange={({ target }) => {
          handleChange("category", target.value);
          setSelectedCategory(target.value);
        }}
        label="Budget Category"
        placeholder="Food, Transport, etc"
        type="text"
      />

      {/* Amount Input */}
      <Input
        value={budget.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Budget Amount"
        placeholder="Enter budget amount"
        type="number"
        min="0"
        step="any"
      />

      {/* Copy to Future Months Option (Only for new budgets) */}
      {!editingBudget && budget.period === 'monthly' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={copyToFutureMonths}
              onChange={(e) => setCopyToFutureMonths(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">
                Copy to future months
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Create the same budget for remaining months in {budget.year}. 
                You can modify each month individually later.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Live Preview */}
      {(budget.category || budget.amount) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Preview</h6>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              style={{ 
                backgroundColor: budget.color + '20', 
                borderColor: budget.color + '40',
                color: budget.color 
              }}
            >
              {budget.icon ? (
                budget.icon.startsWith('http') ? (
                  <img src={budget.icon} alt="Icon" className="w-6 h-6" />
                ) : (
                  <span className="text-lg">{budget.icon}</span>
                )
              ) : (
                <span className="text-lg">💰</span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {budget.category || "Budget Category"}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                ${budget.amount || "0.00"} for {getMonthName(budget.month)} {budget.year}
              </div>
              {budget.period === "annual" && budget.amount && (
                <div className="text-xs text-gray-500">
                  ~${(Number(budget.amount) / 12).toFixed(2)} per month
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          {editingBudget ? "Update Budget" : "Create Budget"}
        </button>
      </div>
    </div>
  );
};

export default AddBudgetForm;