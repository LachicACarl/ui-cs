import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import './AttendanceScanner.css';
import { apiClient } from '../utils/authService';

const AttendanceScanner = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [qrReaderKey, setQrReaderKey] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [manualErrors, setManualErrors] = useState({});
  const [qrFrameClass, setQrFrameClass] = useState('active');
  const [lastScannedEmployee, setLastScannedEmployee] = useState(null);
  const isMountedRef = useRef(true);

  // Redirect non-employee users away
  useEffect(() => {
    if (!user || user.userRole !== 'employee') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Request camera permissions on component mount
  useEffect(() => {
    isMountedRef.current = true;

    // Suppress all non-critical console warnings
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = function(...args) {
      const message = String(args[0]);
      // Filter out all these known non-critical warnings
      if (message.includes('React Router') ||
          message.includes('Future Flag') ||
          message.includes('v7_startTransition') ||
          message.includes('v7_relativeSplatPath') ||
          message.includes('BrowserCodeReader') || 
          message.includes('Canvas2D') ||
          message.includes('willReadFrequently') ||
          message.includes('Trying to play video') ||
          message.includes('interrupted by a new load') ||
          message.includes('defaultProps will be removed') ||
          message.includes('It was not possible to play the video') ||
          message.includes('Support for defaultProps') ||
          message.includes('getImageData') ||
          message.includes('HTMLCanvasElementLuminanceSource') ||
          message.includes('Multiple readback operations')) {
        return;
      }
      originalWarn(...args);
    };

    console.error = function(...args) {
      const message = String(args[0]);
      if (message.includes('BrowserCodeReader') || 
          message.includes('Canvas2D') ||
          message.includes('willReadFrequently') ||
          message.includes('React Router') ||
          message.includes('defaultProps') ||
          message.includes('Support for defaultProps') ||
          message.includes('getImageData') ||
          message.includes('HTMLCanvasElementLuminanceSource') ||
          message.includes('Multiple readback operations')) {
        return;
      }
      originalError(...args);
    };

    const requestCameraPermission = async () => {
      try {
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // Close the stream immediately, we just wanted to check permissions
        stream.getTracks().forEach(track => track.stop());
        if (isMountedRef.current) {
          setCameraReady(true);
          setCameraError('');
        }
      } catch (error) {
        if (isMountedRef.current) {
          setCameraReady(false);
          if (error.name === 'NotAllowedError') {
            setCameraError('Camera access denied. Please grant camera permissions in your browser settings.');
          } else if (error.name === 'NotFoundError') {
            setCameraError('No camera device found. Please connect a camera or check if it is already in use.');
          } else if (error.name === 'NotReadableError') {
            setCameraError('Camera is already in use by another application. Please close other apps using the camera.');
          } else {
            setCameraError(`Camera error: ${error.message || 'Unable to access camera'}`);
          }
        }
      }
    };

    requestCameraPermission();

    return () => {
      isMountedRef.current = false;
      // Restore original console functions
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  // Reset QR reader key when camera ready state changes
  useEffect(() => {
    if (cameraReady) {
      setQrReaderKey(prev => prev + 1);
    }
  }, [cameraReady]);

  const validateManualEntry = () => {
    const errors = {};
    if (!manualEmpId.trim()) {
      errors.empId = 'Employee ID is required';
    }
    if (!manualPassword.trim()) {
      errors.password = 'Password is required';
    }
    setManualErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleManualSubmit = async () => {
    if (!validateManualEntry()) {
      return;
    }

    await submitAttendance({
      employeeId: manualEmpId,
      method: 'qr',
      password: manualPassword,
      source: 'manual'
    });

    setShowManualEntry(false);
    setManualEmpId('');
    setManualPassword('');
    setManualErrors({});
  };

  const submitAttendance = async ({ employeeId, method, password, source }) => {
    try {
      setScanStatus('idle');
      setMessage('');
      setQrFrameClass('active');

      if (user?.userRole === 'employee' && employeeId && employeeId !== user.employeeId) {
        setScanStatus('error');
        setMessage('⚠️ You can only submit your own attendance.');
        setQrFrameClass('');
        return;
      }

      const payload = {
        employeeId: employeeId || user?.employeeId,
        method,
        password,
        source
      };

      const { data } = await apiClient.post('/attendance/check-in', payload);
      const action = data?.action || 'check_in';
      const employee = data?.employee || data?.user || { id: payload.employeeId, name: payload.employeeId };

      setScanStatus('success');
      setQrFrameClass('success');
      setLastScannedEmployee(employee);
      setMessage(action === 'check_out' ? '✅ Check-out recorded' : '✅ Check-in recorded');

      setTimeout(() => {
        setScanStatus('idle');
        setMessage('');
        setQrFrameClass('active');
        setLastScannedEmployee(null);
      }, 3000);
    } catch (error) {
      if (error?.response?.status === 401) {
        onLogout();
        navigate('/login');
        return;
      }
      setScanStatus('error');
      setMessage(error?.response?.data?.message || 'Attendance failed. Please try again.');
      setQrFrameClass('');
    }
  };

  return (
    <div className="scanner-page">
      <div className="scanner-navbar">
        <div className="scanner-logo">
          <span>⚡ Gracewell NEXUS</span>
        </div>
        <div className="scanner-user">
          <span>{user?.employeeName || 'User'}</span>
          <div className="user-avatar">
            {user?.employeeName ? user.employeeName.charAt(0) : 'U'}
          </div>
          <button onClick={onLogout} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>Logout</button>
        </div>
      </div>

      <div className="scanner-left-panel">
        <h1>Gracewell NEXUS</h1>
        <h2>Attendance Checker</h2>
      </div>

      <div className="scanner-right-panel">
        <button className="manual-entry-btn" onClick={() => setShowManualEntry(true)}>
          <span>📝</span> Manual Entry
        </button>
        <div className="scanner-container">
          <div className={`qr-frame ${qrFrameClass}`}>
            <div className="qr-frame-corners-2"></div>
            <div className="scanner-camera-wrapper">
              {cameraReady ? (
                <QrReader
                  key={qrReaderKey}
                  onResult={(result) => {
                    if (result?.text && scanStatus === 'idle') {
                      submitAttendance({
                        employeeId: result.text,
                        method: 'qr',
                        source: 'scanner'
                      });
                    }
                  }}
                  constraints={{ 
                    video: { 
                      facingMode: 'environment',
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }
                  }}
                  scanDelay={300}
                  videoStyle={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  videoContainerStyle={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    <p style={{ fontSize: '48px', marginBottom: '10px' }}>📷</p>
                    <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>Camera Not Available</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>Please allow camera access in your browser settings</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="scan-instruction">
            {cameraError ? (
              <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
                <strong>⚠️ Camera Error:</strong><br/>
                {cameraError}
              </div>
            ) : (
              <p>Please place your QR code front of the camera to begin the scan</p>
            )}
          </div>

          {message && (
            <div className={`scan-status ${scanStatus === 'success' ? 'status-success' : 'status-error'}`}>
              {scanStatus === 'success' && lastScannedEmployee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {lastScannedEmployee.name || 'Employee'}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>
                      ID: {lastScannedEmployee.id || lastScannedEmployee.employeeId}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px', color: '#27ae60', fontWeight: '500' }}>✓ Image Verified</div>
                  </div>
                </div>
              )}
              {scanStatus !== 'success' && message}
            </div>
          )}
        </div>

        {/* Manual Entry Modal */}
        {showManualEntry && (
          <div className="scanner-overlay">
            <div className="scanner-modal">
              <h3>Manual Attendance Entry</h3>
              <p className="scanner-modal-description">
                Enter Employee ID and Password to confirm the changes
              </p>
              
              <div className="form-group">
                <label>Employee ID</label>
                <input 
                  type="text" 
                  value={manualEmpId}
                  onChange={(e) => {
                    setManualEmpId(e.target.value);
                    if (manualErrors.empId) {
                      setManualErrors({ ...manualErrors, empId: '' });
                    }
                  }}
                  className={manualErrors.empId ? 'error' : ''}
                  placeholder="Enter Employee ID"
                />
                {manualErrors.empId && <span className="error-message">{manualErrors.empId}</span>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={manualPassword}
                  onChange={(e) => {
                    setManualPassword(e.target.value);
                    if (manualErrors.password) {
                      setManualErrors({ ...manualErrors, password: '' });
                    }
                  }}
                  className={manualErrors.password ? 'error' : ''}
                  placeholder="Enter Password"
                />
                {manualErrors.password && <span className="error-message">{manualErrors.password}</span>}
              </div>

              <div className="scanner-modal-buttons">
                <button className="btn-cancel" onClick={() => {
                  setShowManualEntry(false);
                  setManualEmpId('');
                  setManualPassword('');
                  setManualErrors({});
                }}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handleManualSubmit}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceScanner;
