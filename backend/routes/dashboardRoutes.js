const express = require("express");
const { protect } = require("../middleware/authMiddleware"); // Fixed: removed quote and space
const { getDashboardData } = require("../controllers/dashboardControllers"); // Fixed: removed space

const router = express.Router();
router.get("/", protect, getDashboardData);
module.exports = router; // Fixed: removed space