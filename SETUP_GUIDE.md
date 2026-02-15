# 🚀 Gracewell NEXUS - Complete Setup Guide

## Prerequisites
- Node.js 16+ installed
- npm installed
- Modern web browser with webcam access

---

## Step 1: Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend:**
   ```bash
   npm start
   ```

   You should see:
   ```
   ✅ Gracewell NEXUS Backend running on http://localhost:4000
   📊 Database: database.sqlite
   🔐 JWT Secret: Configured
   📦 Supabase: Not configured
   ```

4. **Keep this terminal running** ✅

---

## Step 2: Frontend Setup

1. **Open a NEW terminal** in the project root

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm start
   ```

4. **Browser opens automatically** at `http://localhost:3000`

---

## Step 3: Test the System

### Login
Use these credentials:

| User | ID | Password | Access |
|------|-----|----------|--------|
| Admin | `A001` | `admin123` | Full system access |
| Manager | `M001` | `manager123` | View reports, manage team |
| Employee | `E001` | `emp123` | Own attendance & salary |

### Test Attendance

1. **Login as Employee** (`E001` / `emp123`)
2. Click **Attendance Scanner** in navbar
3. Allow webcam access
4. Scan a QR code OR use Manual Entry
5. Check audit logs (backend console)

### Test Face Capture

1. Go to **Face Detection** page
2. Click **Start Camera**
3. Click **Capture Face**
4. Image uploaded to backend

### Test Salary Export

1. **Login as Admin** (`A001` / `admin123`)
2. Go to **Employee Salary Tracker**
3. Click **Export** → **CSV**
4. File downloads automatically

---

## ✅ System Status Check

### Backend Health
Visit: `http://localhost:4000/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T..."
}
```

### Database
Located at: `server/database.sqlite`

View tables:
- users
- attendance
- salary
- audit_log

---

## 🔧 Configuration (Optional)

### Enable Supabase Image Storage

1. Create Supabase project at https://supabase.com
2. Create bucket: `attendance-images`
3. Edit `server/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   SUPABASE_BUCKET=attendance-images
   ```
4. Restart backend

---

## 📊 Audit Trail

All actions are logged:

- Login/Logout
- QR Attendance
- Face Attendance
- Manual Attendance Override
- Salary Release
- Salary Export

View logs: `GET http://localhost:4000/audit/logs` (Admin only)

---

## 🎯 Next Steps

1. ✅ Test all user roles
2. ✅ Verify attendance flow
3. ✅ Check audit logs
4. 📝 Document for thesis
5. 🚀 Deploy to production

---

## 🐛 Troubleshooting

### "Login failed"
- Check backend is running on port 4000
- Check `.env` file exists in root (`REACT_APP_API_BASE_URL=http://localhost:4000`)

### "Camera access denied"
- Allow camera permissions in browser
- Use HTTPS in production

### "CORS error"
- Backend CORS is enabled for all origins
- Check backend console for errors

---

## 📞 Support

Backend logs: Check `server` terminal
Frontend logs: Check browser DevTools → Console

---

**Ready for Thesis Defense! 🎓**
