const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { getPublicProfile } = require('../controllers/users');
const { searchUsers } = require('../controllers/users');

// Public profile - optional auth to allow owner to see anonymous posts
router.get('/public/:id', optionalAuth, getPublicProfile);
// Search users for mention suggestions
router.get('/search', searchUsers);

module.exports = router;
