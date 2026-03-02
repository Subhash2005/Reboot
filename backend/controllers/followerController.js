const db = require('../db');

exports.followUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { followingId } = req.body;

        if (followerId === followingId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const [existing] = await db.execute('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already following or request pending' });
        }

        await db.execute(
            "INSERT INTO followers (follower_id, following_id, status) VALUES (?, ?, 'pending')",
            [followerId, followingId]
        );

        // Create notification for the user being followed
        await db.execute(
            "INSERT INTO notifications (user_id, type, message) VALUES (?, 'follow_request', ?)",
            [followingId, `User ${followerId} wants to follow you`]
        );

        res.json({ message: 'Follow request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.acceptFollow = async (req, res) => {
    try {
        const userId = req.user.id;
        const { followerId } = req.body;

        await db.execute(
            "UPDATE followers SET status = 'accepted' WHERE follower_id = ? AND following_id = ?",
            [followerId, userId]
        );

        res.json({ message: 'Follow request accepted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const { userId } = req.query;
        const [followers] = await db.execute(
            "SELECT f.*, u.username, u.full_name, u.profile_picture, u.role FROM followers f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ? AND f.status = 'accepted'",
            [userId]
        );
        res.json(followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.query;
        const [following] = await db.execute(
            "SELECT f.*, u.username, u.full_name, u.profile_picture, u.role FROM followers f JOIN users u ON f.following_id = u.id WHERE f.follower_id = ? AND f.status = 'accepted'",
            [userId]
        );
        res.json(following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const [pending] = await db.execute(
            "SELECT f.*, u.username, u.full_name, u.profile_picture, u.role FROM followers f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ? AND f.status = 'pending'",
            [userId]
        );
        res.json(pending);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query: searchQuery } = req.query;
        const currentUserId = req.user.id;

        if (!searchQuery) {
            return res.json([]);
        }

        const [users] = await db.execute(`
            SELECT id, username, full_name, profile_picture, role,
                   (SELECT status FROM followers WHERE follower_id = ? AND following_id = users.id) as follow_status
            FROM users 
            WHERE (username LIKE ? OR full_name LIKE ?) AND id != ?
            LIMIT 20
        `, [currentUserId, `%${searchQuery}%`, `%${searchQuery}%`, currentUserId]);

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
