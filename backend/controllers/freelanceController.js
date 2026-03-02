const db = require('../db');

exports.getFreelanceJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        // 1. Get user skills to show tailored matches
        const [user] = await db.execute('SELECT skill_name, skill_type FROM users WHERE id = ?', [userId]);
        const userSkills = (user[0]?.skill_name || '').toLowerCase().split(',').map(s => s.trim());

        let query = 'SELECT * FROM freelance_jobs';
        let params = [];

        if (search) {
            query += ' WHERE (company_name LIKE ? OR client_name LIKE ? OR required_skills LIKE ?)';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        } else if (userSkills.length > 0 && userSkills[0] !== '') {
            // Match partially with any of the user's skills
            query += ' WHERE ' + userSkills.map(() => 'required_skills LIKE ?').join(' OR ');
            params = userSkills.map(s => `%${s}%`);
        }

        query += ' ORDER BY created_at DESC';
        const [jobs] = await db.execute(query, params);

        res.json({
            jobs,
            hasSkills: !!(user[0]?.skill_name)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
