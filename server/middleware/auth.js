const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Required authentication
exports.auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "") || 
                     req.cookies?.token || 
                     req.body?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "") || 
                     req.cookies?.token || 
                     req.body?.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }

        next(); // Always continue, with or without user
    } catch (error) {
        // If token is invalid, continue without user
        next();
    }
};

// Middleware to check if user is authenticated via session (for OAuth)
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: "Not authenticated"
    });
};