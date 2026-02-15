-- Gracewell NEXUS Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('super_admin','admin','manager','employee')) NOT NULL,
  password_hash TEXT,
  status TEXT DEFAULT 'active',
  account_status TEXT DEFAULT 'PENDING',
  email TEXT,
  department TEXT,
  position TEXT,
  phone TEXT,
  profile_image_url TEXT,
  qr_code TEXT,
  qr_image_url TEXT,
  activation_token TEXT,
  activation_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  method TEXT CHECK(method IN ('face','qr','manual')),
  image_url TEXT,
  approval_status TEXT DEFAULT 'Pending',
  approval_updated_at TIMESTAMP,
  verified INTEGER DEFAULT 1,
  source TEXT DEFAULT 'scanner',
  UNIQUE(user_id, date)
);

-- Salary table
CREATE TABLE IF NOT EXISTS salary (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE,
  period_end DATE,
  amount DECIMAL(10,2) NOT NULL,
  trips INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  released_at DATE,
  claimed_at DATE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_salary_user_id ON salary(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_status ON salary(status);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON users
  FOR UPDATE USING (true);

-- Create policies for attendance table
CREATE POLICY "Enable read access for all users" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON attendance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON attendance
  FOR UPDATE USING (true);

-- Create policies for salary table
CREATE POLICY "Enable read access for all users" ON salary
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON salary
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON salary
  FOR UPDATE USING (true);

-- Create policies for audit_log table
CREATE POLICY "Enable read access for all users" ON audit_log
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON audit_log
  FOR INSERT WITH CHECK (true);
