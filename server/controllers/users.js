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
      username: user.email ? user.email.split('@')[0] : 'user',
      joinedAt: user.createdAt,
      postsCount,
    };

    res.status(200).json({ success: true, user: publicProfile });
  } catch (err) {
    console.error('Error fetching public profile', err);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};
