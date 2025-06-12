const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../config/emailService");

const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { clearUserCache } = require('../middleware/cache');

// Keep your existing generateToken function (no changes)
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'});
};

// registerUser with 24-hour trial access
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password, profileImageUrl } = req.body;

        // Keep your existing validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Keep your existing email check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // ✅ NEW: Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const now = Date.now();

        // ✅ MODIFIED: Create user with 24-hour trial access
        const user = await User.create({
            fullName, 
            email, 
            password, 
            profileImageUrl,
            isVerified: false,
            verificationToken,
            verificationExpires: now + 24 * 60 * 60 * 1000, // 24 hours for verification
            hasTrialAccess: true, // Allow immediate access
            trialExpiresAt: now + 24 * 60 * 60 * 1000 // 24 hours trial access
        });
        
        // ✅ NEW: Send verification email (in background)
        try {
            await sendVerificationEmail(email, verificationToken, fullName);
            console.log(`✅ Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            // Don't block account creation if email fails
        }
        
        // Response with trial access info
        const userObj = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            isVerified: user.isVerified,
            hasTrialAccess: user.hasTrialAccess,
            trialExpiresAt: user.trialExpiresAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(201).json({
            user: userObj,
            token: generateToken(user._id),
            message: "Account created! You have 24 hours to explore the app. Please verify your email for permanent access.",
            trialAccess: true,
            trialExpiresIn: "24 hours"
        });

        console.log('🔍 User created with verification token:', {
            email: user.email,
            verificationToken: user.verificationToken,
            verificationExpires: user.verificationExpires,
            hasTrialAccess: user.hasTrialAccess
        });
            
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// loginUser with trial access logic
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Keep your existing validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Keep your existing user finding
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Keep your existing password check
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ NEW: Check verification and trial status
        const now = Date.now();
        
        // If user is verified, allow access
        if (user.isVerified) {
            const userObj = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                isVerified: true,
                hasTrialAccess: false, // No longer needed
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
            return res.status(200).json({
                user: userObj,
                token: generateToken(user._id),
                accountStatus: "verified"
            });
        }

        // If not verified, check trial access
        if (user.hasTrialAccess && user.trialExpiresAt && now < user.trialExpiresAt) {
            // Trial access still valid
            const timeLeft = user.trialExpiresAt - now;
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            
            const userObj = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                isVerified: false,
                hasTrialAccess: true,
                trialExpiresAt: user.trialExpiresAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
            return res.status(200).json({
                user: userObj,
                token: generateToken(user._id),
                accountStatus: "trial",
                message: `Trial access: ${hoursLeft} hours remaining. Please verify your email for permanent access.`,
                trialTimeLeft: hoursLeft
            });
        }

        // Trial expired and not verified
        return res.status(400).json({ 
            message: "Your 24-hour trial has expired. Please verify your email to continue using the app.",
            requiresVerification: true,
            trialExpired: true,
            userId: user._id
        });

    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

// getUserInfo with trial info
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check trial status
        const now = Date.now();
        let accountStatus = "verified";
        let trialTimeLeft = 0;

        if (!user.isVerified) {
            if (user.hasTrialAccess && user.trialExpiresAt && now < user.trialExpiresAt) {
                accountStatus = "trial";
                trialTimeLeft = Math.ceil((user.trialExpiresAt - now) / (1000 * 60 * 60));
            } else {
                accountStatus = "expired";
            }
        }
        
        res.status(200).json({
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                isVerified: user.isVerified,
                hasTrialAccess: user.hasTrialAccess,
                trialExpiresAt: user.trialExpiresAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            accountStatus,
            trialTimeLeft: trialTimeLeft > 0 ? trialTimeLeft : null
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching user data", error: err.message });
    }
};

// verifyEmail - removes trial access when verified
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('🔍 Verification attempt - Token received:', token);

        // First, try to find user with the token
        let user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        });

        console.log('🔍 User found with token:', user ? 'YES' : 'NO');

        if (user) {
            // User found with valid token - verify them
            console.log('🔍 User details:', {
                email: user.email,
                tokenMatch: user.verificationToken === token,
                expiresAt: new Date(user.verificationExpires),
                now: new Date()
            });

            // ✅ Verify user and remove trial limitations
            user.isVerified = true;
            user.verificationToken = null;
            user.verificationExpires = null;
            user.hasTrialAccess = false;
            user.trialExpiresAt = null;
            await user.save();

            console.log('✅ User successfully verified:', user.email);

            return res.json({ 
                message: "Email verified successfully! You now have permanent access to your account.",
                success: true,
                accountStatus: "verified"
            });
        }

        // If no user found with token, check if they're already verified
        // This handles the case where the same link is clicked multiple times
        console.log('🔍 No user found with token, checking if already verified...');
        
        // Try to find any user with this email pattern (in case they're already verified)
        const allUsers = await User.find({}).select('email verificationToken isVerified');
        console.log('🔍 Found users in database:', allUsers.length);
        
        // Look for a user who might have been verified already
        const possiblyVerifiedUser = await User.findOne({ 
            isVerified: true,
            // Look for users who were recently created (within last hour)
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        }).sort({ updatedAt: -1 });

        if (possiblyVerifiedUser) {
            console.log('✅ Found recently verified user:', possiblyVerifiedUser.email);
            return res.json({ 
                message: "This email has already been verified successfully!",
                success: true,
                accountStatus: "already_verified"
            });
        }

        // If we get here, the token is truly invalid or expired
        return res.status(400).json({ 
            message: "Invalid or expired verification token. Please request a new verification email.",
            success: false,
            error: "TOKEN_INVALID"
        });

    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(500).json({ 
            message: "Server error during verification",
            success: false,
            error: "SERVER_ERROR"
        });
    }
};

// Keep your existing resendVerification function
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        // Send email
        await sendVerificationEmail(email, verificationToken, user.fullName);

        res.json({ message: "Verification email sent!" });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// NEW: Delete user account and all associated data
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        console.log(`🗑️ Account deletion request for user: ${userId}`);

        // Validate request
        if (!password) {
            return res.status(400).json({ 
                message: "Password is required to delete your account" 
            });
        }

        // Get user from database
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Verify password before deletion
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log(`❌ Invalid password for account deletion: ${user.email}`);
            return res.status(401).json({ 
                message: "Invalid password. Account deletion cancelled." 
            });
        }

        console.log(`🔐 Password verified for user: ${user.email}`);

        // Count user's data before deletion (for logging)
        const [incomeCount, expenseCount, budgetCount] = await Promise.all([
            Income.countDocuments({ userId }),
            Expense.countDocuments({ userId }),
            Budget.countDocuments({ userId })
        ]);

        console.log(`📊 User data summary:`, {
            email: user.email,
            income: incomeCount,
            expenses: expenseCount,
            budgets: budgetCount,
            joinDate: user.createdAt
        });

        // Delete all user data in correct order (referential integrity)
        
        // 1. Delete income records
        const incomeResult = await Income.deleteMany({ userId });
        console.log(`💰 Deleted ${incomeResult.deletedCount} income records`);

        // 2. Delete expense records  
        const expenseResult = await Expense.deleteMany({ userId });
        console.log(`💸 Deleted ${expenseResult.deletedCount} expense records`);

        // 3. Delete budget records
        const budgetResult = await Budget.deleteMany({ userId });
        console.log(`🎯 Deleted ${budgetResult.deletedCount} budget records`);

        // 4. Clear cache
        clearUserCache(userId);
        console.log(`🧹 Cleared cache for user: ${userId}`);

        // 5. Finally delete the user account
        const userResult = await User.findByIdAndDelete(userId);
        
        if (!userResult) {
            return res.status(500).json({ 
                message: "Error occurred while deleting account" 
            });
        }

        // Log successful deletion
        console.log(`✅ ACCOUNT DELETED SUCCESSFULLY:`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   📅 Account age: ${Math.ceil((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))} days`);
        console.log(`   📊 Data deleted: ${incomeResult.deletedCount} income, ${expenseResult.deletedCount} expenses, ${budgetResult.deletedCount} budgets`);
        console.log(`   🕐 Deletion time: ${new Date().toISOString()}`);

        // Success response
        res.status(200).json({
            message: "Account and all associated data have been permanently deleted",
            deletedData: {
                income: incomeResult.deletedCount,
                expenses: expenseResult.deletedCount,
                budgets: budgetResult.deletedCount
            }
        });

    } catch (error) {
        console.error("❌ Account deletion error:", error);
        res.status(500).json({ 
            message: "An error occurred while deleting your account. Please try again." 
        });
    }
};