const xlsx = require("xlsx"); 
const Expense = require("../models/Expense");

// ADD THIS IMPORT
const { clearUserCache } = require('../middleware/cache');

// NEW CODE (UTC-safe)
const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        
        // ✅ FIX: Create UTC date instead of local time
        return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Noon UTC to avoid timezone shifts
    }
    
    return new Date(dateString);
};

// UPDATED addExpense function (add cache clearing)
exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, category, amount, date } = req.body;
        
        console.log("Processing Expense data:", { userId, icon, category, amount, date });
        
        if (!category || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const expenseDate = parseLocalDate(date);
        console.log("📅 Date parsing:", { original: date, parsed: expenseDate });
        
        const existingExpense = await Expense.findOne({
            userId,
            category: category.trim(),
            amount: Number(amount),
            date: {
                $gte: new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate()),
                $lt: new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate() + 1)
            }
        });
        
        if (existingExpense) {
            console.log("🚫 Duplicate expense detected, preventing save");
            return res.status(400).json({ 
                message: "Duplicate entry detected. An expense with the same category, amount, and date already exists."
            });
        }
    
        const newExpense = new Expense({
            userId,
            icon, 
            category: category.trim(),
            amount: Number(amount),
            date: expenseDate
        });

        await newExpense.save();
        
        // ADD THIS LINE - Clear cache when data changes
        clearUserCache(userId);
        
        console.log("✅ New expense added successfully (no duplicates)");
        res.status(200).json(newExpense);
    } catch(error) {
        console.error("Error adding expense:", error.message, error.stack);
        res.status(500).json({message: "Server Error"});
    }
}

// UPDATED updateExpense function (add cache clearing)
exports.updateExpense = async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    
    try {
        const { icon, category, amount, date } = req.body;
        
        console.log("Updating expense:", { expenseId, userId, icon, category, amount, date });
        
        if (!category || !amount) {
            return res.status(400).json({ message: "Category and amount are required" });
        }
        
        const expenseDate = parseLocalDate(date);
        console.log("📅 Update date parsing:", { original: date, parsed: expenseDate });
        
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: expenseId, userId },
            {
                icon,
                category: category.trim(),
                amount: Number(amount),
                date: expenseDate
            },
            { new: true }
        );
        
        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found or you don't have permission to update it" });
        }
        
        // ADD THIS LINE - Clear cache when data changes
        clearUserCache(userId);
        
        console.log("✅ Expense updated successfully");
        res.status(200).json(updatedExpense);
        
    } catch(error) {
        console.error("Error updating expense:", error.message, error.stack);
        res.status(500).json({message: "Server Error"});
    }
}

// Keep your getAllExpense function (no changes needed)
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expense); 
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}

// UPDATED deleteExpense function (add cache clearing)
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        
        // ADD THIS LINE - Clear cache when data changes
        clearUserCache(req.user.id);
        
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// Keep all your existing helper functions (no changes)
const deduplicateExpenseData = (expenseArray) => {
    if (!expenseArray || !Array.isArray(expenseArray)) return [];
    
    return expenseArray.filter((transaction, index, arr) => {
        return index === arr.findIndex(t => 
            t.category === transaction.category && 
            t.amount === transaction.amount && 
            t.date.getTime() === transaction.date.getTime()
        );
    });
};

const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNum) - 1];
};

const categorizeExpenseType = (category) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('food') || categoryLower.includes('grocery') || categoryLower.includes('restaurant') || categoryLower.includes('dining')) {
        return 'Food & Dining';
    } else if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('fuel') || categoryLower.includes('uber') || categoryLower.includes('taxi')) {
        return 'Transportation';
    } else if (categoryLower.includes('rent') || categoryLower.includes('mortgage') || categoryLower.includes('utilities') || categoryLower.includes('electricity') || categoryLower.includes('water')) {
        return 'Bills & Utilities';
    } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('doctor') || categoryLower.includes('medicine')) {
        return 'Healthcare';
    } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie') || categoryLower.includes('game') || categoryLower.includes('fun')) {
        return 'Entertainment';
    } else if (categoryLower.includes('shopping') || categoryLower.includes('clothes') || categoryLower.includes('fashion') || categoryLower.includes('retail')) {
        return 'Shopping';
    } else if (categoryLower.includes('education') || categoryLower.includes('course') || categoryLower.includes('book') || categoryLower.includes('learning')) {
        return 'Education';
    } else if (categoryLower.includes('travel') || categoryLower.includes('vacation') || categoryLower.includes('hotel') || categoryLower.includes('flight')) {
        return 'Travel';
    } else {
        return 'Other';
    }
};

// ENHANCED: Professional Excel Download (No Summary) - Removed Icon column
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const { month, year, viewMode } = req.query;
        
        console.log("📊 Expense download request:", { userId, month, year, viewMode });
        
        // Get all expense data first
        const allExpenses = await Expense.find({ userId }).sort({ date: -1 });
        
        // Apply deduplication
        const deduplicatedExpenses = deduplicateExpenseData(allExpenses);
        
        let filteredData = deduplicatedExpenses;
        let filename = "expense_all_data.xlsx";
        let periodText = "All Data";
        
        // Filter based on request parameters
        if (month && year) {
            // Monthly view - filter by specific month/year
            filteredData = deduplicatedExpenses.filter(item => {
                const itemDate = new Date(item.date);
                const itemYear = itemDate.getFullYear();
                const itemMonth = itemDate.getMonth() + 1;
                
                return itemYear === parseInt(year) && itemMonth === parseInt(month);
            });
            
            const monthName = getMonthName(month);
            filename = `expense_${monthName.toLowerCase()}_${year}.xlsx`;
            periodText = `${monthName} ${year}`;
            
        } else if (year && !month) {
            // Annual view - filter by year only
            filteredData = deduplicatedExpenses.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === parseInt(year);
            });
            
            filename = `expense_annual_${year}.xlsx`;
            periodText = `Annual ${year}`;
        }
        // If no parameters, download all data (already set above)
        
        console.log("📊 Filtered expense download data:", {
            original: allExpenses.length,
            deduplicated: deduplicatedExpenses.length,
            filtered: filteredData.length,
            period: periodText,
            filename
        });
        
        // ENHANCED: Prepare detailed data for Excel (Removed Icon column)
        const data = filteredData.map((item) => {
            const itemDate = new Date(item.date);
            const monthName = itemDate.toLocaleDateString('en-US', { month: 'long' });
            const year = itemDate.getFullYear();
            
            return {
                'Expense Category': item.category,
                'Amount': item.amount,
                'Date': itemDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                'Month': monthName,
                'Year': year,
                'Category Type': categorizeExpenseType(item.category),
                'Created': item.createdAt ? item.createdAt.toLocaleDateString('en-US') : 'N/A',
                'Updated': item.updatedAt ? item.updatedAt.toLocaleDateString('en-US') : 'N/A'
            };
        });

        // Create Excel file with enhanced formatting (updated column widths)
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        
        // ENHANCED: Set professional column widths (removed Icon column)
        ws['!cols'] = [
            { width: 25 }, // Expense Category
            { width: 12 }, // Amount
            { width: 18 }, // Date
            { width: 12 }, // Month
            { width: 8 },  // Year
            { width: 18 }, // Category Type
            { width: 12 }, // Created
            { width: 12 }  // Updated
        ];
        
        xlsx.utils.book_append_sheet(wb, ws, "Expense Details");
        
        // Write file to disk temporarily
        xlsx.writeFile(wb, filename);
        
        res.download(filename, (err) => {
            if (err) {
                console.error("Download error:", err);
            }
            // Clean up the file after download
            require('fs').unlink(filename, (unlinkErr) => {
                if (unlinkErr) console.error("File cleanup error:", unlinkErr);
            });
        });
        
    } catch (error) {
        console.error("Error in downloadExpenseExcel:", error);
        res.status(500).json({ message: "Server Error" });
    }
}