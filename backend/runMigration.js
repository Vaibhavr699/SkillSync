const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skillsync',
  password: 'postgres',
  port: 5432,
});

async function runMigration() {
  try {
    console.log('Running migration: 009_enhance_application_fields.sql');
    
    const migrationPath = path.join(__dirname, 'migrations', '009_enhance_application_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 