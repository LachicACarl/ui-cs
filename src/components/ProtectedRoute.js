import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken, isTokenExpired } from '../utils/authService';

const ProtectedRoute = ({ user, requiredRole, children }) => {
  const token = getAccessToken();

  // Check if user is authenticated and token valid
  if (!token || isTokenExpired(token) || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check account status
  if (user.status === 'inactive') {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole === 'admin-super') {
    if (user.userRole !== 'admin' && user.userRole !== 'super_admin') {
      return <Navigate to={user.userRole === 'manager' ? '/manager' : '/employee'} replace />;
    }
  } else if (requiredRole === 'manager-super') {
    if (user.userRole !== 'manager' && user.userRole !== 'super_admin' && user.userRole !== 'admin') {
      return <Navigate to="/employee" replace />;
    }
  } else if (requiredRole === 'admin') {
    if (user.userRole !== 'admin') {
      return <Navigate to={user.userRole === 'manager' ? '/manager' : '/employee'} replace />;
    }
  } else if (requiredRole === 'manager') {
    if (user.userRole !== 'admin' && user.userRole !== 'super_admin' && user.userRole !== 'manager') {
      return <Navigate to="/employee" replace />;
    }
  } else if (requiredRole === 'employee') {
    if (user.userRole !== 'employee') {
      return <Navigate to={user.userRole === 'manager' ? '/manager' : '/admin'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
