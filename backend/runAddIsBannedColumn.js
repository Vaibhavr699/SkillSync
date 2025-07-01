const db = require('./config/db');

async function runMigration() {
  try {
    console.log('Adding is_banned column to users table...');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

runMigration(); 