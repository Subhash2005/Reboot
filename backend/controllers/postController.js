const db = require('../db');

exports.createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, content } = req.body;
        const mediaUrl = req.file ? `http://localhost:5000/uploads/posts/${req.file.filename}` : null;

        await db.execute('INSERT INTO posts (user_id, title, content, media_url) VALUES (?, ?, ?, ?)',
            [userId, title || 'My Post', content || '', mediaUrl]);

        res.json({ message: 'Post created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user ? req.user.id : userId; // for saved status
        const [posts] = await db.execute(`
            SELECT p.*, u.username, u.profile_picture,
                   EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = ?) as is_saved
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC`,
            [currentUserId, userId]);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFeedPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const [posts] = await db.execute(`
            SELECT p.*, u.username, u.profile_picture,
                   EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = ?) as is_saved
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN followers f ON f.following_id = u.id
            WHERE f.follower_id = ? AND f.status = 'accepted'
            ORDER BY p.created_at DESC
        `, [currentUserId, currentUserId]);

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.savePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const [existing] = await db.execute('SELECT * FROM saved_posts WHERE user_id = ? AND post_id = ?', [userId, postId]);

        if (existing.length > 0) {
            await db.execute('DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?', [userId, postId]);
            res.json({ message: 'Post unsaved', is_saved: false });
        } else {
            await db.execute('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [userId, postId]);
            res.json({ message: 'Post saved', is_saved: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const [posts] = await db.execute(`
            SELECT p.*, u.username, u.profile_picture, 1 as is_saved
            FROM posts p
            JOIN saved_posts sp ON sp.post_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE sp.user_id = ?
            ORDER BY sp.created_at DESC
        `, [userId]);

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
