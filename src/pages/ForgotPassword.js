import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: verification, 3: reset
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Simulate sending verification code
    setMessage(`Verification code sent to ${email}`);
    setError('');
    setStep(2);
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    // Simulate verification (accept any 6-digit code or "123456")
    if (verificationCode.length === 6) {
      setMessage('Verification successful! Now set your new password.');
      setError('');
      setStep(3);
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one digit');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setMessage('Password reset successfully! Redirecting to login...');
    setError('');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="forgot-password-header">
          <h1>🔐 Password Recovery</h1>
          <p>Regain access to your Gracewell NEXUS account</p>
        </div>

        {step === 1 && (
          <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
            <h2>Step 1: Verify Your Email</h2>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="form-input"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <button type="submit" className="btn-submit">
              Send Verification Code
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-password-form" onSubmit={handleVerificationSubmit}>
            <h2>Step 2: Enter Verification Code</h2>
            <p className="step-info">
              We've sent a verification code to <strong>{email}</strong>
            </p>
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                className="form-input"
              />
              <small className="hint">Check your email for the code</small>
            </div>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <button type="submit" className="btn-submit">
              Verify Code
            </button>
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="forgot-password-form" onSubmit={handlePasswordReset}>
            <h2>Step 3: Set New Password</h2>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                className="form-input"
              />
              <small className="hint">
                At least 8 characters, 1 uppercase, 1 digit
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="form-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button type="submit" className="btn-submit">
              Reset Password
            </button>
            <button
              type="button"
              className="btn-back"
              onClick={() => {
                setStep(2);
                setError('');
                setMessage('');
              }}
            >
              Back
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="login-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
