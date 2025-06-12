const express = require("express");
const router = express.Router();

const {
    addExpense, 
    getAllExpense, 
    updateExpense,  // Added this import
    deleteExpense,
    downloadExpenseExcel 
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");

// Add a simple test route that doesn't use any middleware
router.get('/simple-test', (req, res) => {
    res.json({ message: 'Simple test route works!' });
});

// Test route that doesn't require authentication
router.get('/test', (req, res) => {
    res.json({ message: 'Expense routes test successful' });
});

// Regular routes
router.post("/add", protect, addExpense); 
router.get("/get", protect, getAllExpense); 
router.put("/:id", protect, updateExpense); // Added this update route
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

module.exports = router;