const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../config/emailService");
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { clearUserCache } = require('../middleware/cache');

// Helper functions
const generateToken = (id) => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'});

const createUserResponse = (user, includeTrialInfo = false) => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    isVerified: user.isVerified,
    ...(includeTrialInfo && {
        hasTrialAccess: user.hasTrialAccess,
        trialExpiresAt: user.trialExpiresAt
    }),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

// Register user with 24-hour trial
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, profileImageUrl } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Create user with trial access
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresIn = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        const user = await User.create({
            fullName, 
            email, 
            password, 
            profileImageUrl,
            isVerified: false,
            verificationToken,
            verificationExpires: expiresIn,
            hasTrialAccess: true,
            trialExpiresAt: expiresIn
        });
        
        // Send verification email (don't block registration)
        sendVerificationEmail(email, verificationToken)
            .then(result => {
                console.log('✅ Verification email sent to', email);
            })
            .catch(error => {
                console.error('❌ Email sending failed:', error.message);
                // Email failure is logged but doesn't block registration
            });
        
        res.status(201).json({
            user: createUserResponse(user, true),
            token: generateToken(user._id),
            message: "Account created! You have 24 hours to explore the app. Please verify your email for permanent access.",
            trialAccess: true,
            trialExpiresIn: "24 hours"
        });

        console.log('🔍 User created:', { email, verificationToken, hasTrialAccess: true });
            
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// Login with trial access check
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const now = Date.now();
        
        // Verified user - full access
        if (user.isVerified) {
            return res.status(200).json({
                user: createUserResponse(user),
                token: generateToken(user._id),
                accountStatus: "verified"
            });
        }

        // Trial user - check if still valid
        if (user.hasTrialAccess && user.trialExpiresAt && now < user.trialExpiresAt) {
            const hoursLeft = Math.ceil((user.trialExpiresAt - now) / (1000 * 60 * 60));
            
            return res.status(200).json({
                user: createUserResponse(user, true),
                token: generateToken(user._id),
                accountStatus: "trial",
                message: `Trial access: ${hoursLeft} hours remaining. Please verify your email for permanent access.`,
                trialTimeLeft: hoursLeft
            });
        }

        // Trial expired
        return res.status(400).json({ 
            message: "Your 24-hour trial has expired. Please verify your email to continue.",
            requiresVerification: true,
            trialExpired: true,
            userId: user._id
        });

    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

// Get user info with trial status
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const now = Date.now();
        let accountStatus = "verified";
        let trialTimeLeft = null;

        if (!user.isVerified) {
            if (user.hasTrialAccess && user.trialExpiresAt && now < user.trialExpiresAt) {
                accountStatus = "trial";
                trialTimeLeft = Math.ceil((user.trialExpiresAt - now) / (1000 * 60 * 60));
            } else {
                accountStatus = "expired";
            }
        }
        
        res.status(200).json({
            user: createUserResponse(user, !user.isVerified),
            accountStatus,
            trialTimeLeft
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching user data", error: err.message });
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('🔍 Verification attempt with token:', token);

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            // Check if already verified
            const recentlyVerified = await User.findOne({ 
                isVerified: true,
                createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
            }).sort({ updatedAt: -1 });

            if (recentlyVerified) {
                return res.json({ 
                    message: "This email has already been verified!",
                    success: true,
                    accountStatus: "already_verified"
                });
            }

            return res.status(400).json({ 
                message: "Invalid or expired verification token.",
                success: false,
                error: "TOKEN_INVALID"
            });
        }

        // Verify user
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;
        user.hasTrialAccess = false;
        user.trialExpiresAt = null;
        await user.save();

        console.log('✅ User verified:', user.email);

        res.json({ 
            message: "Email verified successfully! You now have permanent access.",
            success: true,
            accountStatus: "verified"
        });

    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({ 
            message: "Server error during verification",
            success: false,
            error: "SERVER_ERROR"
        });
    }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

        // Generate new token
        user.verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        // Send email
        await sendVerificationEmail(email, user.verificationToken);
        res.json({ message: "Verification email sent!" });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password required to delete account" });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid password" });
        }

        console.log(`🗑️ Deleting account: ${user.email}`);

        // Delete all user data
        const [income, expense, budget] = await Promise.all([
            Income.deleteMany({ userId }),
            Expense.deleteMany({ userId }),
            Budget.deleteMany({ userId })
        ]);

        clearUserCache(userId);
        await User.findByIdAndDelete(userId);

        console.log(`✅ Account deleted: ${user.email} (${income.deletedCount} income, ${expense.deletedCount} expenses, ${budget.deletedCount} budgets)`);

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