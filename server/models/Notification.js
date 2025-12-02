const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { // recipient
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actor: { // who triggered the notification (optional)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['comment', 'vote', 'follow', 'mention', 'system'],
      required: true,
    },
    message: { type: String, default: '' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
