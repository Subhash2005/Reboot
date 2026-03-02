const db = require('../db');

exports.getMessageHistory = async (req, res) => {
    try {
        const { startupId } = req.params;
        const [messages] = await db.execute(`
            SELECT tm.*, u.username as sender_name 
            FROM team_messages tm 
            JOIN users u ON tm.sender_id = u.id 
            WHERE tm.startup_id = ? 
            ORDER BY tm.created_at ASC
            LIMIT 100
        `, [startupId]);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching messages' });
    }
};

exports.saveMessage = async (startupId, senderId, message, type = 'text', fileUrl = null) => {
    try {
        await db.execute(
            'INSERT INTO team_messages (startup_id, sender_id, message, type, file_url) VALUES (?, ?, ?, ?, ?)',
            [startupId, senderId, message, type, fileUrl]
        );
    } catch (error) {
        console.error('Error saving message:', error);
    }
};

exports.deleteTeamMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Only sender can delete for everyone
        const [msg] = await db.execute('SELECT sender_id FROM team_messages WHERE id = ?', [id]);
        if (!msg[0] || msg[0].sender_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete for everyone' });
        }

        await db.execute('UPDATE team_messages SET is_deleted = 1 WHERE id = ?', [id]);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

exports.deletePrivateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [msg] = await db.execute('SELECT sender_id FROM private_messages WHERE id = ?', [id]);
        if (!msg[0] || msg[0].sender_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await db.execute('UPDATE private_messages SET is_deleted = 1 WHERE id = ?', [id]);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

exports.getPrivateHistory = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user.id;
        const [messages] = await db.execute(`
            SELECT pm.*, s.username as sender_name, r.username as receiver_name 
            FROM private_messages pm 
            JOIN users s ON pm.sender_id = s.id 
            JOIN users r ON pm.receiver_id = r.id 
            WHERE (pm.sender_id = ? AND pm.receiver_id = ?) 
               OR (pm.sender_id = ? AND pm.receiver_id = ?) 
            ORDER BY pm.created_at ASC
        `, [userId, partnerId, partnerId, userId]);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching DM' });
    }
};

exports.savePrivateMessage = async (senderId, receiverId, message, type = 'text', fileUrl = null) => {
    try {
        await db.execute(
            'INSERT INTO private_messages (sender_id, receiver_id, message, type, file_url) VALUES (?, ?, ?, ?, ?)',
            [senderId, receiverId, message, type, fileUrl]
        );
    } catch (error) {
        console.error('Error saving DM:', error);
    }
};
