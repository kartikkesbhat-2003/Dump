// Import the Mongoose library
const mongoose = require("mongoose");

// Define the post schema using the Mongoose Schema constructor
const postSchema = new mongoose.Schema(
	{
		user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            trim: true
        },
        isAnonymous: {
            type: Boolean,
            default: false
        }
	},
	{ timestamps: true }
);

// Export the Mongoose model for the post schema, using the name "Post"
module.exports = mongoose.model("Post", postSchema);