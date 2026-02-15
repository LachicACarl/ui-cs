# Gracewell NEXUS - Full Stack Attendance System

Complete Employee Management System with **Backend API**, JWT authentication, QR/Face attendance, and audit logging.

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd server
npm install
npm start
```

Backend runs on `http://localhost:4000`

### 2. Frontend Setup

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## ✨ Features

### ✅ Implemented
- **JWT Authentication** (Backend-issued tokens)
- **Role-Based Access Control** (Admin, Manager, Employee)
- **QR Code Attendance** (Webcam scanning)
- **Face Capture** (Live webcam with image upload)
- **Audit Logging** (Login, logout, attendance, salary actions)
- **CSV Export** (Salary records)
- **SQLite Database** (WAL mode)
- **Supabase Integration** (Optional image storage)

### 📋 Core Modules
1. **Authentication & User Access**
2. **Attendance Monitoring** (QR-based + Face capture)
3. **Salary Tracking** (Admin add/release, Manager view, Employee view own)
4. **Employee Records Management**
5. **User Management** (Admin-only)
6. **Audit Trail**

## 🔐 Test Credentials

| Employee ID | Password | Role |
|------------|----------|------|
| SA001 | admin123 | Super Admin |
| A001 | admin123 | Admin |
| M001 | manager123 | Manager |
| E001 | emp123 | Employee |
| E002 | emp123 | Employee |

## Project Structure

```
src/
├── components/
│   ├── Navbar.js
│   ├── Navbar.css
│   └── ProtectedRoute.js
├── pages/
│   ├── Login.js
│   ├── Login.css
│   ├── AdminDashboard.js
│   ├── AdminDashboard.css
│   ├── ManagerDashboard.js
│   ├── ManagerDashboard.css
│   ├── EmployeeDashboard.js
│   ├── EmployeeDashboard.css
│   ├── FaceDetection.js
│   └── FaceDetection.css
├── App.js
├── App.css
├── index.js
└── index.css
```

## Technologies Used

- **React**: Frontend framework
- **React Router**: Client-side routing
- **Chart.js & react-chartjs-2**: Data visualization
- **CSS3**: Styling

## Features by Role

### Admin
- View system logs and alerts
- Monitor recent activities
- System administration controls
- Access to all features

### Manager
- Approve/deny employee time corrections
- View department statistics
- Manage employee attendance
- Oversight of department operations

### Employee
- View personal attendance
- Check salary status
- Face detection check-in
- View personal records

## Security

- Protected routes based on user role
- LocalStorage authentication
- Automatic redirects for unauthorized access
- Session management with logout functionality

## Future Enhancements

- Backend API integration
- Database connection
- Real face detection implementation
- Email notifications
- Advanced reporting
- User profile customization
