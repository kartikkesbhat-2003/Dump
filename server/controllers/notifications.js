const Notification = require('../models/Notification');
const { getIO } = require('../utils/socket');

// Helper to create a notification (returns the created document)
exports.createNotification = async ({ userId, actorId = null, type, message = '', postId = null, commentId = null }) => {
  try {
    // Do not create notification if recipient === actor
    if (!userId) return null;
    if (actorId && actorId.toString() === userId.toString()) return null;

    const notification = new Notification({
      user: userId,
      actor: actorId || null,
      type,
      message,
      post: postId || null,
      comment: commentId || null,
    });

    await notification.save();
    // Emit real-time event to recipient if socket server is available
    try {
      const io = getIO();
      if (io) {
        const room = `user_${userId}`;
        io.to(room).emit('notification', notification);
      }
    } catch (err) {
      console.error('Notification emit error', err);
    }

    // Also emit updated unread count for recipient
    try {
      const io = getIO();
      if (io) {
        const unread = await Notification.countDocuments({ user: userId, isRead: false });
        const room = `user_${userId}`;
        io.to(room).emit('notification_count', { unread });
      }
    } catch (err) {
      console.error('Failed to emit notification_count', err);
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// Get notifications for current user (paginated)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .populate('actor', 'email')
      .populate('post', 'title')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: userId });

    res.status(200).json({ success: true, notifications, pagination: { page, limit, total } });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

// Get unread count for current user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const unread = await Notification.countDocuments({ user: userId, isRead: false });
    res.status(200).json({ success: true, unread });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ success: false, message: 'Error fetching unread count' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (notif.user.toString() !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    notif.isRead = true;
    await notif.save();
      // emit updated count to the user room
      try {
        const io = getIO();
        if (io) {
          const unread = await Notification.countDocuments({ user: userId, isRead: false });
          io.to(`user_${userId}`).emit('notification_count', { unread });
        }
      } catch (err) {
        console.error('Failed to emit notification_count after markAsRead', err);
      }

      res.status(200).json({ success: true, message: 'Marked as read', notification: notif });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
    try {
      const io = getIO();
      if (io) {
        io.to(`user_${userId}`).emit('notification_count', { unread: 0 });
      }
    } catch (err) {
      console.error('Failed to emit notification_count after markAllAsRead', err);
    }

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
};
