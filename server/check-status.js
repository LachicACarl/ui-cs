require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkStatus() {
  const { data: users } = await supabase
    .from('users')
    .select('employee_id, status')
    .limit(5);
  
  console.log('User statuses:');
  users.forEach(u => console.log(`  ${u.employee_id}: "${u.status}"`));
}

checkStatus();
