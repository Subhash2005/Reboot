const express = require('express');
const router = express.Router();
const startupController = require('../controllers/startupController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/startups', startupController.getStartups);
router.get('/startups/available', authMiddleware, startupController.getAvailableStartups);
router.post('/startup/create', authMiddleware, startupController.createStartup);
router.post('/startup/join', authMiddleware, startupController.joinStartup);
router.delete('/startup/:id', authMiddleware, startupController.deleteStartup);
router.get('/startup/:id', startupController.getStartupById);
router.get('/user/startup-status', authMiddleware, startupController.getMyStartupStatus);
router.get('/startup/requests/pending', authMiddleware, startupController.getPendingRequests);
router.post('/startup/request/process', authMiddleware, startupController.processJoinRequest);
router.post('/startup/member/remove', authMiddleware, startupController.removeTeamMember);
router.get('/startup/:id/members', authMiddleware, startupController.getTeamMembers);

// Tasks & Milestones
router.get('/startup/:id/tasks', authMiddleware, startupController.getTasks);
router.post('/startup/tasks', authMiddleware, startupController.createTask);
router.patch('/startup/tasks', authMiddleware, startupController.updateTaskStatus);
router.patch('/startup/tasks/progress', authMiddleware, startupController.updateTaskProgress);
router.patch('/startup/tasks/verify', authMiddleware, startupController.verifyTask);

router.get('/startup/:id/milestones', authMiddleware, startupController.getMilestones);
router.post('/startup/milestones', authMiddleware, startupController.createMilestone);

router.get('/startup/:id/performance', authMiddleware, startupController.getPerformanceAnalytics);

router.get('/tools', authMiddleware, startupController.getTools);

module.exports = router;
