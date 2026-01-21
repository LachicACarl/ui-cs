import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import FaceDetection from './pages/FaceDetection';
import AttendanceManagement from './pages/AttendanceManagement';
import SalaryTracker from './pages/SalaryTracker';
import EmployeeRecords from './pages/EmployeeRecords';
import UserManagement from './pages/UserManagement';
import ProfileSetting from './pages/ProfileSetting';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const employeeId = localStorage.getItem('employeeId');
    const userRole = localStorage.getItem('userRole');
    
    if (employeeId && userRole) {
      setUser({
        employeeId,
        employeeName: localStorage.getItem('employeeName'),
        userRole,
        isAdmin: localStorage.getItem('isAdmin') === 'true',
        isManager: localStorage.getItem('isManager') === 'true'
      });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isManager');
    setUser(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={user} requiredRole="admin">
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
            <ProtectedRoute user={user} requiredRole="manager">
              <AttendanceManagement user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/salary" 
          element={
            <ProtectedRoute user={user} requiredRole="manager">
              <SalaryTracker user={user} onLogout={handleLogout} />
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
              <ProfileSetting user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to={user ? (user.userRole === 'admin' ? '/admin' : user.userRole === 'manager' ? '/manager' : '/employee') : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
