// Import the Mongoose library
const mongoose = require("mongoose");

// Define the comment schema using the Mongoose Schema constructor
const commentSchema = new mongoose.Schema(
	{
		user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        isAnonymous: {
            type: Boolean,
            default: false
        }
		,
		// mentions persisted at creation/update time: list of { handle, user }
		mentions: [
			{
				handle: { type: String, trim: true, lowercase: true },
				user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
			}
		]
	},
	{ timestamps: true }
);

// Export the Mongoose model for the comment schema, using the name "Comment"
module.exports = mongoose.model("Comment", commentSchema);