// routes/authRoutes.js - Reverted to original structure
const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");

const {
    registerUser, 
    loginUser,
    getUserInfo,
    verifyEmail,        
    resendVerification ,
    deleteAccount 
} = require("../controllers/authControllers");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.delete("/delete-account", protect, deleteAccount);

// Original upload-image route
router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    
    const host = req.get("host");
    const protocol = req.protocol;
    const filename = req.file.filename;
    const finalUrl = protocol + "://" + host + "/uploads/" + filename;
    
    // Return the response in the original format
    return res.status(200).json({ 
        success: true, 
        imageUrl: finalUrl
    });
});

module.exports = router;