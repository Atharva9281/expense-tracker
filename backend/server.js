require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db"); // Fixed path to db.js
const authRoutes = require("./routes/authRoutes"); 
const incomeRoutes = require("./routes/incomeRoutes"); 
const expenseRoutes = require("./routes/expenseRoutes"); 
const dashboardRoutes = require("./routes/dashboardRoutes"); 
const budgetRoutes = require("./routes/budgetRoutes");

const { startCleanupJobs } = require('./Jobs/cleanupJobs');

const app = express();

// Middleware to handle CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"], 
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

connectDB();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/income', incomeRoutes)

//server uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/expense', expenseRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/budget', budgetRoutes);

startCleanupJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add this anywhere after your app initialization
app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'expense-tracker-backend',
      version: '1.0.0'
    });
  });