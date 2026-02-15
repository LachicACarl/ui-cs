require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkUsers() {
  console.log('Checking users in Supabase...\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('employee_id, name, role, status')
    .order('employee_id');
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  if (users.length === 0) {
    console.log('❌ No users found in database!');
    console.log('\n📋 You need to seed the database with default users.');
    console.log('Run: node database.js to initialize default users');
  } else {
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.employee_id}: ${user.name} (${user.role}) - ${user.status}`);
    });
  }
}

checkUsers();
