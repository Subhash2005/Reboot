const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

router.post('/create', authMiddleware, upload.single('media'), postController.createPost);
router.get('/user/:userId', authMiddleware, postController.getUserPosts);
router.get('/feed', authMiddleware, postController.getFeedPosts);
router.post('/:postId/save', authMiddleware, postController.savePost);
router.get('/saved', authMiddleware, postController.getSavedPosts);

module.exports = router;
