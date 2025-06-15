const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const { sendVerificationEmail } = require("../config/emailService"); // REMOVED - no longer needed
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { clearUserCache } = require('../middleware/cache');

// Helper functions
const generateToken = (id) => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '7d'}); // Extended to 7 days

const createUserResponse = (user, includeTrialInfo = false) => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    isVerified: true, // ✅ Always true now - no email verification needed
    ...(includeTrialInfo && {
        hasTrialAccess: user.hasTrialAccess,
        trialExpiresAt: user.trialExpiresAt
    }),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

// Register user with immediate full access (no email verification)
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, profileImageUrl } = req.body;

        console.log('📝 Registration attempt:', { fullName, email });

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Create user with immediate verification and extended trial
        const user = await User.create({
            fullName, 
            email, 
            password, 
            profileImageUrl,
            isVerified: true,              // ✅ Immediately verified
            verificationToken: undefined,   // No token needed
            verificationExpires: undefined, // No expiration needed
            hasTrialAccess: true,          // Full access
            trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
        });
        
        console.log('✅ User registered successfully:', {
            email: user.email,
            fullName: user.fullName,
            isVerified: user.isVerified,
            hasTrialAccess: user.hasTrialAccess
        });
        
        res.status(201).json({
            user: createUserResponse(user, true),
            token: generateToken(user._id),
            message: "Account created successfully! Welcome to Expense Tracker!",
            accountStatus: "verified",
            trialAccess: true,
            trialExpiresIn: "30 days"
        });

        console.log('🔍 User created:', { 
            email, 
            isVerified: true, 
            hasTrialAccess: true,
            trialDays: 30
        });
            
    } catch (err) {
        console.error('❌ Registration error:', err);
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// Login with simplified access (no email verification checks)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 Login attempt:', { email });

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('✅ Login successful:', { email: user.email, fullName: user.fullName });

        // All users have full access now
        res.status(200).json({
            user: createUserResponse(user, true),
            token: generateToken(user._id),
            accountStatus: "verified",
            message: "Login successful! Welcome back!"
        });

    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

// Get user info (simplified - no trial status checks)
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // All users are verified and have full access
        res.status(200).json({
            user: createUserResponse(user, true),
            accountStatus: "verified",
            trialTimeLeft: null // No trial limitations
        });
    } catch (err) {
        console.error('❌ User info fetch error:', err);
        res.status(500).json({ message: "Error fetching user data", error: err.message });
    }
};

// Verify email (kept for backward compatibility, but always succeeds)
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('🔍 Email verification attempt (legacy):', token);

        // For backward compatibility, always return success
        // This handles any old verification links that might still be clicked
        res.json({ 
            message: "Email verification is no longer required! Your account is already active.",
            success: true,
            accountStatus: "verified"
        });

        console.log('✅ Legacy verification handled successfully');

    } catch (error) {
        console.error('❌ Legacy verification error:', error);
        res.status(500).json({ 
            message: "Server error during verification",
            success: false,
            error: "SERVER_ERROR"
        });
    }
};

// Resend verification email (no longer needed, returns success message)
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('📧 Resend verification request (no longer needed):', email);
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Always return success since verification is not needed
        res.json({ 
            message: "Email verification is no longer required! Your account is already active and ready to use.",
            success: true,
            accountStatus: "verified"
        });

    } catch (error) {
        console.error('❌ Resend verification error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete account (unchanged - your existing logic)
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        console.log('🗑️ Account deletion request for user:', userId);

        if (!password) {
            return res.status(400).json({ message: "Password required to delete account" });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid password" });
        }

        console.log('🔐 Password verified for user:', user.email);

        // Get user data summary before deletion
        const [incomeCount, expenseCount, budgetCount] = await Promise.all([
            Income.countDocuments({ userId }),
            Expense.countDocuments({ userId }),
            Budget.countDocuments({ userId })
        ]);

        console.log('📊 User data summary:', {
            email: user.email,
            income: incomeCount,
            expenses: expenseCount,
            budgets: budgetCount,
            joinDate: user.createdAt
        });

        console.log(`🗑️ Deleting account: ${user.email}`);

        // Delete all user data
        const [income, expense, budget] = await Promise.all([
            Income.deleteMany({ userId }),
            Expense.deleteMany({ userId }),
            Budget.deleteMany({ userId })
        ]);

        console.log('💰 Deleted', income.deletedCount, 'income records');
        console.log('💸 Deleted', expense.deletedCount, 'expense records');
        console.log('🎯 Deleted', budget.deletedCount, 'budget records');

        // Clear user cache
        clearUserCache(userId);
        console.log('🧹 Cleared cache for user:', userId);

        // Delete the user account
        await User.findByIdAndDelete(userId);

        console.log('✅ ACCOUNT DELETED SUCCESSFULLY:');
        console.log(' 📧 Email:', user.email);
        console.log(' 📅 Account age:', Math.ceil((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), 'days');
        console.log(' 📊 Data deleted:', incomeCount, 'income,', expenseCount, 'expenses,', budgetCount, 'budgets');
        console.log(' 🕐 Deletion time:', new Date().toISOString());

        res.status(200).json({
            message: "Account permanently deleted",
            deletedData: {
                income: income.deletedCount,
                expenses: expense.deletedCount,
                budgets: budget.deletedCount
            }
        });

    } catch (error) {
        console.error("❌ Account deletion error:", error);
        res.status(500).json({ message: "Error deleting account" });
    }
};