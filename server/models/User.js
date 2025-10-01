// Import the Mongoose library
const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema(
	{
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true // Allows multiple null values
        },
        isAnonymous: {
            type: Boolean,
            default: false
        }
	},
	{ timestamps: true }
);

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("User", userSchema);