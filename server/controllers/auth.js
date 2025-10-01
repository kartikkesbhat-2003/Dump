const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
require("dotenv").config();

// send otp controller

exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;

        if(!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

		// Check if user is already present
		const checkUserPresent = await User.findOne({ email });

		// If user found with provided email
		if (checkUserPresent) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
		}

		var otp = Math.floor(1000 + Math.random() * 9000); // Generate 4 digit OTP
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);

		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json(
            { 
                success: false, 
                error: error.message,
                message: "Error in sending OTP"
            }
        );
	}
};

// Signup Controller for Registering Users

exports.signup = async (req, res) => {
    try {
        const { email, password, confirmPassword, otp } = req.body;

        if(!email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email, Password, Confirm Password and OTP are required"
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match"
            });
        }

        // Verify OTP
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
}

// Login Controller for Authenticating Users
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            })
        }

        // Check if user is present
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        user.token = token;
		user.password = undefined;

        const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in user",
            error: error.message
        });
    }
};


// Google OAuth Controller - handles user creation/login via Google
exports.googleOAuthHandler = async (profile) => {
    try {
        const { id: googleId, emails } = profile;
        const email = emails[0].value;

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId });
        
        if (user) {
            // User exists, return the user
            return user;
        }

        // Check if user exists with this email (regular signup)
        user = await User.findOne({ email });
        
        if (user) {
            // User exists with email, link Google account
            user.googleId = googleId;
            await user.save();
            return user;
        }

        // Create new user with Google account
        user = new User({
            email,
            googleId,
            password: "google_oauth", // Placeholder password for Google users
        });

        await user.save();
        return user;
    } catch (error) {
        console.error("Error in Google OAuth handler:", error);
        throw error;
    }
};

// Get current user (for protected routes)
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error getting current user:", error);
        res.status(500).json({
            success: false,
            message: "Error getting user data",
            error: error.message
        });
    }
};

