const db = require('../db');

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.execute('SELECT id, username, full_name, age, phone, email, role, auth_provider, skill_type, skill_name, bio, previous_experience, profile_picture FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch counts
        const [followers] = await db.execute('SELECT COUNT(*) as count FROM followers WHERE following_id = ? AND status = \'accepted\'', [id]);
        const [following] = await db.execute('SELECT COUNT(*) as count FROM followers WHERE follower_id = ? AND status = \'accepted\'', [id]);
        const [posts] = await db.execute('SELECT COUNT(*) as count FROM posts WHERE user_id = ?', [id]);

        // Also check for unread notifications if it's the current user
        let unreadNotifications = 0;
        if (req.user && req.user.id == id) {
            const [count] = await db.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0', [id]);
            unreadNotifications = count[0].count;
        }

        const stats = {
            followers: followers[0].count,
            following: following[0].count,
            posts: posts[0].count,
            unreadNotifications: unreadNotifications
        };

        res.json({ ...users[0], stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, full_name, age, phone, email, skill_type, skill_name, bio, previous_experience, profile_picture } = req.body;

        await db.execute(
            'UPDATE users SET username=?, full_name=?, age=?, phone=?, email=?, skill_type=?, skill_name=?, bio=?, previous_experience=?, profile_picture=? WHERE id=?',
            [username, full_name, age, phone, email, skill_type, skill_name, bio, previous_experience, profile_picture, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upload Failed' });
    }
};
