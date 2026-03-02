const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'reboot.db');

const db = new Database(dbPath);
const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');

// SQLite doesn't support 'USE' or 'CREATE DATABASE' in the same way, or 'ENUM'
// We need to clean up the schema for SQLite compatibility
const cleanedSchema = schema
    .replace(/CREATE DATABASE IF NOT EXISTS reboot_db;/g, '')
    .replace(/USE reboot_db;/g, '')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/ENUM\([^)]+\)/g, 'TEXT') // Replace ENUMs with TEXT
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP');

try {
    db.exec(cleanedSchema);
    console.log('Database initialized successfully with SQLite.');
} catch (error) {
    console.error('Error initializing database:', error);
} finally {
    db.close();
}
