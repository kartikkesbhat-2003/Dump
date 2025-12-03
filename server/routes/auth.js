const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { sendotp, signup, login, getCurrentUser, checkUsername } = require("../controllers/auth");
const { auth } = require("../middleware/auth");
const { setUsername } = require("../controllers/auth");

// Regular auth routes
router.post("/sendotp", sendotp);
router.post("/signup", signup);
// Check username availability while typing (client-side)
router.get("/check-username", checkUsername);
router.post("/set-username", auth, setUsername);
router.post("/login", login);

// Protected routes
router.get("/me", auth, getCurrentUser);

// Google OAuth routes
router.get("/google", (req, res, next) => {
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
    // Google OAuth callback

    // Use custom callback to capture errors during the token exchange
    passport.authenticate('google', { failureRedirect: '/login' }, async (err, user, info) => {
        // Determine frontend URL for redirects
        let frontendURL = (process.env.FRONTEND_URL || "http://localhost:3000").toString();
        frontendURL = frontendURL.replace(/\/+$/g, '');

        // Callback processing complete

        if (err) {
            console.error('❌ Passport authenticate error on callback:', err);
            const reason = encodeURIComponent(err.message || 'oauth_error');
            return res.redirect(`${frontendURL}/auth/error?reason=${reason}`);
        }

        if (!user) {
            console.error('❌ Passport did not return a user. Info:', info);
            const reason = encodeURIComponent(info && info.message ? info.message : 'no_user');
            return res.redirect(`${frontendURL}/auth/error?reason=${reason}`);
        }

        // User received from Passport (not logged here for privacy)

        // Log the user in
        try {
            req.logIn(user, async (loginErr) => {
                if (loginErr) {
                    console.error('❌ req.logIn error:', loginErr);
                    const reason = encodeURIComponent(loginErr.message || 'login_error');
                    return res.redirect(`${frontendURL}/auth/error?reason=${reason}`);
                }

                // User logged in to session

                try {
                    // Check if JWT_SECRET is set
                    if (!process.env.JWT_SECRET) {
                        console.error('❌ JWT_SECRET is not set in environment variables!');
                        return res.redirect(`${frontendURL}/auth/error?reason=jwt_secret_missing`);
                    }

                    // Generate JWT token for the authenticated user
                    const token = jwt.sign(
                        { userId: user._id, email: user.email },
                        process.env.JWT_SECRET,
                        { expiresIn: "24h" }
                    );

                    const options = {
                        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                        httpOnly: true,
                    };
                    res.cookie("token", token, options);

                    // JWT token generated and cookie set (not logging token contents)

                    return res.redirect(`${frontendURL}/auth/success#token=${encodeURIComponent(token)}`);
                } catch (error) {
                    console.error('❌ Error generating JWT after successful OAuth:', error);
                    const reason = encodeURIComponent(error.message || 'jwt_error');
                    return res.redirect(`${frontendURL}/auth/error?reason=${reason}`);
                }
            });
        } catch (outerErr) {
            console.error('❌ Unexpected error during callback handling:', outerErr);
            const reason = encodeURIComponent(outerErr.message || 'unexpected_error');
            return res.redirect(`${frontendURL}/auth/error?reason=${reason}`);
        }
    })(req, res, next);
});

module.exports = router;