const User = require('../models/User');
const Post = require('../models/Post');

// Get public profile for a user
exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.userId;

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Count posts (exclude anonymous posts when viewer is not the owner)
    const postQuery = { user: id };
    if (!viewerId || viewerId.toString() !== id.toString()) {
      postQuery.isAnonymous = false;
    }

    const postsCount = await Post.countDocuments(postQuery);

    const publicProfile = {
      _id: user._id,
      // Use stored username only; do not derive from email local-part
      username: user.username || 'user',
      joinedAt: user.createdAt,
      postsCount,
    };

    res.status(200).json({ success: true, user: publicProfile });
  } catch (err) {
    console.error('Error fetching public profile', err);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

// Search users by username (prefix). Public endpoint.
exports.searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    if (!q) return res.status(200).json({ success: true, users: [] });

    const regex = new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({ username: { $regex: regex } }).select('username').limit(8).lean();
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('Error searching users', err);
    res.status(500).json({ success: false, users: [] });
  }
};
