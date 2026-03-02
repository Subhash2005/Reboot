const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/freelancer/jobs', jobController.getFreelancerJobs);
router.get('/freelancer/portal-jobs', authMiddleware, jobController.getFreelancerPortalJobs);
router.post('/freelancer/sync-jobs', authMiddleware, jobController.syncExternalJobs);
router.get('/non-tech/jobs', jobController.getNonTechJobs);
router.get('/part-time/jobs', jobController.getPartTimeJobs);
router.post('/part-time/create', authMiddleware, jobController.createPartTimeJob);
router.post('/part-time/sync', authMiddleware, jobController.syncPartTimeJobs);

module.exports = router;
