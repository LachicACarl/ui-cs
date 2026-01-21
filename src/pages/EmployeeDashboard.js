import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import './EmployeeDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 19));
  const [filterActive, setFilterActive] = useState('today');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const [showNotifyAbsenceModal, setShowNotifyAbsenceModal] = useState(false);
  const [showRequestCorrectionModal, setShowRequestCorrectionModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [absenceData, setAbsenceData] = useState({
    date: '',
    reason: '',
    proof: null
  });

  const [correctionData, setCorrectionData] = useState({
    date: '',
    type: 'time-in',
    correctTime: '',
    reason: ''
  });

  const handleFilterByDate = (period) => {
    const today = new Date(2026, 0, 19);
    setFilterActive(period);

    if (period === 'today') {
      setCurrentDate(new Date(today));
    } else if (period === 'lastweek') {
      const date = new Date(today);
      date.setDate(date.getDate() - 7);
      setCurrentDate(date);
    } else if (period === 'lastmonth') {
      const date = new Date(today);
      date.setMonth(date.getMonth() - 1);
      setCurrentDate(date);
    }
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleNotifyAbsence = () => {
    setShowNotifyAbsenceModal(true);
  };

  const handleSubmitAbsence = () => {
    if (absenceData.date && absenceData.reason) {
      setAbsenceData({ date: '', reason: '', proof: null });
      setShowNotifyAbsenceModal(false);
      alert('Absence notification sent to admin');
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleRequestCorrection = () => {
    setShowRequestCorrectionModal(true);
  };

  const handleSubmitCorrection = () => {
    if (correctionData.date && correctionData.correctTime && correctionData.reason) {
      setCorrectionData({ date: '', type: 'time-in', correctTime: '', reason: '' });
      setShowRequestCorrectionModal(false);
      alert('Correction request sent to admin');
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleClaim = () => {
    alert('Payment claim confirmed. Admin has been notified.');
  };

  const handleViewReceipt = () => {
    setShowReceiptModal(true);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <>
      <div className="employee-container">
        <Navbar user={user} onLogout={handleLogout} />

        <div className="welcome">
          <h1>Welcome, {user?.employeeName || 'Employee'}</h1>
        </div>

        {/* Employee Profile Section */}
        <div className="employee-profile-card">
          <div className="profile-icon">□</div>
          <h2>Employee Profile</h2>
          <div className="profile-content">
            {/* Left Side - Profile Picture */}
            <div className="profile-left">
              <div className="profile-photo">
                <div className="avatar-placeholder">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image-display" />
                  ) : (
                    user?.employeeName?.substring(0, 2).toUpperCase() || 'EM'
                  )}
                </div>
              </div>
              <button className="btn-edit-profile" onClick={() => navigate('/profile')}>
                Edit Profile
              </button>
            </div>

            {/* Middle - Employee Details */}
            <div className="profile-middle">
              <div className="profile-details">
                <p><strong>First Name:</strong> {user?.employeeName?.split(' ')[0] || 'Roberta'}</p>
                <p><strong>Middle Name:</strong> Rubilyn</p>
                <p><strong>Last Name:</strong> {user?.employeeName?.split(' ').slice(1).join(' ') || 'Cortez Gonzales'}</p>
                <p><strong>Employee ID:</strong> EMP001</p>
                <p><strong>Email:</strong> rrg.gonzales@trucking.com</p>
                <p><strong>Contact No:</strong> 09162345693</p>
                <p><strong>Position:</strong> Truck Driver</p>
                <p><strong>Department:</strong> Operations</p>
              </div>
            </div>

            {/* Right Side - QR Code */}
            <div className="profile-right">
              <div className="qr-code-container">
                <div className="qr-code">
                  <QRCodeSVG 
                    value={`EMP001-${user?.employeeName || 'Employee'}-Gracewell NEXUS`}
                    size={150}
                    level="H"
                    includeMargin={true}
                    fgColor="#1e3a5f"
                    bgColor="#ffffff"
                  />
                </div>
                <p className="qr-label">Employee ID: EMP001</p>
                <p className="qr-sublabel">Scan this code for quick identification</p>
                <button className="btn-enlarge" title="Click to enlarge">
                  Click to Enlarge
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-label">Filter by Date:</span>
          <button 
            className={`filter-btn ${filterActive === 'today' ? 'active' : ''}`}
            onClick={() => handleFilterByDate('today')}
          >
            Today
          </button>
          <button 
            className={`filter-btn ${filterActive === 'lastweek' ? 'active' : ''}`}
            onClick={() => handleFilterByDate('lastweek')}
          >
            Last Week
          </button>
          <button 
            className={`filter-btn ${filterActive === 'lastmonth' ? 'active' : ''}`}
            onClick={() => handleFilterByDate('lastmonth')}
          >
            Last Month
          </button>
          <span className="date-display" style={{ marginLeft: 'auto' }}>
            {formatDate(currentDate)}
          </span>
        </div>

        <div className="dashboard">
          {/* Attendance Report Section */}
          <div className="report-card">
            <div className="report-header">
              <div className="report-title">
                <span className="report-icon">□</span>
                <h2>My Attendance Report</h2>
              </div>
              <div className="report-controls">
                <select className="filter-dropdown">
                  <option>Last Week</option>
                  <option>Last Month</option>
                  <option>This Month</option>
                </select>
                <button className="btn-notify" onClick={handleNotifyAbsence}>Notify Absence</button>
                <button className="btn-download" title="Download report">↓</button>
              </div>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Oct 27, 2025<br/>08:00 AM</td>
                  <td>Oct 30, 2025<br/>04:00 PM</td>
                  <td><span className="status-present">Present</span></td>
                  <td><button className="btn-action" onClick={handleRequestCorrection}>Request Correction</button></td>
                </tr>
                <tr>
                  <td>Oct 26, 2025<br/>07:45 AM</td>
                  <td>Oct 26, 2025<br/>05:30 PM</td>
                  <td><span className="status-present">Present</span></td>
                  <td><button className="btn-action" onClick={handleRequestCorrection}>Request Correction</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Salary Report Section */}
          <div className="report-card">
            <div className="report-header">
              <div className="report-title">
                <span className="report-icon">$</span>
                <h2>My Salary Report</h2>
              </div>
              <div className="report-controls">
                <select className="filter-dropdown">
                  <option>Last Week</option>
                  <option>Last Month</option>
                  <option>This Month</option>
                </select>
                <button className="btn-download" title="Download report">↓</button>
              </div>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Release Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>October 16-31, 2025</td>
                  <td>₱ 45,000</td>
                  <td><span className="status-pending">Pending</span></td>
                  <td>-</td>
                  <td>
                    <button className="btn-action-small" onClick={handleClaim}>Claim</button>
                    <button className="btn-action-small-primary" onClick={handleViewReceipt}>View Receipt</button>
                  </td>
                </tr>
                <tr>
                  <td>October 1-15, 2025</td>
                  <td>₱ 46,000</td>
                  <td><span className="status-released">Released</span></td>
                  <td>10/10/2025</td>
                  <td>
                    <button className="btn-action-small" onClick={handleClaim}>Claim</button>
                    <button className="btn-action-small-primary" onClick={handleViewReceipt}>View Receipt</button>
                  </td>
                </tr>
                <tr>
                  <td>September 16-30, 2025</td>
                  <td>₱ 45,000</td>
                  <td><span className="status-claimed">Claimed</span></td>
                  <td>09/25/2025</td>
                  <td>
                    <button className="btn-action-small" onClick={handleClaim}>Claim</button>
                    <button className="btn-action-small-primary" onClick={handleViewReceipt}>View Receipt</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary Actions */}
        <div className="salary-action-section">
          <div className="salary-status-row">
            <span className="status-label">Status:</span>
            <span className="status-badge pending">Pending</span>
            <span className="status-badge released">Released</span>
            <span className="status-badge claimed">Claimed</span>
          </div>
          <div className="salary-action-row">
            <span className="release-date">Release Date: 10/10/2025</span>
            <div className="salary-action-buttons">
              <button className="action-btn claim-btn" onClick={handleClaim}>Claim</button>
              <button className="action-btn receipt-btn" onClick={handleViewReceipt}>View Receipt</button>
            </div>
          </div>
        </div>
      </div>

      {/* Notify Absence Modal */}
      {showNotifyAbsenceModal && (
        <div className="modal-overlay" onClick={() => setShowNotifyAbsenceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notify Absence</h2>
              <button className="close-btn" onClick={() => setShowNotifyAbsenceModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Fill out the form below to notify the admin about your absence.</p>
              <div className="form-group">
                <label>Date of Absence *</label>
                <input
                  type="date"
                  className="form-input"
                  value={absenceData.date}
                  onChange={(e) => setAbsenceData({ ...absenceData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Reason for Absence *</label>
                <textarea
                  className="form-input textarea"
                  rows="4"
                  placeholder="Please provide a reason for your absence..."
                  value={absenceData.reason}
                  onChange={(e) => setAbsenceData({ ...absenceData, reason: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Attach Proof (Optional)</label>
                <input
                  type="file"
                  className="form-input file-input"
                  onChange={(e) => setAbsenceData({ ...absenceData, proof: e.target.files[0] })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNotifyAbsenceModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSubmitAbsence}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Correction Modal */}
      {showRequestCorrectionModal && (
        <div className="modal-overlay" onClick={() => setShowRequestCorrectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Correction</h2>
              <button className="close-btn" onClick={() => setShowRequestCorrectionModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Request a correction for wrong time-in or time-out.</p>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={correctionData.date}
                  onChange={(e) => setCorrectionData({ ...correctionData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type of Correction *</label>
                <select
                  className="form-input"
                  value={correctionData.type}
                  onChange={(e) => setCorrectionData({ ...correctionData, type: e.target.value })}
                >
                  <option value="time-in">Time In</option>
                  <option value="time-out">Time Out</option>
                </select>
              </div>
              <div className="form-group">
                <label>Correct Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={correctionData.correctTime}
                  onChange={(e) => setCorrectionData({ ...correctionData, correctTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Reason for Correction *</label>
                <textarea
                  className="form-input textarea"
                  rows="4"
                  placeholder="Please explain why this correction is needed..."
                  value={correctionData.reason}
                  onChange={(e) => setCorrectionData({ ...correctionData, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRequestCorrectionModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSubmitCorrection}>
                Request Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <button className="close-btn" onClick={() => setShowReceiptModal(false)}>
                ×
              </button>
              <h1 className="receipt-title">Gracewell NEXUS</h1>
            </div>
            <div className="receipt-content">
              <p className="receipt-section-title">Pay Period</p>
              <p className="receipt-period">October 1-15, 2025</p>
              <div className="receipt-details">
                <div className="detail-row">
                  <span>Employee Name:</span>
                  <span>{user?.employeeName || 'Roberta Rubilyn Cortez Gonzales'}</span>
                </div>
                <div className="detail-row">
                  <span>Employee ID:</span>
                  <span>EMP001</span>
                </div>
                <div className="detail-row">
                  <span>Position:</span>
                  <span>Truck Driver</span>
                </div>
                <div className="detail-row">
                  <span>Department:</span>
                  <span>Operations</span>
                </div>
              </div>
              <hr className="receipt-divider" />
              <div className="salary-details">
                <div className="salary-row">
                  <span>Gross Salary:</span>
                  <span className="salary-value">₱ 46,000</span>
                </div>
                <div className="salary-row">
                  <span>Deductions:</span>
                  <span className="salary-value">-</span>
                </div>
                <div className="salary-row total">
                  <span>Net Salary:</span>
                  <span className="salary-value net">₱ 46,000</span>
                </div>
              </div>
              <hr className="receipt-divider" />
              <div className="receipt-footer">
                <div className="receipt-dates">
                  <p><strong>Release Date:</strong> 10/10/2025</p>
                  <p><strong>Claimed Date:</strong> -</p>
                  <p><strong>Status:</strong> <span className="status-claimed">Claimed</span></p>
                </div>
                <button className="btn-download-pdf">Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDashboard;