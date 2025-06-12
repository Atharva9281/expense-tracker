const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true }, 
        email: { type: String, required: true, unique: true }, 
        password: { type: String, required: true }, 
        profileImageUrl: { type: String, default: null },
        
        // EMAIL VERIFICATION FIELDS
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String, default: null },
        verificationExpires: { type: Date, default: null },
        
        // 24-HOUR TRIAL ACCESS FIELDS
        hasTrialAccess: { type: Boolean, default: false },
        trialExpiresAt: { type: Date, default: null },
    },
    {timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
    // Only run if password is modified
    if (!this.isModified("password")) {
        return next();
    }
    
    try {
        // Hash the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Use bcrypt to compare passwords
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        console.error("Password comparison error:", error);
        return false;
    }
};

module.exports = mongoose.model("User", UserSchema);