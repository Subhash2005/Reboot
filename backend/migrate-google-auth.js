const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'reboot.db');
const db = new Database(dbPath);

try {
    // Check existing columns
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const columns = tableInfo.map(col => col.name);
    console.log('Existing columns:', columns);

    if (!columns.includes('google_id')) {
        db.prepare("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)").run();
        console.log('✅ Added column: google_id');
    } else {
        console.log('ℹ️  Column google_id already exists, skipping.');
    }

    if (!columns.includes('auth_provider')) {
        db.prepare("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local'").run();
        console.log('✅ Added column: auth_provider');
    } else {
        console.log('ℹ️  Column auth_provider already exists, skipping.');
    }

    console.log('\n✅ Migration complete! Google Auth columns are ready.');
} catch (err) {
    console.error('Migration error:', err);
} finally {
    db.close();
}
