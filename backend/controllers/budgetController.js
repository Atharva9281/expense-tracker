const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const xlsx = require("xlsx");

// Helper functions
const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNum) - 1];
};

const validateBudgetData = (category, amount, month, year) => {
    if (!category || !amount || !month || !year) {
        return { isValid: false, message: "Category, amount, month, and year are required" };
    }
    if (amount <= 0) {
        return { isValid: false, message: "Amount must be greater than 0" };
    }
    return { isValid: true };
};

const createBudgetData = (userId, { category, amount, period, month, year, icon, color }) => ({
    userId,
    category: category.trim(),
    amount: Number(amount),
    period: period || 'monthly',
    month,
    year,
    icon: icon || '',
    color: color || '#875cf5'
});

// Get All Budgets
exports.getAllBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Add Budget
exports.addBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, amount, period, month, year, icon, color, copyToFutureMonths } = req.body;

        // Validate
        const validation = validateBudgetData(category, amount, month, year);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        // Check duplicate
        const existingBudget = await Budget.findOne({
            userId, category: category.trim(), month, year, isActive: true
        });
        
        if (existingBudget) {
            return res.status(400).json({ 
                message: `Budget for ${category} in ${getMonthName(month)} ${year} already exists.` 
            });
        }

        // Create budget
        const budgetData = createBudgetData(userId, { category, amount, period, month, year, icon, color });
        const newBudget = new Budget(budgetData);
        await newBudget.save();

        // Copy to future months if requested
        let copiedCount = 0;
        if (copyToFutureMonths && period === 'monthly') {
            const budgetsToCreate = [];
            for (let m = parseInt(month) + 1; m <= 12; m++) {
                const monthStr = String(m).padStart(2, '0');
                const exists = await Budget.findOne({
                    userId, category: category.trim(), month: monthStr, year, isActive: true
                });
                
                if (!exists) {
                    budgetsToCreate.push(createBudgetData(userId, { category, amount, period: 'monthly', month: monthStr, year, icon, color }));
                }
            }
            
            if (budgetsToCreate.length > 0) {
                await Budget.insertMany(budgetsToCreate);
                copiedCount = budgetsToCreate.length;
            }
        }

        res.status(201).json({
            budget: newBudget,
            message: `Budget created successfully${copiedCount > 0 ? ` and copied to ${copiedCount} future months` : ''}`
        });

    } catch (error) {
        console.error("Error in addBudget:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update Budget
exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, period, icon, color } = req.body;

        const budget = await Budget.findOne({ _id: id, userId: req.user.id });
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        // Update fields
        if (category) budget.category = category.trim();
        if (amount) budget.amount = Number(amount);
        if (period) budget.period = period;
        if (icon !== undefined) budget.icon = icon;
        if (color) budget.color = color;

        await budget.save();
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Delete Budget
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }
        res.json({ message: "Budget deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Budget Analysis
exports.getBudgetAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year, viewMode } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        let budgets, expenses, analysis, totalBudget, totalSpent;

        if (viewMode === 'annual') {
            // Annual view
            budgets = await Budget.find({ userId, year: selectedYear.toString(), isActive: true });
            const startOfYear = new Date(selectedYear, 0, 1);
            const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
            expenses = await Expense.find({ userId, date: { $gte: startOfYear, $lte: endOfYear } });
            
            const spendingByCategory = expenses.reduce((acc, expense) => {
                acc[expense.category || 'Other'] = (acc[expense.category || 'Other'] || 0) + expense.amount;
                return acc;
            }, {});

            // Group budgets by category for annual totals
            const budgetsByCategory = budgets.reduce((acc, budget) => {
                if (!acc[budget.category]) {
                    acc[budget.category] = { budgets: [], totalAmount: 0, color: budget.color, icon: budget.icon };
                }
                acc[budget.category].budgets.push(budget);
                acc[budget.category].totalAmount += budget.amount;
                return acc;
            }, {});

            analysis = Object.keys(budgetsByCategory).map(category => {
                const categoryData = budgetsByCategory[category];
                const annualBudget = categoryData.totalAmount;
                const spent = spendingByCategory[category] || 0;
                const percentage = annualBudget > 0 ? (spent / annualBudget) * 100 : 0;

                return {
                    _id: category + '_annual',
                    category,
                    amount: annualBudget,
                    spent,
                    percentage,
                    remaining: annualBudget - spent,
                    isOverBudget: spent > annualBudget,
                    status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good',
                    monthlyAmount: Math.round(annualBudget / 12),
                    color: categoryData.color,
                    icon: categoryData.icon,
                    period: 'annual'
                };
            });

            totalBudget = Object.values(budgetsByCategory).reduce((sum, cat) => sum + cat.totalAmount, 0);
            totalSpent = analysis.reduce((sum, budget) => sum + budget.spent, 0);
        } else {
            // Monthly view
            const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
            const monthStr = String(selectedMonth).padStart(2, '0');
            
            budgets = await Budget.find({ userId, month: monthStr, year: selectedYear.toString(), isActive: true });
            const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
            const endOfMonth = new Date(selectedYear, selectedMonth, 0);
            expenses = await Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } });

            const spendingByCategory = expenses.reduce((acc, expense) => {
                acc[expense.category || 'Other'] = (acc[expense.category || 'Other'] || 0) + expense.amount;
                return acc;
            }, {});

            analysis = budgets.map(budget => {
                const spent = spendingByCategory[budget.category] || 0;
                const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                
                return {
                    ...budget.toObject(),
                    spent,
                    percentage,
                    remaining: budget.amount - spent,
                    isOverBudget: spent > budget.amount,
                    status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
                };
            });

            totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
            totalSpent = analysis.reduce((sum, budget) => sum + budget.spent, 0);
        }

        res.json({
            budgets: analysis,
            totalBudget,
            totalSpent,
            viewMode: viewMode || 'monthly'
        });

    } catch (error) {
        console.error("Error in budget analysis:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Download Excel
exports.downloadBudgetExcel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const allBudgets = await Budget.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
        
        // Filter data
        let filteredData = allBudgets;
        let filename = "budget_all_data.xlsx";
        
        if (month && year) {
            filteredData = allBudgets.filter(budget => budget.month === month && budget.year === year);
            filename = `budget_${getMonthName(month).toLowerCase()}_${year}.xlsx`;
        } else if (year) {
            filteredData = allBudgets.filter(budget => budget.year === year);
            filename = `budget_annual_${year}.xlsx`;
        }

        // Prepare Excel data (removed Color and Icon columns)
        const data = filteredData.map(budget => ({
            'Budget Category': budget.category,
            'Amount': budget.amount,
            'Period': budget.period,
            'Month': budget.month ? getMonthName(budget.month) : 'N/A',
            'Year': budget.year || 'N/A',
            'Created': budget.createdAt ? budget.createdAt.toLocaleDateString('en-US') : 'N/A',
            'Updated': budget.updatedAt ? budget.updatedAt.toLocaleDateString('en-US') : 'N/A'
        }));

        // Create Excel (updated column widths for fewer columns)
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        ws['!cols'] = [
            { width: 25 }, // Budget Category
            { width: 12 }, // Amount
            { width: 10 }, // Period
            { width: 12 }, // Month
            { width: 8 },  // Year
            { width: 12 }, // Created
            { width: 12 }  // Updated
        ];
        xlsx.utils.book_append_sheet(wb, ws, "Budget Details");
        xlsx.writeFile(wb, filename);

        res.download(filename, (err) => {
            if (err) console.error("Download error:", err);
            require('fs').unlink(filename, (unlinkErr) => {
                if (unlinkErr) console.error("File cleanup error:", unlinkErr);
            });
        });

    } catch (error) {
        console.error("Error in downloadBudgetExcel:", error);
        res.status(500).json({ message: "Server Error" });
    }
};