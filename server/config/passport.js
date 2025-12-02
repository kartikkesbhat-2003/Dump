const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { googleOAuthHandler } = require("../controllers/auth");

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('GOOGLE OAUTH ERROR: Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('   Please check your .env file and ensure all Google OAuth variables are set.');
    console.error('   See .env.example for reference.');
} else {
    // Google OAuth configured (status not logged to avoid leaking config values)
}

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Google OAuth callback received; handling authentication
                const user = await googleOAuthHandler(profile);
                return done(null, user);
            } catch (error) {
                console.error("❌ Error in Google Strategy:", error);
                return done(error, null);
            }
        }
    )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const User = require("../models/User");
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
