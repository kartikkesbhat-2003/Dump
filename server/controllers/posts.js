const Post = require("../models/Post");
const Vote = require("../models/Vote");
const Comment = require("../models/Comment");
const { createNotification } = require('./notifications');
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, content, isAnonymous } = req.body;
        const file = req.files?.image; // For future file upload handling
        const userId = req.user.userId;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        let uploadDetails = {};

        if(file) {
            uploadDetails = await uploadImageToCloudinary(
                file,
                "posts",
            );
        }
            

        const post = new Post({
            user: userId,
            title,
            content,
            imageUrl: uploadDetails?.secure_url || "",
            isAnonymous: isAnonymous || false,
        });
        
        await post.save();
        
        // Populate user data for response (include username so frontend can show handle)
        await post.populate("user", "username email");

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
            success: false,
            message: "Error creating post",
            error: error.message,
        });
    }
};

// Get all posts with pagination and filtering
exports.getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const search = req.query.search;
        const userId = req.user?.userId; // Optional for unauthenticated users

        // Build query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const posts = await Post.find(query)
            // Include username so clients can show proper handle instead of deriving from email
            .populate("user", "username email")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        // Get vote counts and user's vote for each post
        const postsWithVotes = await Promise.all(posts.map(async (post) => {
            const upvotes = await Vote.countDocuments({ post: post._id, voteType: 'upvote' });
            const downvotes = await Vote.countDocuments({ post: post._id, voteType: 'downvote' });
            const comments = await Comment.countDocuments({ post: post._id });
            
            // Get user's vote if authenticated
            let userVote = null;
            if (userId) {
                const vote = await Vote.findOne({ post: post._id, user: userId });
                userVote = vote ? vote.voteType : null;
            }
            
            return {
                ...post.toObject(),
                upvotes,
                downvotes,
                totalVotes: upvotes - downvotes,
                commentsCount: comments,
                userVote
            };
        }));

        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            success: true,
            posts: postsWithVotes,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching posts",
            error: error.message,
        });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId; // Optional for unauthenticated users
        
        const post = await Post.findById(id)
            // Include username for post owner
            .populate("user", "username email");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Get vote counts and comments
        const upvotes = await Vote.countDocuments({ post: id, voteType: 'upvote' });
        const downvotes = await Vote.countDocuments({ post: id, voteType: 'downvote' });
        const comments = await Comment.find({ post: id })
            // Include username for comment authors
            .populate("user", "username email")
            .populate("parentComment")
            .sort({ createdAt: -1 });

        // Get user's vote if authenticated
        let userVote = null;
        if (userId) {
            const vote = await Vote.findOne({ post: id, user: userId });
            userVote = vote ? vote.voteType : null;
        }

        const postWithDetails = {
            ...post.toObject(),
            upvotes,
            downvotes,
            totalVotes: upvotes - downvotes,
            comments,
            userVote
        };

        res.status(200).json({
            success: true,
            post: postWithDetails
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching post",
            error: error.message,
        });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, imageUrl, isAnonymous } = req.body;
        const userId = req.user.userId;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if user owns the post
        if (post.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own posts"
            });
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (imageUrl !== undefined) post.imageUrl = imageUrl;
        if (isAnonymous !== undefined) post.isAnonymous = isAnonymous;

        await post.save();
        await post.populate("user", "email");

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({
            success: false,
            message: "Error updating post",
            error: error.message,
        });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if user owns the post
        if (post.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts"
            });
        }

        // Delete associated comments and votes
        await Comment.deleteMany({ post: id });
        await Vote.deleteMany({ post: id });
        
        // Delete the post
        await Post.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting post",
            error: error.message,
        });
    }
};

// Get user's own posts
exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: userId })
            // Include username for owner
            .populate("user", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user posts",
            error: error.message,
        });
    }
};

// Vote on a post
exports.votePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body; // 'upvote' or 'downvote'
        const userId = req.user.userId;

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: "Vote type must be 'upvote' or 'downvote'"
            });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if user already voted
        const existingVote = await Vote.findOne({ user: userId, post: id });

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Remove vote if same type
                await Vote.findByIdAndDelete(existingVote._id);
                return res.status(200).json({
                    success: true,
                    message: "Vote removed"
                });
            } else {
                // Update vote type
                existingVote.voteType = voteType;
                await existingVote.save();
                // Notify post owner when vote type changes (e.g., switched to upvote/downvote)
                try {
                    await createNotification({
                        userId: post.user,
                        actorId: userId,
                        type: 'vote',
                        message: `${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} your post: ${post.title?.slice(0, 120)}`,
                        postId: post._id
                    });
                } catch (err) {
                    console.error('Failed to create vote-change notification:', err);
                }
                return res.status(200).json({
                    success: true,
                    message: "Vote updated"
                });
            }
        }

        // Create new vote
        const vote = new Vote({
            user: userId,
            post: id,
            voteType
        });
        await vote.save();

                // Notify post owner on vote (upvote or downvote)
                try {
                    await createNotification({
                        userId: post.user,
                        actorId: userId,
                        type: 'vote',
                        message: `${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} your post: ${post.title?.slice(0, 120)}`,
                        postId: post._id
                    });
                } catch (err) {
                    console.error('Failed to create vote notification:', err);
                }

        res.status(201).json({
            success: true,
            message: "Vote added successfully"
        });
    } catch (error) {
        console.error("Error voting on post:", error);
        res.status(500).json({
            success: false,
            message: "Error voting on post",
            error: error.message,
        });
    }
};

// Get posts by a specific user id (public view). If the viewer is not the owner, hide anonymous posts.
exports.getPostsByUserId = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const viewerId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: targetUserId };
        if (!viewerId || viewerId.toString() !== targetUserId.toString()) {
            // hide anonymous posts for other viewers
            query.isAnonymous = false;
        }

        const posts = await Post.find(query)
            // Include username for public profile listings
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Attach votes/comments similar to getAllPosts
        const postsWithVotes = await Promise.all(posts.map(async (post) => {
            const upvotes = await Vote.countDocuments({ post: post._id, voteType: 'upvote' });
            const downvotes = await Vote.countDocuments({ post: post._id, voteType: 'downvote' });
            const comments = await Comment.countDocuments({ post: post._id });

            let userVote = null;
            if (viewerId) {
                const vote = await Vote.findOne({ post: post._id, user: viewerId });
                userVote = vote ? vote.voteType : null;
            }

            return {
                ...post.toObject(),
                upvotes,
                downvotes,
                totalVotes: upvotes - downvotes,
                commentsCount: comments,
                userVote
            };
        }));

        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({ success: true, posts: postsWithVotes, pagination: { currentPage: page, totalPages, totalPosts, hasNext: page < totalPages, hasPrev: page > 1 } });
    } catch (err) {
        console.error('Error fetching posts by user id', err);
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
};