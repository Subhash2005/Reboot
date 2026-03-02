const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'c:/Users/subhash/OneDrive/Desktop/reboot/backend/reboot.db';
const db = new Database(dbPath);

try {
    db.exec("ALTER TABLE part_time_jobs ADD COLUMN latitude REAL;");
    console.log('Added latitude column successfully.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Latitude column already exists.');
    } else {
        console.error('Error adding latitude:', err.message);
    }
}

try {
    db.exec("ALTER TABLE part_time_jobs ADD COLUMN longitude REAL;");
    console.log('Added longitude column successfully.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Longitude column already exists.');
    } else {
        console.error('Error adding longitude:', err.message);
    }
}

db.close();
