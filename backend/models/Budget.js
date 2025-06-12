const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    period: { 
        type: String, 
        enum: ['monthly', 'annual'], 
        default: 'monthly' 
    },
    // NEW FIELDS: Month-specific tracking
    month: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(0[1-9]|1[0-2])$/.test(v); // 01-12
            },
            message: 'Month must be in MM format (01-12)'
        }
    },
    year: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}$/.test(v); // YYYY
            },
            message: 'Year must be in YYYY format'
        }
    },
    icon: { 
        type: String, 
        default: "" 
    },
    color: { 
        type: String, 
        default: "#875cf5" 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

// UPDATED INDEX: Now includes month and year for true uniqueness
BudgetSchema.index({ 
    userId: 1, 
    category: 1, 
    month: 1, 
    year: 1 
}, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);