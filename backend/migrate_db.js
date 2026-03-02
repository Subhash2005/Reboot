const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'reboot.db');
const db = new Database(dbPath);

console.log('Starting migration...');

const migrations = [
    "ALTER TABLE tasks ADD COLUMN deadline DATETIME;",
    "ALTER TABLE tasks ADD COLUMN completion_percentage INTEGER DEFAULT 0;",
    "ALTER TABLE tasks ADD COLUMN proof_url TEXT;",
    "ALTER TABLE tasks ADD COLUMN is_verified BOOLEAN DEFAULT 0;",
    "ALTER TABLE tasks ADD COLUMN tools TEXT;",
    "ALTER TABLE tools ADD COLUMN download_url TEXT;",
    "ALTER TABLE tools ADD COLUMN source_name VARCHAR(255);",
    "CREATE TABLE IF NOT EXISTS task_members (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INT, user_id INT, FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);"
];

for (const sql of migrations) {
    try {
        db.exec(sql);
        console.log(`Success: ${sql}`);
    } catch (e) {
        console.warn(`Already exists or error: ${sql}`);
    }
}

// Add some dummy milestones
try {
    const startups = db.prepare('SELECT id FROM startups').all();
    for (const startup of startups) {
        db.prepare('INSERT INTO milestones (startup_id, title, description) VALUES (?, ?, ?)').run(
            startup.id,
            'Alpha Module Integrated',
            'Successfully integrated the first core module of the platform.'
        );
        db.prepare('INSERT INTO milestones (startup_id, title, description) VALUES (?, ?, ?)').run(
            startup.id,
            'User Beta Access',
            'Opened the platform for the first 100 beta testers.'
        );
    }
} catch (e) {
    console.error('Error adding dummy milestones:', e.message);
}

db.close();
console.log('Migration completed.');
