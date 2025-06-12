
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

// ADD THESE IMPORTS
const { cacheMiddleware } = require('../middleware/cache');
const { getOptimizedDashboardData } = require('../utils/queryOptimizer');

// REPLACE your existing getDashboardData with this optimized version
exports.getDashboardData = [
  cacheMiddleware(300), // Cache for 5 minutes
  async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Use optimized query instead of multiple separate queries
        const dashboardData = await getOptimizedDashboardData(userId);
        
        res.json(dashboardData);
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: "Server Error", error });
    }
  }
];