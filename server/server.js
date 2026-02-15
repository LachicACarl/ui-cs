require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const PDFDocument = require('pdfkit');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Supabase client (optional, for image storage)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ========== AUTH ROUTES ==========

// Check employee role by ID (no auth required)
app.post('/auth/check-employee', async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const { data: user, error } = await db
      .from('users')
      .select('employee_id, role, name, status')
      .eq('employee_id', employeeId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Employee ID not found' });
    }

    res.json({
      found: true,
      role: user.role,
      name: user.name,
      status: user.status,
      requiresPassword: user.role !== 'employee' // Admin and manager need password
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('employee_id', employeeId)
      .ilike('status', 'active')
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    // For employees: allow login without password (QR attendance mode)
    if (user.role === 'employee' && (!password || password === '')) {
      const token = jwt.sign(
        { id: user.employee_id, role: user.role, purpose: 'attendance' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.json({
        accessToken: token,
        user: {
          employeeId: user.employee_id,
          employeeName: user.name,
          userRole: user.role,
          email: user.email,
          status: user.status,
          profileImage: user.profile_image_url,
          isAttendanceMode: true
        }
      });
    }

    // For admin/manager or when password is provided: require password verification
    if (!password || password === '') {
      return res.status(401).json({ message: 'Password is required' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.employee_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      accessToken: token,
      user: {
        employeeId: user.employee_id,
        employeeName: user.name,
        userRole: user.role,
        email: user.email,
        status: user.status,
        profileImage: user.profile_image_url
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Attendance QR Login - Employee ID only (no password required)
app.post('/auth/qr-login', async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, employee_id, name, role, status, qr_code, qr_image_url')
      .eq('employee_id', employeeId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Employee ID not found or inactive' });
    }

    // Generate temporary attendance session token
    const token = jwt.sign(
      { id: user.employee_id, role: user.role, purpose: 'attendance' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' } // Short expiry for attendance session
    );

    res.json({
      success: true,
      accessToken: token,
      user: {
        employeeId: user.employee_id,
        employeeName: user.name,
        userRole: user.role,
        qrCode: user.qr_code,
        qrImageUrl: user.qr_image_url
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Verify session
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('employee_id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        employeeId: user.employee_id,
        employeeName: user.name,
        userRole: user.role,
        email: user.email,
        status: user.status,
        profileImage: user.profile_image_url
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error' });
  }
});

// Setup password - Employee uses activation token to set password
app.post('/auth/setup-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  // Validate input
  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Find user with valid activation token
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('activation_token', token)
      .eq('account_status', 'PENDING')
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'Invalid or expired activation token' });
    }

    // Check if token has expired
    if (new Date(user.activation_expiry) < new Date()) {
      return res.status(400).json({ message: 'Activation token has expired' });
    }

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);

    // Update user account
    const { error: updateError } = await db
      .from('users')
      .update({
        password_hash: hash,
        account_status: 'ACTIVE',
        activation_token: null,
        activation_expiry: null
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update password' });
    }

    res.json({
      success: true,
      message: 'Password set successfully! You can now login.',
      redirectUrl: '/login'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Forgot Password - Step 1: Send verification code
app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if email exists
    const { data: user, error } = await db
      .from('users')
      .select('id, employee_id, name, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If email exists, verification code has been sent' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // Expires in 10 minutes

    // Store verification code (temporarily in memory - for production use Redis or database)
    if (!global.passwordResetCodes) {
      global.passwordResetCodes = {};
    }
    global.passwordResetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime.getTime()
    };

    // TODO: Send email with verification code
    // For development, log to console
    console.log(`🔐 Password Reset Code for ${email}: ${verificationCode}`);

    res.json({
      success: true,
      message: 'Verification code sent to email',
      // For development only - remove in production
      devCode: verificationCode
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Forgot Password - Step 2: Verify code and reset password
app.post('/auth/reset-password', async (req, res) => {
  const { email, verificationCode, newPassword, confirmPassword } = req.body;

  if (!email || !verificationCode || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  // Check verification code
  if (!global.passwordResetCodes || !global.passwordResetCodes[email]) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  const { code, expiry } = global.passwordResetCodes[email];

  // Check if code matches and hasn't expired
  if (code !== verificationCode || Date.now() > expiry) {
    delete global.passwordResetCodes[email];
    return res.status(400).json({ message: 'Invalid or expired verification code' });
  }

  try {
    // Find user and update password
    const { data: user, error } = await db
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await db
      .from('users')
      .update({ password_hash: hash })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to reset password' });
    }

    // Clear verification code
    delete global.passwordResetCodes[email];

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Verify activation token
app.get('/auth/verify-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, employee_id, name, email')
      .eq('activation_token', token)
      .eq('account_status', 'PENDING')
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'Invalid activation token' });
    }

    // Check if token has expired
    if (new Date(user.activation_expiry) < new Date()) {
      return res.status(400).json({ message: 'Activation token has expired' });
    }

    res.json({
      valid: true,
      user: {
        employeeId: user.employee_id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== ATTENDANCE ROUTES ==========

// Check-in/Check-out
app.post('/attendance/check-in', authenticateToken, upload.single('image'), async (req, res) => {
  const { employeeId, method, source } = req.body;
  const targetEmployeeId = employeeId || req.user.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get user ID
    const { data: user, error: userError } = await db
      .from('users')
      .select('id')
      .eq('employee_id', targetEmployeeId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user.id;

    // Check existing attendance for today
    const { data: attendance, error: attendanceError } = await db
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    let imageUrl = null;

    // Upload image to Supabase if provided
    if (req.file && supabase) {
      const fileName = `${today}/${targetEmployeeId}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'attendance-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600'
        });

      if (!error) {
        imageUrl = supabase.storage
          .from(process.env.SUPABASE_BUCKET || 'attendance-images')
          .getPublicUrl(fileName).data.publicUrl;
      }
    }

    const now = new Date().toISOString();

    if (!attendance) {
      // First check-in of the day
      const { error: insertError } = await db
        .from('attendance')
        .insert({
          user_id: userId,
          date: today,
          check_in: now,
          method,
          image_url: imageUrl,
          source: source || 'scanner'
        });

      if (insertError) {
        return res.status(500).json({ message: 'Failed to record attendance' });
      }
      res.json({ action: 'check_in', message: 'Check-in recorded successfully' });
    } else if (attendance.check_in && !attendance.check_out) {
      // Check-out
      const { error: updateError } = await db
        .from('attendance')
        .update({
          check_out: now,
          image_url: imageUrl || attendance.image_url
        })
        .eq('id', attendance.id);

      if (updateError) {
        return res.status(500).json({ message: 'Failed to record check-out' });
      }
      res.json({ action: 'check_out', message: 'Check-out recorded successfully' });
    } else {
      res.status(400).json({ message: 'Attendance already completed for today' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get attendance records
app.get('/attendance/records', authenticateToken, async (req, res) => {
  const { startDate, endDate, department, employeeId } = req.query;
  
  try {
    let query = db
      .from('attendance')
      .select('*, users:user_id(employee_id, name, role, department)')
      .order('date', { ascending: false })
      .order('check_in', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: records, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Filter on client side if needed
    let filteredRecords = records || [];

    if (department && department !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.users?.department === department);
    }

    if (employeeId) {
      filteredRecords = filteredRecords.filter(r => r.users?.employee_id === employeeId);
    }

    res.json({ records: filteredRecords });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Update attendance record (admin only)
app.put('/attendance/records/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { check_in, check_out } = req.body;

  try {
    const { error } = await db
      .from('attendance')
      .update({ check_in, check_out })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to update attendance' });
    }
    res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Approve/Deny attendance record (admin/manager only)
app.put('/attendance/records/:id/approval', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Approved', 'Denied', 'Pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid approval status' });
  }

  try {
    const { error: updateError, data } = await db
      .from('attendance')
      .update({
        approval_status: status,
        approval_updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update approval status' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ success: true, message: `Attendance ${status.toLowerCase()}` });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== SALARY ROUTES ==========

// Get salary records
app.get('/salary/records', authenticateToken, async (req, res) => {
  const { startDate, endDate, status, employeeId } = req.query;
  const isEmployee = req.user.role === 'employee';

  try {
    let query = db
      .from('salary')
      .select('*, users:user_id(employee_id, name, role, department)')
      .order('period_end', { ascending: false });

    if (startDate) {
      query = query.gte('period_start', startDate);
    }
    if (endDate) {
      query = query.lte('period_end', endDate);
    }
    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: records, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }

    let filteredRecords = records || [];

    // Employees can only see their own records
    if (isEmployee) {
      filteredRecords = filteredRecords.filter(r => r.users?.employee_id === req.user.id);
    } else if (employeeId) {
      filteredRecords = filteredRecords.filter(r => r.users?.employee_id === employeeId);
    }

    res.json({ records: filteredRecords });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get single salary record
app.get('/salary/records/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: record, error } = await db
      .from('salary')
      .select('*, users:user_id(employee_id, name, role, department)')
      .eq('id', id)
      .single();

    if (error || !record) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    if (req.user.role === 'employee' && req.user.id !== record.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const userData = record.users;
    res.json({
      id: record.id,
      employeeId: userData?.employee_id,
      employeeName: userData?.name,
      position: userData?.role,
      department: userData?.department,
      salary: record.amount,
      status: record.status,
      releasedAt: record.released_at,
      claimedAt: record.claimed_at
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Update salary record (admin only)
app.put('/salary/records/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { baseSalary } = req.body;
  const amount = Number(baseSalary);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid salary amount' });
  }

  try {
    const { error } = await db
      .from('salary')
      .update({ amount })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to update salary record' });
    }
    res.json({ success: true, message: 'Salary record updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Add salary record (admin only)
app.post('/salary/add', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { employeeId, periodStart, periodEnd, amount, trips } = req.body;

  try {
    // Get user ID
    const { data: user, error: userError } = await db
      .from('users')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { data: inserted, error: insertError } = await db
      .from('salary')
      .insert({
        user_id: user.id,
        period_start: periodStart,
        period_end: periodEnd,
        amount,
        trips: trips || 0,
        status: 'Pending'
      })
      .select();

    if (insertError) {
      return res.status(500).json({ message: 'Failed to add salary record' });
    }

    res.json({
      success: true,
      id: inserted?.[0]?.id,
      message: 'Salary record added successfully'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Release salary (admin only)
app.put('/salary/release/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const now = new Date().toISOString();

  try {
    const { error } = await db
      .from('salary')
      .update({ status: 'Released', released_at: now })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to release salary' });
    }
    res.json({ success: true, message: 'Salary released successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Claim salary (employee or admin)
app.put('/salary/claim/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  try {
    // Verify ownership if employee
    if (req.user.role === 'employee') {
      const { data: record, error: fetchError } = await db
        .from('salary')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

      if (fetchError || !record) {
        return res.status(403).json({ message: 'Unauthorized or record not found' });
      }
    }

    const { error } = await db
      .from('salary')
      .update({ status: 'Claimed', claimed_at: now })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to claim salary' });
    }
    res.json({ success: true, message: 'Salary claimed successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== EMPLOYEE ROUTES ==========

// Get all employees
app.get('/employees', authenticateToken, async (req, res) => {
  const { department, status } = req.query;
  
  try {
    let query = db
      .from('users')
      .select('id, employee_id, name, email, role, department, status, created_at, profile_image_url, qr_code, qr_image_url, position, phone')
      .order('created_at', { ascending: false });

    if (department && department !== 'All') {
      query = query.eq('department', department);
    }
    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: employees, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ employees: employees || [] });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get single employee
app.get('/employees/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: employee, error } = await db
      .from('users')
      .select('id, employee_id, name, email, role, department, status, created_at, profile_image_url, qr_code, qr_image_url, position, phone')
      .eq('employee_id', id)
      .single();

    if (error || !employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ employee });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Add employee (admin only) - Auto-creates user account with activation token
app.post('/employees', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { employeeId, name, email, role, department, position, phone } = req.body;

  // Validate required fields
  if (!employeeId || !name || !email || !role || !department) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Generate activation token and expiry
    const crypto = require('crypto');
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiry = new Date();
    activationExpiry.setHours(activationExpiry.getHours() + 24); // Expires in 24 hours

    const timestamp = Date.now();
    const qrCode = `${employeeId}|${timestamp}|${Math.random().toString(36).substr(2, 9)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;

    // Create user account with PENDING status (no password yet)
    const { data: inserted, error: insertError } = await db
      .from('users')
      .insert({
        employee_id: employeeId,
        name,
        email,
        role,
        department,
        position: position || department,
        phone: phone || '',
        account_status: 'PENDING',
        activation_token: activationToken,
        activation_expiry: activationExpiry.toISOString(),
        qr_code: qrCode,
        qr_image_url: qrImageUrl,
        status: 'active'
      })
      .select();

    if (insertError) {
      if (insertError.message.includes('duplicate') || insertError.code === '23505') {
        return res.status(400).json({ message: 'Employee ID or email already exists' });
      }
      return res.status(500).json({ message: 'Failed to add employee' });
    }

    // TODO: Send activation email here
    // For now, return the setup link for development
    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-password?token=${activationToken}`;

    res.json({
      success: true,
      id: inserted?.[0]?.id,
      message: 'Employee account created. Activation link sent to email.',
      setupLink: setupLink, // For development only
      qrCode,
      qrImageUrl
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Update employee (admin only)
app.put('/employees/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { name, email, role, department, status, position, phone } = req.body;

  try {
    const { error } = await db
      .from('users')
      .update({ name, email, role, department, status, position, phone })
      .eq('employee_id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to update employee' });
    }
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Delete employee (admin only)
app.delete('/employees/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    const { error } = await db
      .from('users')
      .delete()
      .eq('employee_id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to delete employee' });
    }
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== DASHBOARD ROUTES ==========

// Get dashboard statistics
app.get('/dashboard/stats', authenticateToken, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const isEmployee = req.user.role === 'employee';

  try {
    if (isEmployee) {
      // Employee dashboard stats
      const { data: userRecord, error: userError } = await db
        .from('users')
        .select('id')
        .eq('employee_id', req.user.id)
        .single();

      if (userError || !userRecord) {
        return res.status(500).json({ message: 'Database error' });
      }

      const userId = userRecord.id;

      // Get days present in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: attendanceData, error: attendanceError } = await db
        .from('attendance')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgoStr);

      // Get latest released salary
      const { data: latestSalary } = await db
        .from('salary')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'Released')
        .order('period_end', { ascending: false })
        .limit(1)
        .single();

      // Get pending claims
      const { data: pendingData, error: pendingError } = await db
        .from('salary')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'Pending');

      res.json({
        stats: {
          days_present: attendanceData?.length || 0,
          latest_salary: latestSalary?.amount || 0,
          pending_claims: pendingData?.length || 0
        }
      });
    } else {
      // Admin/Manager dashboard stats
      // Total active employees
      const { data: employeeData, error: employeeError } = await db
        .from('users')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      // Today's attendance
      const { data: todayAttendance } = await db
        .from('attendance')
        .select('id', { count: 'exact' })
        .eq('date', today);

      // Pending salaries
      const { data: pendingSalaries } = await db
        .from('salary')
        .select('id, amount', { count: 'exact' })
        .eq('status', 'Pending');

      // Week attendance (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data: weekAttendance } = await db
        .from('attendance')
        .select('id', { count: 'exact' })
        .gte('date', sevenDaysAgoStr);

      const pendingAmount = (pendingSalaries || []).reduce((sum, s) => sum + (s.amount || 0), 0);

      res.json({
        stats: {
          total_employees: employeeData?.length || 0,
          today_present: todayAttendance?.length || 0,
          pending_salaries: pendingSalaries?.length || 0,
          pending_amount: pendingAmount,
          week_attendance: weekAttendance?.length || 0
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== PROFILE ROUTES ==========

// Upload profile photo
app.post('/users/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  let imageUrl = null;

  try {
    if (supabase) {
      const fileName = `profiles/${req.user.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'profile-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600'
        });

      if (!error) {
        imageUrl = supabase.storage
          .from(process.env.SUPABASE_BUCKET || 'profile-images')
          .getPublicUrl(fileName).data.publicUrl;
      }
    } else {
      // Fallback: save to local filesystem or return base64
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    // Get user ID first, then update profile
    const { data: user, error: userError } = await db
      .from('users')
      .select('id')
      .eq('employee_id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { error: updateError } = await db
      .from('users')
      .update({ profile_image_url: imageUrl })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    res.json({ success: true, imageUrl, message: 'Profile photo updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== USER PROFILE ROUTES ==========

// Get user profile
app.get('/users/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, employee_id, name, email, role, department, status, profile_image_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Update user profile
app.put('/users/profile', authenticateToken, async (req, res) => {
  const { name, email, department } = req.body;

  try {
    const { error } = await db
      .from('users')
      .update({ name, email, department })
      .eq('id', req.user.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== USER MANAGEMENT ROUTES ==========

// Get all users (admin only)
app.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { status } = req.query;

  try {
    let query = db
      .from('users')
      .select('id, employee_id, name, email, role, status, created_at')
      .order('created_at', { ascending: false });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: users, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }

    const transformed = (users || []).map(u => ({
      id: u.id,
      userId: u.employee_id,
      username: u.name.toLowerCase().replace(/\s+/g, '.'),
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      status: u.status,
      lastLogin: new Date(u.created_at).toLocaleDateString('en-US'),
      permissions: getPermissionsForRole(u.role)
    }));

    res.json({ users: transformed });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Helper function to get permissions by role
function getPermissionsForRole(role) {
  const permissions = {
    super_admin: ['View All', 'Edit All', 'Delete', 'Manage Users', 'Manage Salary', 'Manage Audit'],
    admin: ['View All', 'Edit All', 'Delete', 'Manage Users', 'Manage Salary'],
    manager: ['View All', 'Edit Own', 'Manage Attendance', 'Approve Corrections'],
    employee: ['View Own', 'Edit Own', 'Request Correction']
  };
  return permissions[role] || [];
}

// Disable/Enable user (admin only)
app.put('/users/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { error } = await db
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Failed to update user status' });
    }
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== QR CODE ROUTES ==========

// Generate QR code for employee
app.post('/qr/generate', authenticateToken, async (req, res) => {
  const { employeeId } = req.body;

  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // QR code data: employee_id|timestamp|hash
    const timestamp = Date.now();
    const qrData = `${employeeId}|${timestamp}|${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      qrCode: qrData,
      employeeId,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Validate QR code
app.post('/qr/validate', (req, res) => {
  const { qrCode } = req.body;

  // Simple validation: check format
  const parts = qrCode.split('|');
  if (parts.length !== 3) {
    return res.status(400).json({ valid: false, message: 'Invalid QR format' });
  }

  const [employeeId, timestamp, hash] = parts;
  const generatedTime = parseInt(timestamp);
  const currentTime = Date.now();
  const ageMinutes = (currentTime - generatedTime) / 60000;

  // QR codes valid for 24 hours
  if (ageMinutes > 1440) {
    return res.status(400).json({ valid: false, message: 'QR code expired' });
  }

  res.json({ valid: true, employeeId, ageMinutes: Math.round(ageMinutes) });
});

// ========== SALARY RECEIPT ROUTES ==========

// Generate salary receipt (PDF)
app.get('/salary/receipt/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: record, error } = await db
      .from('salary')
      .select('*, users:user_id(employee_id, name, email, department)')
      .eq('id', id)
      .single();

    if (error || !record) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    // Verify authorization
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.id !== record.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const userData = record.users;

    // Create PDF
    const doc = new PDFDocument({ bufferPages: true, margin: 50 });
    const filename = `salary_receipt_${userData?.employee_id}_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Gracewell NEXUS', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('SALARY RECEIPT', { align: 'center' });
    doc.moveDown(0.5);

    // Receipt Details
    doc.fontSize(12).font('Helvetica-Bold').text('Receipt Number:', { underline: true });
    doc.font('Helvetica').text(`SAL-${record.id}-${new Date().getFullYear()}`);
    doc.moveDown(0.3);

    doc.fontSize(12).font('Helvetica-Bold').text('Date Issued:', { underline: true });
    doc.font('Helvetica').text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    doc.moveDown(1);

    // Employee Information
    doc.fontSize(13).font('Helvetica-Bold').text('EMPLOYEE INFORMATION', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${userData?.name}`);
    doc.text(`Employee ID: ${userData?.employee_id}`);
    doc.text(`Department: ${userData?.department}`);
    doc.text(`Email: ${userData?.email}`);
    doc.moveDown(1);

    // Salary Details
    doc.fontSize(13).font('Helvetica-Bold').text('SALARY DETAILS', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`Period: ${record.period_start} to ${record.period_end}`);
    doc.text(`Amount: ₱${(record.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    doc.text(`Status: ${record.status}`);
    doc.text(`Released Date: ${record.released_at ? new Date(record.released_at).toLocaleDateString('en-US') : 'Not Released'}`);
    doc.moveDown(1);

    // Footer
    doc.fontSize(10).font('Helvetica').text('This is an official receipt. Keep it for your records.', { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, { align: 'center' });

    doc.end();
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== REPORTS/EXPORT ROUTES ==========

// Export attendance report
app.post('/reports/attendance', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { startDate, endDate, format = 'json' } = req.body;

  try {
    const { data: records, error } = await db
      .from('attendance')
      .select('*, users:user_id(employee_id, name, department)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (format === 'csv') {
      const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out'];
      const rows = (records || []).map(r => [
        r.users?.employee_id,
        r.users?.name,
        r.users?.department,
        r.date,
        r.check_in ? new Date(r.check_in).toLocaleTimeString() : '-',
        r.check_out ? new Date(r.check_out).toLocaleTimeString() : '-'
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="attendance_${startDate}_${endDate}.csv"`);
      res.send(csv);
    } else {
      res.json({ records: records || [], format: 'json', generatedAt: new Date().toISOString() });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Export salary report
app.post('/reports/salary', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { startDate, endDate, format = 'json' } = req.body;

  try {
    const { data: records, error } = await db
      .from('salary')
      .select('*, users:user_id(employee_id, name, department)')
      .gte('period_end', startDate)
      .lte('period_end', endDate)
      .order('period_end', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (format === 'csv') {
      const headers = ['Employee ID', 'Name', 'Department', 'Period Start', 'Period End', 'Amount', 'Status'];
      const rows = (records || []).map(r => [
        r.users?.employee_id,
        r.users?.name,
        r.users?.department,
        r.period_start,
        r.period_end,
        r.amount,
        r.status
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="salary_${startDate}_${endDate}.csv"`);
      res.send(csv);
    } else {
      res.json({ records: records || [], format: 'json', generatedAt: new Date().toISOString() });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== AUDIT LOG ROUTES ==========

app.post('/audit/log', authenticateToken, async (req, res) => {
  const { action, details } = req.body;
  const userId = req.user.id;

  try {
    const { error } = await db
      .from('audit_log')
      .insert({
        user_id: userId,
        action,
        details: JSON.stringify(details)
      });

    if (error) {
      console.error('Audit log error:', error);
      return res.status(500).json({ message: 'Failed to log audit' });
    }
    res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get audit logs (admin only)
app.get('/audit/logs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { limit = 100, offset = 0 } = req.query;

  try {
    const { data: logs, error } = await db
      .from('audit_log')
      .select('*, users:user_id(employee_id, name)')
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ logs: logs || [] });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== ADMIN DATABASE MANAGEMENT ==========

// Get database statistics
app.get('/admin/database/stats', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    // Count users
    const { count: totalUsers } = await db
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Count active employees
    const { count: activeEmployees } = await db
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('role', 'employee');

    // Count attendance records
    const { count: attendanceRecords } = await db
      .from('attendance')
      .select('*', { count: 'exact', head: true });

    // Count salary records
    const { count: salaryRecords } = await db
      .from('salary')
      .select('*', { count: 'exact', head: true });

    // Get distinct roles
    const { data: roles } = await db
      .from('users')
      .select('role', { distinct: true });

    res.json({
      totalUsers: totalUsers || 0,
      activeEmployees: activeEmployees || 0,
      attendanceRecords: attendanceRecords || 0,
      salaryRecords: salaryRecords || 0,
      totalRoles: roles?.length || 0,
      databaseSize: 'Unknown'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get table data
app.get('/admin/database/tables/:tableName', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { tableName } = req.params;
  const limit = req.query.limit || 1000;

  // Sanitize table name to prevent SQL injection
  const allowedTables = ['users', 'attendance', 'salary', 'audit_log'];
  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ message: 'Invalid table name' });
  }

  try {
    const { data: rows, error } = await db
      .from(tableName)
      .select('*')
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
    res.json(rows || []);
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Delete record from table
app.delete('/admin/database/tables/:tableName/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { tableName, id } = req.params;
  const allowedTables = ['users', 'attendance', 'salary', 'audit_log'];

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ message: 'Invalid table name' });
  }

  try {
    // Determine the ID column
    const idColumn = tableName === 'users' ? 'employee_id' : 'id';

    const { error } = await db
      .from(tableName)
      .delete()
      .or(`id.eq.${id},${idColumn}.eq.${id}`);

    if (error) {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Clear entire table (admin only)
app.delete('/admin/database/tables/:tableName/clear', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  const { tableName } = req.params;
  const allowedTables = ['audit_log'];

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ message: 'Cannot clear this table' });
  }

  try {
    const { error } = await db
      .from(tableName)
      .delete()
      .neq('id', '');

    if (error) {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
    res.json({ message: 'Table cleared successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Export table as CSV
app.get('/admin/database/export/:tableName', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { tableName } = req.params;
  const allowedTables = ['users', 'attendance', 'salary', 'audit_log'];

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ message: 'Invalid table name' });
  }

  try {
    const { data: rows, error } = await db
      .from(tableName)
      .select('*');

    if (error) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'No data to export' });
    }

    // Convert to CSV
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [headers, ...rows.map(row =>
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    )].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.csv"`);
    res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ========== HEALTH CHECK ==========

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`✅ Gracewell NEXUS Backend running on http://localhost:${PORT}`);
  console.log(`📊 Database: Supabase`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Using default (CHANGE IN PRODUCTION!)'}`);
  console.log(`📦 Supabase: ${supabase ? 'Connected' : 'Not configured'}`);

  // Initialize database (seed users if needed)
  try {
    console.log('Checking database tables...');
    if (db.initialize) {
      await db.initialize();
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
});

module.exports = app;
