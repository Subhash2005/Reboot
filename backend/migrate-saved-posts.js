const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'reboot.db');
const db = new Database(dbPath);

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS saved_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            post_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            UNIQUE(user_id, post_id)
        );
    `);
    console.log('Saved posts table created or already exists.');
} catch (err) {
    console.error('Error creating saved_posts table:', err.message);
}

db.close();
