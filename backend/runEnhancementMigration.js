const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runEnhancementMigration() {
  try {
    console.log('🔄 Running project_applications table enhancement migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '003_enhance_project_applications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  ${i + 1}/${statements.length}: Executing statement...`);
          await pool.query(statement);
        } catch (error) {
          // Some statements might fail if they already exist (like indexes)
          if (error.code === '42710' || error.code === '42P07') {
            console.log(`  ⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Enhancement migration completed successfully!');
    
    // Verify the new columns were added
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'project_applications' 
      AND column_name IN ('hourly_rate', 'estimated_duration', 'cover_letter', 'updated_at', 'company_feedback_at', 'company_feedback_by')
      ORDER BY column_name;
    `);
    
    console.log('\n📊 Verification - New columns added:');
    verifyResult.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check indexes
    const indexResult = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'project_applications' 
      AND indexname LIKE 'idx_project_applications_%';
    `);
    
    console.log('\n🔍 Verification - Indexes created:');
    indexResult.rows.forEach(row => {
      console.log(`  ✅ ${row.indexname}`);
    });
    
  } catch (error) {
    console.error('❌ Enhancement migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runEnhancementMigration(); 