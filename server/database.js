const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.error('Supabase connection error:', error);
    } else {
      console.log('Connected to Supabase database');
    }
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testConnection();
// Don't call initializeDatabase() during require - let server.js call it

async function initializeDatabase() {
  try {
    // Note: Tables should be created via Supabase Dashboard SQL Editor
    // This function will seed default users if needed
    console.log('Checking database tables...');
    await seedDefaultUsers();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function seedDefaultUsers() {
  const users = [
    { employee_id: 'SA001', name: 'Super Admin', role: 'super_admin', password: 'admin123', email: 'superadmin@gracewell.com', department: 'IT' },
    { employee_id: 'A001', name: 'Admin User', role: 'admin', password: 'admin123', email: 'admin@gracewell.com', department: 'IT' },
    { employee_id: 'M001', name: 'Manager User', role: 'manager', password: 'manager123', email: 'manager@gracewell.com', department: 'Operations' },
    { employee_id: 'E001', name: 'John Smith', role: 'employee', password: 'emp123', email: 'john@gracewell.com', department: 'Operations', position: 'Trucker' },
    { employee_id: 'E002', name: 'Sarah Johnson', role: 'employee', password: 'emp123', email: 'sarah@gracewell.com', department: 'Finance', position: 'Finance Head' },
  ];

  for (const user of users) {
    try {
      // Check if user exists
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('employee_id')
        .eq('employee_id', user.employee_id);

      if (!existing || existing.length === 0) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const { error } = await supabase.from('users').insert({
          employee_id: user.employee_id,
          name: user.name,
          role: user.role,
          password_hash: hashedPassword,
          email: user.email,
          status: 'Active',
          account_status: 'ACTIVE',
          department: user.department,
          position: user.position || null
        });

        if (error) {
          console.error(`Error seeding user ${user.employee_id}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Error checking/seeding user ${user.employee_id}:`, error);
    }
  }
}

// Export both the client and initialization function
module.exports = supabase;
module.exports.initialize = initializeDatabase;
module.exports.seedUsers = seedDefaultUsers;
