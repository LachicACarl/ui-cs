import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setUser }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const adminIds = ['A001', 'A002', 'A003', 'admin'];
  const managerIds = ['M001', 'M002', 'M003', 'manager'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const id = employeeId.trim().toLowerCase();

    if (!id || !password) {
      setErrorMessage('Invalid credentials. Please try again.');
      return;
    }

    let displayName = id;
    let userRole = 'employee';
    let isAdmin = false;
    let isManager = false;

    if (id === 'admin') displayName = 'Admin User';
    if (id === 'manager') displayName = 'Manager User';
    if (id === 'employee') displayName = 'Employee User';

    if (adminIds.includes(id)) {
      userRole = 'admin';
      isAdmin = true;
    } else if (managerIds.includes(id)) {
      userRole = 'manager';
      isManager = true;
    }

    // Store in localStorage
    localStorage.setItem('employeeId', id);
    localStorage.setItem('employeeName', displayName);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isAdmin', isAdmin.toString());
    localStorage.setItem('isManager', isManager.toString());

    // Update user state
    setUser({
      employeeId: id,
      employeeName: displayName,
      userRole,
      isAdmin,
      isManager
    });

    // Redirect based on role
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'manager') {
      navigate('/manager');
    } else {
      navigate('/employee');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="logo.png" alt="Company Logo" />
        <h2>Login</h2>
        <p>Please Enter your ID and Password</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>

        <div className="demo-info">
          <strong>Test Credentials:</strong>
          <p><strong>Admin Dashboard:</strong> admin</p>
          <p><strong>Manager Dashboard:</strong> manager</p>
          <p><strong>Employee Dashboard:</strong> employee</p>
          <p style={{ marginTop: '8px', fontSize: '11px' }}>Password: any value</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
