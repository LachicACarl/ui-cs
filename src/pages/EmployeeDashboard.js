import React, { useState } from 'react';
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
  
  // Modal states
  const [showNotifyAbsenceModal, setShowNotifyAbsenceModal] = useState(false);
  const [showRequestCorrectionModal, setShowRequestCorrectionModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Form states
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
  
  // Action states
  const [attendanceActions, setAttendanceActions] = useState({
    hasNotifiedAbsence: false,
    hasRequestedCorrection: false
  });
  
  const [salaryActions, setSalaryActions] = useState({
    hasClaimed: false
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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle Notify Absence
  const handleNotifyAbsence = () => {
    setShowNotifyAbsenceModal(true);
  };

  const handleSubmitAbsence = () => {
    if (absenceData.date && absenceData.reason) {
      setAttendanceActions({ ...attendanceActions, hasNotifiedAbsence: true });
      setAbsenceData({ date: '', reason: '', proof: null });
      setShowNotifyAbsenceModal(false);
      alert('Absence notification sent to admin');
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Handle Request Correction
  const handleRequestCorrection = () => {
    setShowRequestCorrectionModal(true);
  };

  const handleSubmitCorrection = () => {
    if (correctionData.date && correctionData.correctTime && correctionData.reason) {
      setAttendanceActions({ ...attendanceActions, hasRequestedCorrection: true });
      setCorrectionData({ date: '', type: 'time-in', correctTime: '', reason: '' });
      setShowRequestCorrectionModal(false);
      alert('Correction request sent to admin');
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Handle Claim
  const handleClaim = () => {
    setSalaryActions({ ...salaryActions, hasClaimed: true });
    alert('Payment claim confirmed. Admin has been notified.');
  };

  // Handle View Receipt
  const handleViewReceipt = () => {
    setShowReceiptModal(true);
  };

  // Handle Logout
  const handleLogout = () => {
    navigate('/login');
  };

  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [22, 4],
      backgroundColor: ['#00c853', '#ff6b6b'],
      borderColor: ['#00c853', '#ff6b6b'],
      borderWidth: 0
    }]
  };

  const salaryData = {
    labels: ['Paid', 'Not Paid'],
    datasets: [{
      data: [17, 8],
      backgroundColor: ['#00c853', '#f4c10f'],
      borderColor: ['#00c853', '#f4c10f'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="employee-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="welcome">
        <h1>Welcome, {user?.employeeName || 'Employee'}</h1>
      </div>

      {/* Employee Profile Section */}
      <div className="employee-profile-card">
        <div className="profile-icon">📋</div>
        <h2>Employee Profile</h2>
        
        <div className="profile-content">
          {/* Left Side - Profile Picture and Info */}
          <div className="profile-left">
            <div className="profile-photo">
              <div className="avatar-placeholder">
                {user?.employeeName?.substring(0, 2).toUpperCase() || 'EM'}
              </div>
            </div>
            
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

            <div className="profile-actions">
              <button className="btn-edit-profile" onClick={() => navigate('/profile')}>
                ✏️ Edit Profile
              </button>
              <button className="btn-enlarge" title="Click to enlarge">
                📍 Click to Enlarge
              </button>
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
        {/* Attendance Section */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <h2>Attendance Tracker</h2>
          </div>
          <p className="card-date"><strong>{formatDate(currentDate)}</strong></p>
          <p className="card-subtitle">Total: 26 employees</p>

          <div className="chart-container">
            <Doughnut data={attendanceData} options={chartOptions} />
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#00c853' }}></span>
              <span>Total Present</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></span>
              <span>Absences: 4</span>
            </div>
          </div>

          <div className="absentees">
            <strong>Absentees:</strong>
            <ul>
              <li>• Robert Johnson</li>
              <li>• Michael Brown</li>
              <li>• David Miller</li>
              <li>• Sarah Davis</li>
            </ul>
          </div>

          {/* Attendance Actions */}
          <div className="action-section">
            <div className="action-row">
              <span className="status-label">Status:</span>
              <span className="status-badge present">Present</span>
            </div>
            <div className="action-row">
              <span className="action-label">Action:</span>
              <div className="action-buttons">
                <button 
                  className="action-btn correction-btn"
                  onClick={handleRequestCorrection}
                  title="Request correction for wrong time-in/time-out"
                >
                  Request Correction
                </button>
                <button 
                  className="action-btn notify-btn"
                  onClick={handleNotifyAbsence}
                  title="Notify admin about your absence"
                >
                  Notify Absence
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Section */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">💰</span>
            <h2>Salary Tracker</h2>
          </div>
          <p className="card-date"><strong>{formatDate(currentDate)}</strong></p>
          <p className="card-subtitle">Total: 25 employees</p>

          <div className="chart-container">
            <Doughnut data={salaryData} options={chartOptions} />
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#00c853' }}></span>
              <span>Paid: 17</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f4c10f' }}></span>
              <span>Not Paid: 3</span>
            </div>
          </div>

          <div className="salary-summary">
            <p>
              <span>Pending Salaries</span>
              <span className="card-value">₱135,000</span>
            </p>
            <p>
              <span>Released Salaries</span>
              <span className="card-value">₱750,000</span>
            </p>
          </div>

          <div className="pending-payrolls">
            <strong>Pending Employees:</strong>
            <ul>
              <li>
                <span>Robert Johnson</span>
                <span>₱48,730</span>
              </li>
              <li>
                <span>Michael Brown</span>
                <span>₱49,730</span>
              </li>
              <li>
                <span>David Miller</span>
                <span>₱45,404</span>
              </li>
            </ul>
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
      </div>

      {/* Notify Absence Modal */}
      {showNotifyAbsenceModal && (
        <div className="modal-overlay" onClick={() => setShowNotifyAbsenceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notify Absence</h2>
              <button 
                className="close-btn"
                onClick={() => setShowNotifyAbsenceModal(false)}
              >
                ✕
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
              <button 
                className="btn-cancel"
                onClick={() => setShowNotifyAbsenceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-submit"
                onClick={handleSubmitAbsence}
              >
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
              <button 
                className="close-btn"
                onClick={() => setShowRequestCorrectionModal(false)}
              >
                ✕
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
              <button 
                className="btn-cancel"
                onClick={() => setShowRequestCorrectionModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-submit"
                onClick={handleSubmitCorrection}
              >
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
              <button 
                className="close-btn"
                onClick={() => setShowReceiptModal(false)}
              >
                ✕
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
    </div>
  );
};

export default EmployeeDashboard;
