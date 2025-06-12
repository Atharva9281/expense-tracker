const xlsx = require("xlsx"); 
const Income = require("../models/Income");

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

// UPDATED addIncome function (add cache clearing)
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, source, amount, date } = req.body;
        
        console.log("Processing income data:", { userId, icon, source, amount, date });
        
        if (!source || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const incomeDate = parseLocalDate(date);
        console.log("📅 Date parsing:", { original: date, parsed: incomeDate });
        
        const existingIncome = await Income.findOne({
            userId,
            source: source.trim(),
            amount: Number(amount),
            date: {
                $gte: new Date(incomeDate.getFullYear(), incomeDate.getMonth(), incomeDate.getDate()),
                $lt: new Date(incomeDate.getFullYear(), incomeDate.getMonth(), incomeDate.getDate() + 1)
            }
        });
        
        if (existingIncome) {
            console.log("🚫 Duplicate income detected, preventing save");
            return res.status(400).json({ 
                message: "Duplicate entry detected. An income with the same source, amount, and date already exists."
            });
        }
    
        const newIncome = new Income({
            userId,
            icon, 
            source: source.trim(),
            amount: Number(amount),
            date: incomeDate
        });

        await newIncome.save();
        
        // ADD THIS LINE - Clear cache when data changes
        clearUserCache(userId);
        
        console.log("✅ New income added successfully (no duplicates)");
        res.status(200).json(newIncome);
    } catch(error) {
        console.error("Error adding income:", error.message, error.stack);
        res.status(500).json({message: "Server Error"});
    }
}

// UPDATED updateIncome function (add cache clearing)
exports.updateIncome = async (req, res) => {
    const userId = req.user.id;
    const incomeId = req.params.id;
    
    try {
        const { icon, source, amount, date } = req.body;
        
        console.log("Updating income:", { incomeId, userId, icon, source, amount, date });
        
        if (!source || !amount) {
            return res.status(400).json({ message: "Source and amount are required" });
        }
        
        const incomeDate = parseLocalDate(date);
        console.log("📅 Update date parsing:", { original: date, parsed: incomeDate });
        
        const updatedIncome = await Income.findOneAndUpdate(
            { _id: incomeId, userId },
            {
                icon,
                source: source.trim(),
                amount: Number(amount),
                date: incomeDate
            },
            { new: true }
        );
        
        if (!updatedIncome) {
            return res.status(404).json({ message: "Income not found or you don't have permission to update it" });
        }
        
        // ADD THIS LINE - Clear cache when data changes
        clearUserCache(userId);
        
        console.log("✅ Income updated successfully");
        res.status(200).json(updatedIncome);
        
    } catch(error) {
        console.error("Error updating income:", error.message, error.stack);
        res.status(500).json({message: "Server Error"});
    }
}

// Keep your getAllIncome function (no changes needed)
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        res.json(income); 
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}

// UPDATED deleteIncome function (add cache clearing)
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        
        // ADD THIS LINE - Clear cache when data changes
        clearUserCache(req.user.id);
        
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

// Keep all your existing helper functions (no changes)
const deduplicateIncomeData = (incomeArray) => {
    if (!incomeArray || !Array.isArray(incomeArray)) return [];
    
    return incomeArray.filter((transaction, index, arr) => {
        return index === arr.findIndex(t => 
            t.source === transaction.source && 
            t.amount === transaction.amount && 
            t.date.getTime() === transaction.date.getTime()
        );
    });
};

const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNum) - 1];
};

const categorizeIncomeSource = (source) => {
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes('salary') || sourceLower.includes('job') || sourceLower.includes('work') || sourceLower.includes('employment')) {
        return 'Employment';
    } else if (sourceLower.includes('freelance') || sourceLower.includes('contract') || sourceLower.includes('gig')) {
        return 'Freelance';
    } else if (sourceLower.includes('business') || sourceLower.includes('profit') || sourceLower.includes('revenue')) {
        return 'Business';
    } else if (sourceLower.includes('investment') || sourceLower.includes('dividend') || sourceLower.includes('stock') || sourceLower.includes('bond')) {
        return 'Investment';
    } else if (sourceLower.includes('rental') || sourceLower.includes('rent') || sourceLower.includes('property')) {
        return 'Rental';
    } else if (sourceLower.includes('gift') || sourceLower.includes('bonus') || sourceLower.includes('award')) {
        return 'Other Income';
    } else {
        return 'General';
    }
};

// ENHANCED: Professional Excel Download (No Summary) - Removed Icon column
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const { month, year, viewMode } = req.query;
        
        console.log("📊 Income download request:", { userId, month, year, viewMode });
        
        // Get all income data first
        const allIncome = await Income.find({ userId }).sort({ date: -1 });
        
        // Apply deduplication
        const deduplicatedIncome = deduplicateIncomeData(allIncome);
        
        let filteredData = deduplicatedIncome;
        let filename = "income_all_data.xlsx";
        let periodText = "All Data";
        
        // Filter based on request parameters
        if (month && year) {
            // Monthly view - filter by specific month/year
            filteredData = deduplicatedIncome.filter(item => {
                const itemDate = new Date(item.date);
                const itemYear = itemDate.getFullYear();
                const itemMonth = itemDate.getMonth() + 1;
                
                return itemYear === parseInt(year) && itemMonth === parseInt(month);
            });
            
            const monthName = getMonthName(month);
            filename = `income_${monthName.toLowerCase()}_${year}.xlsx`;
            periodText = `${monthName} ${year}`;
            
        } else if (year && !month) {
            // Annual view - filter by year only
            filteredData = deduplicatedIncome.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === parseInt(year);
            });
            
            filename = `income_annual_${year}.xlsx`;
            periodText = `Annual ${year}`;
        }
        // If no parameters, download all data (already set above)
        
        console.log("📊 Filtered income download data:", {
            original: allIncome.length,
            deduplicated: deduplicatedIncome.length,
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
                'Income Source': item.source,
                'Amount': item.amount,
                'Date': itemDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                'Month': monthName,
                'Year': year,
                'Category Type': categorizeIncomeSource(item.source),
                'Created': item.createdAt ? item.createdAt.toLocaleDateString('en-US') : 'N/A',
                'Updated': item.updatedAt ? item.updatedAt.toLocaleDateString('en-US') : 'N/A'
            };
        });

        // Create Excel file with enhanced formatting (updated column widths)
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        
        // ENHANCED: Set professional column widths (removed Icon column)
        ws['!cols'] = [
            { width: 25 }, // Income Source
            { width: 12 }, // Amount
            { width: 18 }, // Date
            { width: 12 }, // Month
            { width: 8 },  // Year
            { width: 15 }, // Category Type
            { width: 12 }, // Created
            { width: 12 }  // Updated
        ];
        
        xlsx.utils.book_append_sheet(wb, ws, "Income Details");
        
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
        console.error("Error in downloadIncomeExcel:", error);
        res.status(500).json({ message: "Server Error" });
    }
}