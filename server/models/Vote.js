// Import the Mongoose library
const mongoose = require("mongoose");

// Define the vote schema using the Mongoose Schema constructor
const voteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
        voteType: {
            type: String,
            enum: ["upvote", "downvote"],
            required: true
        }
    },
    { timestamps: true }
);

// Export the Mongoose model for the vote schema, using the name "Vote"
module.exports = mongoose.model("Vote", voteSchema);