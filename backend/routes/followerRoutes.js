const express = require('express');
const router = express.Router();
const followerController = require('../controllers/followerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/follow', authMiddleware, followerController.followUser);
router.post('/follow/accept', authMiddleware, followerController.acceptFollow);
router.get('/followers', authMiddleware, followerController.getFollowers);
router.get('/following', authMiddleware, followerController.getFollowing);
router.get('/requests', authMiddleware, followerController.getPendingRequests);
router.get('/search', authMiddleware, followerController.searchUsers);

module.exports = router;
