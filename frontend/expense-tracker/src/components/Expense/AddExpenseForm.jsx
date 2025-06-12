import React, { useState, useEffect } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';

// ✅ FIXED: Added selectedMonth and viewMode props to sync with page state
const AddExpenseForm = ({ onAddExpense, editingExpense, selectedMonth, viewMode, selectedYear }) => {
  const [expense, setExpense] = useState({
    category: "",
    amount: "",
    date: "",
    icon: ""
  });

  const [selectedCategory, setSelectedCategory] = useState("");

  // Helper function to format date for input (YYYY-MM-DD) without timezone issues
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // Create date object and get local date components
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // ✅ FIXED: Get smart default date based on selected month/year
  const getSmartDefaultDate = () => {
    if (viewMode === 'monthly' && selectedMonth) {
      // For monthly view, default to first day of selected month
      const [year, month] = selectedMonth.split('-');
      return `${year}-${month}-01`;
    } else if (viewMode === 'annual' && selectedYear) {
      // For annual view, default to first day of current month in selected year
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      return `${selectedYear}-${currentMonth}-01`;
    } else {
      // Fallback to today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setExpense({
        category: editingExpense.category || "",
        amount: editingExpense.amount?.toString() || "",
        date: formatDateForInput(editingExpense.date), // Use fixed date formatting
        icon: editingExpense.icon || ""
      });
      setSelectedCategory(editingExpense.category || "");
    } else {
      // ✅ FIXED: Reset form for new expense with smart default date
      setExpense({
        category: "",
        amount: "",
        date: getSmartDefaultDate(), // Use smart default based on selected period
        icon: ""
      });
      setSelectedCategory("");
    }
  }, [editingExpense, selectedMonth, viewMode, selectedYear]); // ✅ FIXED: Added dependencies

  const handleChange = (key, value) => {
    setExpense({ ...expense, [key]: value });
  };

  // Quick expense categories with default icons
  const expenseCategories = [
    { name: "Food & Dining", icon: "🍽️", description: "Restaurants, groceries" },
    { name: "Transportation", icon: "🚗", description: "Gas, public transit" },
    { name: "Shopping", icon: "🛍️", description: "Clothes, electronics" },
    { name: "Entertainment", icon: "🎬", description: "Movies, games" },
    { name: "Bills & Utilities", icon: "⚡", description: "Electricity, internet" },
    { name: "Healthcare", icon: "🏥", description: "Doctor, pharmacy" },
    { name: "Education", icon: "📚", description: "Books, courses" },
    { name: "Travel", icon: "✈️", description: "Flights, hotels" },
    { name: "Home & Garden", icon: "🏠", description: "Furniture, repairs" },
    { name: "Personal Care", icon: "💄", description: "Haircut, cosmetics" },
    { name: "Gifts & Donations", icon: "🎁", description: "Presents, charity" },
    { name: "Other", icon: "💰", description: "Miscellaneous" }
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setExpense({
      ...expense,
      category: category.name,
      icon: expense.icon || category.icon // Use custom icon if set, otherwise use default
    });
  };

  // Enhanced submission handler with proper date formatting
  const handleSubmit = () => {
    // Create a copy of expense data
    const submissionData = { ...expense };
    
    // Ensure date is in the correct format for backend
    if (submissionData.date) {
      // The date input already gives us YYYY-MM-DD format, which is perfect
      // Just ensure we're sending it as a string in the correct format
      submissionData.date = submissionData.date;
    }
    
    // Convert amount to number
    if (submissionData.amount) {
      submissionData.amount = Number(submissionData.amount);
    }
    
    console.log("📅 Submitting expense data:", submissionData);
    onAddExpense(submissionData);
  };

  // ✅ ADDED: Helper to show which period the form is defaulting to
  const getPeriodHint = () => {
    if (viewMode === 'monthly' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return `Defaulting to ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else if (viewMode === 'annual' && selectedYear) {
      return `Defaulting to ${selectedYear}`;
    }
    return "Defaulting to today";
  };

  return (
    <div>
      {/* Emoji Picker */}
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      {/* Quick Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Categories
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {expenseCategories.map((category) => (
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
                <span className="text-lg">{category.icon}</span>
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
        value={expense.category}
        onChange={({ target }) => {
          handleChange("category", target.value);
          setSelectedCategory(target.value);
        }}
        label="Expense Category"
        placeholder="Food, Transport, etc"
        type="text"
      />

      {/* Amount Input */}
      <Input
        value={expense.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder="Enter amount"
        type="number"
        min="0"
        step="any"
      />

      {/* ✅ IMPROVED: Date Input with helpful hint */}
      <div className="mb-4">
        <Input
          value={expense.date}
          onChange={({ target }) => handleChange("date", target.value)}
          label="Date"
          placeholder="Select date"
          type="date"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 {getPeriodHint()}
        </p>
      </div>

      {/* Live Preview */}
      {(expense.category || expense.amount) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Preview</h6>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center">
              {expense.icon ? (
                expense.icon.startsWith('http') ? (
                  <img src={expense.icon} alt="Icon" className="w-6 h-6" />
                ) : (
                  <span className="text-lg">{expense.icon}</span>
                )
              ) : (
                <span className="text-lg">💰</span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {expense.category || "Expense Category"}
              </div>
              <div className="text-sm text-red-600 font-semibold">
                -${expense.amount || "0.00"}
              </div>
              {expense.date && (
                <div className="text-xs text-gray-500">
                  {new Date(expense.date + 'T00:00:00').toLocaleDateString()}
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
          {editingExpense ? "Update Expense" : "Add Expense"}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;