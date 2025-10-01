const express = require('express');
const router = express.Router();
const {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
    voteComment
} = require("../controllers/comments");
const { auth, optionalAuth } = require("../middleware/auth");

// Public routes (with optional auth for user vote data)
router.get("/post/:postId", optionalAuth, getPostComments);        // GET /comments/post/:postId - Get comments for a post

// Protected routes (require authentication)
router.post("/", auth, createComment);               // POST /comments - Create new comment
router.put("/:id", auth, updateComment);             // PUT /comments/:id - Update comment
router.delete("/:id", auth, deleteComment);          // DELETE /comments/:id - Delete comment
router.post("/:id/vote", auth, voteComment);         // POST /comments/:id/vote - Vote on comment

module.exports = router;