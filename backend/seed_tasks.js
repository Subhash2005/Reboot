const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'reboot.db');
const db = new Database(dbPath);

console.log('Seed check...');

const startups = db.prepare('SELECT id, project_name FROM startups').all();
const users = db.prepare('SELECT id, username FROM users').all();

if (startups.length > 0 && users.length > 0) {
    const startupId = startups[0].id;
    const userId = users[0].id;

    console.log(`Adding dummy tasks for startup: ${startups[0].project_name}`);

    // Tools list for dummy tasks
    const tools = JSON.stringify(['Figma', 'VS Code']);

    const tasks = [
        {
            title: 'Design Hero Section',
            description: 'Create a high-fidelity mockup for the landing page hero section with glassmorphism effects.',
            status: 'inprogress',
            completion: 60,
            deadline: '2026-03-10',
            tools: tools
        },
        {
            title: 'Backend API Setup',
            description: 'Initialize Node.js server with Express and setup basic authentication middleware.',
            status: 'completed',
            completion: 100,
            deadline: '2026-03-05',
            tools: tools
        }
    ];

    for (const t of tasks) {
        const res = db.prepare(`
            INSERT INTO tasks (startup_id, title, description, status, completion_percentage, deadline, tools, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(startupId, t.title, t.description, t.status, t.completion, t.deadline, t.tools, userId);

        const taskId = res.lastInsertRowid;
        // Assign to user in task_members as well
        db.prepare('INSERT INTO task_members (task_id, user_id) VALUES (?, ?)').run(taskId, userId);
    }
    console.log('Dummy tasks added successfully.');
} else {
    console.log('No startups or users found to assign tasks to.');
}

db.close();
