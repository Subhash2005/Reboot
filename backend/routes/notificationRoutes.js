const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.put('/notifications/read/all', authMiddleware, notificationController.markAllAsRead);
router.put('/notifications/read/:id', authMiddleware, notificationController.markAsRead);

module.exports = router;
