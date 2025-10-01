const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Vote = require("../models/Vote");

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { postId, content, parentComment, isAnonymous } = req.body;
        const userId = req.user.userId;

        if (!postId || !content) {
            return res.status(400).json({
                success: false,
                message: "Post ID and content are required"
            });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // If parent comment provided, check if it exists
        if (parentComment) {
            const parentCommentExists = await Comment.findById(parentComment);
            if (!parentCommentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Parent comment not found"
                });
            }
        }

        const comment = new Comment({
            user: userId,
            post: postId,
            content,
            parentComment: parentComment || null,
            isAnonymous: isAnonymous || false
        });

        await comment.save();
        await comment.populate("user", "email");
        
        if (parentComment) {
            await comment.populate("parentComment");
        }

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            comment
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({
            success: false,
            message: "Error creating comment",
            error: error.message
        });
    }
};

// Get comments for a post
exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.user ? req.user.userId : null;

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Get top-level comments (no parent)
        const comments = await Comment.find({ 
            post: postId, 
            parentComment: null 
        })
        .populate("user", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // Get replies for each comment, vote counts, and user votes
        const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
            const replies = await Comment.find({ parentComment: comment._id })
                .populate("user", "email")
                .sort({ createdAt: 1 });

            const upvotes = await Vote.countDocuments({ comment: comment._id, voteType: 'upvote' });
            const downvotes = await Vote.countDocuments({ comment: comment._id, voteType: 'downvote' });

            // Get user's vote if authenticated
            let userVote = null;
            if (userId) {
                const vote = await Vote.findOne({ comment: comment._id, user: userId });
                userVote = vote ? vote.voteType : null;
            }

            // Process replies with vote information
            const repliesWithVotes = await Promise.all(replies.map(async (reply) => {
                const replyUpvotes = await Vote.countDocuments({ comment: reply._id, voteType: 'upvote' });
                const replyDownvotes = await Vote.countDocuments({ comment: reply._id, voteType: 'downvote' });
                
                let replyUserVote = null;
                if (userId) {
                    const vote = await Vote.findOne({ comment: reply._id, user: userId });
                    replyUserVote = vote ? vote.voteType : null;
                }

                return {
                    ...reply.toObject(),
                    upvotes: replyUpvotes,
                    downvotes: replyDownvotes,
                    totalVotes: replyUpvotes - replyDownvotes,
                    userVote: replyUserVote
                };
            }));

            return {
                ...comment.toObject(),
                replies: repliesWithVotes,
                upvotes,
                downvotes,
                totalVotes: upvotes - downvotes,
                userVote
            };
        }));

        const totalComments = await Comment.countDocuments({ 
            post: postId, 
            parentComment: null 
        });
        const totalPages = Math.ceil(totalComments / limit);

        res.status(200).json({
            success: true,
            comments: commentsWithReplies,
            pagination: {
                currentPage: page,
                totalPages,
                totalComments,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching comments",
            error: error.message
        });
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isAnonymous } = req.body;
        const userId = req.user.userId;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own comments"
            });
        }

        // Update fields
        if (content) comment.content = content;
        if (isAnonymous !== undefined) comment.isAnonymous = isAnonymous;

        await comment.save();
        await comment.populate("user", "email");

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            comment
        });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({
            success: false,
            message: "Error updating comment",
            error: error.message
        });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comments"
            });
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentComment: id });
        
        // Delete votes on this comment
        await Vote.deleteMany({ comment: id });
        
        // Delete the comment
        await Comment.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: error.message
        });
    }
};

// Vote on a comment
exports.voteComment = async (req, res) => {
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

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Check if user already voted
        const existingVote = await Vote.findOne({ user: userId, comment: id });

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
                return res.status(200).json({
                    success: true,
                    message: "Vote updated"
                });
            }
        }

        // Create new vote
        const vote = new Vote({
            user: userId,
            comment: id,
            voteType
        });
        await vote.save();

        res.status(201).json({
            success: true,
            message: "Vote added successfully"
        });
    } catch (error) {
        console.error("Error voting on comment:", error);
        res.status(500).json({
            success: false,
            message: "Error voting on comment",
            error: error.message
        });
    }
};