import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin') {
    if (user.userRole !== 'admin') {
      return <Navigate to={user.userRole === 'manager' ? '/manager' : '/employee'} replace />;
    }
  } else if (requiredRole === 'manager') {
    if (user.userRole !== 'admin' && user.userRole !== 'manager') {
      return <Navigate to="/employee" replace />;
    }
  } else if (requiredRole === 'employee') {
    if (user.userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.userRole === 'manager') {
      return <Navigate to="/manager" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
