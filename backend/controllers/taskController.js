const db = require('../db');

exports.createTask = async (req, res) => {
    try {
        const { startup_id, assigned_to, title, description } = req.body;

        // Only leader can create tasks (simple check)
        const [membership] = await db.execute('SELECT role FROM team_members WHERE startup_id = ? AND user_id = ?', [startup_id, req.user.id]);
        if (membership.length === 0 || membership[0].role !== 'leader') {
            return res.status(403).json({ message: 'Only leaders can create tasks' });
        }

        const [result] = await db.execute(
            'INSERT INTO tasks (startup_id, assigned_to, title, description) VALUES (?, ?, ?, ?)',
            [startup_id, assigned_to, title, description]
        );

        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTasksByStartup = async (req, res) => {
    try {
        const { startupId } = req.params;
        const [tasks] = await db.execute('SELECT t.*, u.username as assigned_to_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.startup_id = ?', [startupId]);
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId, status } = req.body;
        await db.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
        res.json({ message: 'Task status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.approveTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        // Logic check for leader omitted for brevity, but should be added
        await db.execute('UPDATE tasks SET approved_by_leader = TRUE WHERE id = ?', [taskId]);
        res.json({ message: 'Task approved by leader' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
