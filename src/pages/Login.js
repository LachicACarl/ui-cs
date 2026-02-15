import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { loginUser, logAudit } from '../utils/authService';
import { apiClient } from '../utils/authService';

const Login = ({ setUser }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(true);
  const [employeeChecked, setEmployeeChecked] = useState(false);
  const navigate = useNavigate();

  const checkEmployeeId = async (id) => {
    if (!id.trim()) {
      setEmployeeChecked(false);
      setRequiresPassword(true);
      return;
    }

    try {
      const { data } = await apiClient.post('/auth/check-employee', {
        employeeId: id.trim()
      });

      if (data?.found) {
        setRequiresPassword(data.requiresPassword);
        setEmployeeChecked(true);
        setErrorMessage('');
      }
    } catch (err) {
      setEmployeeChecked(false);
      setRequiresPassword(true);
    }
  };

  const handleEmployeeIdChange = (e) => {
    const id = e.target.value;
    setEmployeeId(id);
    checkEmployeeId(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!employeeId) {
      setErrorMessage('Please enter Employee ID');
      setIsLoading(false);
      return;
    }

    if (requiresPassword && !password) {
      setErrorMessage('Please enter Password');
      setIsLoading(false);
      return;
    }

    // For employees, send without password. For admin/manager, send with password
    const result = await loginUser(employeeId, requiresPassword ? password : '');

    if (result.success) {
      setUser(result.user);
      
      // Log successful login
      await logAudit('LOGIN', { 
        employeeId: result.user.employeeId, 
        role: result.user.userRole,
        timestamp: new Date().toISOString()
      });
      
      // Redirect based on role and mode
      setTimeout(() => {
        // If employee and no password (QR attendance mode)
        if (result.user.userRole === 'employee' && result.user.isAttendanceMode) {
          navigate('/attendance-scanner');
        } else if (result.user.userRole === 'super_admin' || result.user.userRole === 'admin') {
          navigate('/admin');
        } else if (result.user.userRole === 'manager') {
          navigate('/manager');
        } else {
          navigate('/employee');
        }
      }, 300);
    } else {
      setErrorMessage(result.error || 'Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setResetMessage('');

    if (!forgotEmail) {
      setResetMessage('Please enter your email address');
      return;
    }

    // Simulate email sending
    setResetMessage('✅ Password reset link has been sent to your email. Please check your inbox.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotEmail('');
      setResetMessage('');
    }, 3000);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo-circle">
          <div className="logo-content">
            {/* Add your logo image here: <img src="/path/to/logo.png" alt="Logo" /> */}
            <div className="pinwheel-icon">⚙</div>
          </div>
        </div>
        <h2>Login</h2>
        <p>{requiresPassword ? 'Please Enter your ID and Password' : 'Enter your Employee ID for QR Attendance'}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter Employee ID"
              value={employeeId}
              onChange={handleEmployeeIdChange}
              disabled={isLoading}
              className="login-input"
              autoFocus
            />
            {employeeChecked && !requiresPassword && (
              <p className="helper-text">✅ Employee ID found - Password not required for QR attendance</p>
            )}
          </div>

          {requiresPassword && (
            <div className="form-group">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="login-input"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || (requiresPassword && !employeeId) || (requiresPassword && !password)}
            className="login-btn"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          {errorMessage && (
            <div className="error-message">
              ❌ {errorMessage}
            </div>
          )}
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-footer">
          <Link 
            to="/forgot-password"
            className="forgot-password-btn"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                  setResetMessage('');
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="reset-form">
              <p className="reset-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="login-input"
                />
              </div>

              {resetMessage && (
                <div className={`reset-message ${resetMessage.includes('✅') ? 'success' : 'error'}`}>
                  {resetMessage}
                </div>
              )}

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                    setResetMessage('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
