const db = require('../db');

exports.getRecommendations = async (userId) => {
    try {
        // Simple AI logic: Match user skills with startup required skills
        const [users] = await db.execute('SELECT skill_name FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return [];

        const userSkills = users[0].skill_name ? users[0].skill_name.toLowerCase().split(',') : [];

        const [startups] = await db.execute('SELECT * FROM startups');

        const recommendations = startups.filter(startup => {
            const required = startup.required_skill ? startup.required_skill.toLowerCase() : '';
            return userSkills.some(skill => required.includes(skill.trim()));
        });

        return recommendations;
    } catch (error) {
        console.error('AI Service Error:', error);
        return [];
    }
};

exports.getChatbotResponse = async (query) => {
    // Simple RAG mock
    if (query.toLowerCase().includes('startup')) {
        return "You can create a startup from the Youth Dashboard. Make sure to have a team name and project description ready!";
    }
    return "I'm your Reboot assistant. How can I help you revive your income today?";
};
