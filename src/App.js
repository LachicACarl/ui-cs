import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import FaceAuth from './pages/FaceAuth';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import FaceDetection from './pages/FaceDetection';
import AttendanceManagement from './pages/AttendanceManagement';
import SalaryTracker from './pages/SalaryTracker';
import ViewSalaryRecord from './pages/ViewSalaryRecord';
import EmployeeRecords from './pages/EmployeeRecords';
import UserManagement from './pages/UserManagement';
import ProfileSetting from './pages/ProfileSetting';
import AttendanceScanner from './pages/AttendanceScanner';
import QRCodeGenerator from './pages/QRCodeGenerator';
import ProtectedRoute from './components/ProtectedRoute';
import { verifySession, logoutUser } from './utils/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const authData = await verifySession();

      if (!isMounted) return;

      if (authData) {
        const profileImage = localStorage.getItem('userProfileImage');
        setUser({ ...authData, profileImage: profileImage || authData.profileImage });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    logoutUser();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0a192f 0%, #1a3a5c 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/face-auth" element={<FaceAuth setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/qr-generator" element={<QRCodeGenerator />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={user} requiredRole="admin-super">
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute user={user} requiredRole="manager">
              <ManagerDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employee" 
          element={
            <ProtectedRoute user={user} requiredRole="employee">
              <EmployeeDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/attendance-scanner" 
          element={
            <ProtectedRoute user={user} requiredRole="employee">
              <AttendanceScanner user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/face-detection" 
          element={
            <ProtectedRoute user={user} requiredRole="employee">
              <FaceDetection user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute user={user} requiredRole="admin-super">
              <AttendanceManagement user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/salary" 
          element={
            <ProtectedRoute user={user} requiredRole="admin-super">
              <SalaryTracker user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/salary-manager" 
          element={
            <ProtectedRoute user={user} requiredRole="manager-super">
              <SalaryTracker user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/salary-record" 
          element={
            <ProtectedRoute user={user} requiredRole="manager-super">
              <ViewSalaryRecord user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/records" 
          element={
            <ProtectedRoute user={user} requiredRole="manager">
              <EmployeeRecords user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/users" 
          element={
            <ProtectedRoute user={user} requiredRole="manager">
              <UserManagement user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user}>
              <ProfileSetting user={user} onLogout={handleLogout} setUser={setUser} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={<Navigate to={user ? (user.userRole === 'super_admin' || user.userRole === 'admin' ? '/admin' : user.userRole === 'manager' ? '/manager' : '/employee') : '/login'} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
