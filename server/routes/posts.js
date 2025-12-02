const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getUserPosts,
    getPostsByUserId,
    votePost
} = require("../controllers/posts");
const { auth, optionalAuth } = require("../middleware/auth");

// Public routes with optional authentication to get user vote data
router.get("/", optionalAuth, getAllPosts);                    // GET /posts - Get all posts with pagination/filtering
router.get("/:id", optionalAuth, getPostById);                 // GET /posts/:id - Get single post by ID

// Protected routes (require authentication)
router.post("/", auth, createPost);              // POST /posts - Create new post
router.put("/:id", auth, updatePost);            // PUT /posts/:id - Update post
router.delete("/:id", auth, deletePost);         // DELETE /posts/:id - Delete post
router.get("/user/me", auth, getUserPosts);      // GET /posts/user/me - Get current user's posts
router.get('/user/:userId', optionalAuth, getPostsByUserId); // GET /post/user/:userId - Public posts for a user (hides anonymous posts for others)
router.post("/:id/vote", auth, votePost);        // POST /posts/:id/vote - Vote on post

module.exports = router;
