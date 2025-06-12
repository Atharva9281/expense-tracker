// models/Expense.js - Fixed version
const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String },
    category: { type: String, required: true }, // Changed from source to category
    amount: { type: Number, required: true }, // Fixed: This was part of a comment
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Expense", ExpenseSchema);