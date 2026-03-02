const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'reboot.db');
const db = new Database(dbPath);

console.log('Spreading dummy tasks to all teams...');

const startups = db.prepare('SELECT id, project_name FROM startups').all();

for (const startup of startups) {
    // Get founder of this startup
    const founder = db.prepare('SELECT user_id FROM team_members WHERE startup_id = ? AND role = \'Founder\'').get(startup.id);
    if (!founder) continue;

    const userId = founder.user_id;
    console.log(`Adding tasks for startup ${startup.id} (${startup.project_name}), assigned to user ${userId}`);

    const tools = JSON.stringify(['Figma', 'VS Code', 'Trello']);

    const tasks = [
        {
            title: 'Refine Brand Guidelines',
            description: 'Develop a comprehensive brand book including typography, color palette, and logo usage.',
            status: 'inprogress',
            completion: 45,
            deadline: '2026-03-15',
            tools: tools
        },
        {
            title: 'Database Schema Optimization',
            description: 'Review current indexing and relationships for performance bottlenecks.',
            status: 'pending',
            completion: 10,
            deadline: '2026-03-20',
            tools: tools
        },
        {
            title: 'Initial Deployment',
            description: 'Connect repository to Vercel/Netlify for automated staging builds.',
            status: 'completed',
            completion: 100,
            deadline: '2026-02-28',
            tools: tools
        }
    ];

    for (const t of tasks) {
        // Check if task already exists
        const existing = db.prepare('SELECT id FROM tasks WHERE startup_id = ? AND title = ?').get(startup.id, t.title);
        if (existing) continue;

        const res = db.prepare(`
            INSERT INTO tasks (startup_id, title, description, status, completion_percentage, deadline, tools, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(startup.id, t.title, t.description, t.status, t.completion, t.deadline, t.tools, userId);

        const taskId = res.lastInsertRowid;
        db.prepare('INSERT INTO task_members (task_id, user_id) VALUES (?, ?)').run(taskId, userId);
    }
}

console.log('All teams now have dummy tasks.');
db.close();
