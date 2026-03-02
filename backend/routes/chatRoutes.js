const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/chat/history/:startupId', authMiddleware, chatController.getMessageHistory);
router.get('/chat/private/:partnerId', authMiddleware, chatController.getPrivateHistory);
router.delete('/chat/message/:id', authMiddleware, chatController.deleteTeamMessage);
router.delete('/chat/private/:id', authMiddleware, chatController.deletePrivateMessage);

module.exports = router;
