require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('Checking Supabase tables...\n');
  
  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.log('❌ Users table error:', usersError.message);
  } else {
    console.log('✅ Users table exists');
  }
  
  // Check attendance table
  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .limit(1);
  
  if (attendanceError) {
    console.log('❌ Attendance table error:', attendanceError.message);
  } else {
    console.log('✅ Attendance table exists');
  }
  
  // Check salary table
  const { data: salary, error: salaryError } = await supabase
    .from('salary')
    .select('*')
    .limit(1);
  
  if (salaryError) {
    console.log('❌ Salary table error:', salaryError.message);
  } else {
    console.log('✅ Salary table exists');
  }
  
  // Check audit_log table
  const { data: audit, error: auditError } = await supabase
    .from('audit_log')
    .select('*')
    .limit(1);
  
  if (auditError) {
    console.log('❌ Audit_log table error:', auditError.message);
  } else {
    console.log('✅ Audit_log table exists');
  }
  
  console.log('\n📋 Next steps:');
  if (usersError || attendanceError || salaryError || auditError) {
    console.log('1. Go to your Supabase dashboard: https://tthysazhswsmgcebeubg.supabase.co');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Copy and paste the contents of supabase-schema.sql');
    console.log('4. Click "Run" to create the tables');
  } else {
    console.log('✅ All tables exist! You can proceed with the migration.');
  }
}

checkTables();
