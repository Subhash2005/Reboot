const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, 'reboot.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode — allows DB Browser + backend to coexist without lock errors
try {
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
} catch (e) {
    console.warn('⚠️  Could not set WAL mode (DB may be open elsewhere):', e.message);
}


// Helper to mimic mysql2's promise behavior if needed (though better-sqlite3 is synchronous)
// Most of the existing code uses pool.promise().query() or similar.
// We'll create a wrapper that provides a similar interface to minimize changes across the backend.

const dbWrapper = {
    execute: async (sql, params = []) => {
        try {
            // Convert booleans to 0/1 for SQLite compatibility
            const sanitizedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
            const stmt = db.prepare(sql);
            if (sql.trim().toLowerCase().startsWith('select')) {
                return [stmt.all(...sanitizedParams)];
            } else {
                const info = stmt.run(...sanitizedParams);
                // Add insertId for compatibility with mysql2-style code
                info.insertId = info.lastInsertRowid;
                return [info];
            }
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    },
    query: async (sql, params = []) => {
        return dbWrapper.execute(sql, params);
    }
};

module.exports = dbWrapper;
