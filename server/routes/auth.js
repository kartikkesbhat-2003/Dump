const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { sendotp, signup, login, getCurrentUser } = require("../controllers/auth");
const { auth } = require("../middleware/auth");

// Regular auth routes
router.post("/sendotp", sendotp);
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/me", auth, getCurrentUser);

// Google OAuth routes
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        try {
            // Generate JWT token for the authenticated user
            const token = jwt.sign(
                { userId: req.user._id, email: req.user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            // Set cookie and redirect to frontend
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                httpOnly: true,
            };

            res.cookie("token", token, options);
            
            // Redirect to frontend with success
            const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
            res.redirect(`${frontendURL}/auth/success?token=${token}`);
        } catch (error) {
            console.error("Error in Google OAuth callback:", error);
            const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
            res.redirect(`${frontendURL}/auth/error`);
        }
    }
);

// Logout route
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error logging out"
            });
        }
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    });
});

module.exports = router;