const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    getAllBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetAnalysis,
    downloadBudgetExcel 
} = require("../controllers/budgetController");

router.get("/", protect, getAllBudgets);
router.post("/add", protect, addBudget);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);
router.get("/analysis", protect, getBudgetAnalysis);
router.get("/download", protect, downloadBudgetExcel);

module.exports = router;