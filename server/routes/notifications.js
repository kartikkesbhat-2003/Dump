const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../controllers/notifications');
const { auth } = require('../middleware/auth');

// GET /notification - list notifications for authenticated user
router.get('/', auth, getNotifications);
// get unread count
router.get('/count', auth, getUnreadCount);

// PUT /notification/:id/read - mark one as read
router.put('/:id/read', auth, markAsRead);

// PUT /notification/mark-all - mark all as read
router.put('/mark-all', auth, markAllAsRead);

module.exports = router;
