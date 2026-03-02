const db = require('./db');

async function migrate() {
    try {
        console.log('Adding full_name column to users table...');
        await db.execute('ALTER TABLE users ADD COLUMN full_name VARCHAR(255)');
        console.log('Migration successful!');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column full_name already exists.');
        } else {
            console.error('Migration failed:', error);
        }
    }
}

migrate();
