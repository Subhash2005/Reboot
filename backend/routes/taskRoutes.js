const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/task/create', authMiddleware, taskController.createTask);
router.get('/tasks/:startupId', authMiddleware, taskController.getTasksByStartup);
router.put('/task/update', authMiddleware, taskController.updateTask);
router.post('/task/approve', authMiddleware, taskController.approveTask);

module.exports = router;
