import React from 'react';
import Navbar from '../components/Navbar';
import './FaceDetection.css';

const FaceDetection = ({ user, onLogout }) => {
  const handleScanClick = () => {
    alert('Face Detection: Click to start scanning');
  };

  return (
    <div className="face-detection-container">
      <Navbar user={user} onLogout={onLogout} />

      <div className="face-detection-content">
        <div className="scan-box">
          <div className="camera-frame">
            <div className="camera-placeholder">
              <span style={{ fontSize: '48px' }}>📷</span>
              <p>Face Detection Camera</p>
              <p style={{ fontSize: '12px', color: '#999' }}>Initializing...</p>
            </div>
          </div>
          
          <div className="scan-info">
            <h2>Employee Check-in</h2>
            <p id="instruction">Click to start scanning</p>
            <button className="scan-btn" onClick={handleScanClick}>
              🔍 Start Scan
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
              Position your face within the frame
            </p>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-log">
            <div className="log-item">
              <span>Check-in Successful</span>
              <span className="time">Today, 09:15 AM</span>
            </div>
            <div className="log-item">
              <span>Check-out Successful</span>
              <span className="time">Yesterday, 05:45 PM</span>
            </div>
            <div className="log-item">
              <span>Check-in Successful</span>
              <span className="time">Jan 18, 2026, 09:10 AM</span>
            </div>
            <div className="log-item">
              <span>Check-out Successful</span>
              <span className="time">Jan 18, 2026, 05:50 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetection;
