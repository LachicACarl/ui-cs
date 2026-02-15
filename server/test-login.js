require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testLogin() {
  console.log('Testing login for SA001...\n');
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('employee_id', 'SA001')
    .ilike('status', 'active')
    .single();
  
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ User found:', {
    employee_id: user.employee_id,
    name: user.name,
    role: user.role,
    status: user.status,
    has_password_hash: !!user.password_hash
  });
  
  // Test password
  const password = 'admin123';
  const passwordValid = await bcrypt.compare(password, user.password_hash);
  
  console.log('\n🔑 Password test:');
  console.log('  Password provided: admin123');
  console.log('  Password valid:', passwordValid);
  
  if (!passwordValid) {
    console.log('\n⚠️  The password hash in the database might be incorrect.');
    console.log('  Generating correct hash for "admin123":');
    const correctHash = await bcrypt.hash('admin123', 10);
    console.log('  Hash:', correctHash);
  }
}

testLogin();
