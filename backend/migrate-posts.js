const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'c:/Users/subhash/OneDrive/Desktop/reboot/backend/reboot.db';
const db = new Database(dbPath);

try {
    // Create posts table if it doesn't exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title VARCHAR(255),
            content TEXT,
            media_url VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    console.log('Posts table created or already exists.');
} catch (err) {
    console.error('Error creating posts table:', err.message);
}

db.close();
