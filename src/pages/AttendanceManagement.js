import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './AttendanceManagement.css';

const AttendanceManagement = ({ user, onLogout }) => {
  const [month, setMonth] = useState('January');
  const [attendanceData, setAttendanceData] = useState([
    { id: 'E001', name: 'John Smith', date: '2026-01-21', timeIn: '08:30', timeOut: '17:45', status: 'Present', correctionRequested: false, correctionStatus: 'Pending' },
    { id: 'E002', name: 'Sarah Johnson', date: '2026-01-21', timeIn: '08:15', timeOut: '17:30', status: 'Present', correctionRequested: false, correctionStatus: 'None' },
    { id: 'E003', name: 'Mike Davis', date: '2026-01-21', timeIn: '09:00', timeOut: '17:00', status: 'Late', correctionRequested: true, correctionStatus: 'Approved' },
    { id: 'E004', name: 'Emily Brown', date: '2026-01-21', timeIn: '08:45', timeOut: '17:15', status: 'Present', correctionRequested: true, correctionStatus: 'Pending' },
    { id: 'E005', name: 'Robert Wilson', date: '2026-01-20', timeIn: 'Absent', timeOut: 'Absent', status: 'Absent', correctionRequested: false, correctionStatus: 'None' },
  ]);

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionType, setCorrectionType] = useState('');
  const [correctionTime, setCorrectionTime] = useState('');

  const handleCorrection = (record) => {
    setSelectedRecord(record);
    setShowCorrectionModal(true);
  };

  const submitCorrection = () => {
    if (!correctionType || !correctionTime) {
      alert('Please fill all fields');
      return;
    }

    setAttendanceData(attendanceData.map(record => 
      record.id === selectedRecord.id 
        ? { 
            ...record, 
            correctionRequested: true, 
            correctionStatus: 'Pending',
            [correctionType === 'timeIn' ? 'timeIn' : 'timeOut']: correctionTime
          }
        : record
    ));

    setShowCorrectionModal(false);
    setCorrectionType('');
    setCorrectionTime('');
    setSelectedRecord(null);
  };

  const approveCorrection = (record) => {
    setAttendanceData(attendanceData.map(r => 
      r.id === record.id 
        ? { ...r, correctionStatus: 'Approved' }
        : r
    ));
  };

  return (
    <div className="attendance-page">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="attendance-container">
        <div className="attendance-header">
          <h1>Attendance Management</h1>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="month-select">
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
        </div>

        <div className="attendance-stats">
          <div className="stat-card">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{attendanceData.length}</span>
          </div>
          <div className="stat-card present">
            <span className="stat-label">Present</span>
            <span className="stat-value">{attendanceData.filter(a => a.status === 'Present').length}</span>
          </div>
          <div className="stat-card absent">
            <span className="stat-label">Absent</span>
            <span className="stat-value">{attendanceData.filter(a => a.status === 'Absent').length}</span>
          </div>
          <div className="stat-card late">
            <span className="stat-label">Late</span>
            <span className="stat-value">{attendanceData.filter(a => a.status === 'Late').length}</span>
          </div>
        </div>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
              <th>Correction Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record) => (
              <tr key={`${record.id}-${record.date}`}>
                <td>{record.id}</td>
                <td>{record.name}</td>
                <td>{record.date}</td>
                <td className={record.correctionStatus === 'Approved' ? 'corrected' : ''}>{record.timeIn}</td>
                <td className={record.correctionStatus === 'Approved' ? 'corrected' : ''}>{record.timeOut}</td>
                <td>
                  <span className={`status-badge ${record.status.toLowerCase()}`}>
                    {record.status}
                  </span>
                </td>
                <td>
                  <span className={`correction-badge ${record.correctionStatus.toLowerCase()}`}>
                    {record.correctionStatus}
                  </span>
                </td>
                <td>
                  {user?.userRole === 'admin' ? (
                    <>
                      {record.correctionStatus === 'Pending' ? (
                        <button 
                          className="approve-btn"
                          onClick={() => approveCorrection(record)}
                        >
                          Approve
                        </button>
                      ) : (
                        <button 
                          className="correct-btn"
                          onClick={() => handleCorrection(record)}
                        >
                          Correct
                        </button>
                      )}
                    </>
                  ) : (
                    <button 
                      className="correct-btn"
                      onClick={() => handleCorrection(record)}
                      disabled={record.correctionStatus === 'Approved'}
                    >
                      Request Correction
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCorrectionModal && (
        <div className="modal-overlay" onClick={() => setShowCorrectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Time Correction</h2>
              <button className="close-btn" onClick={() => setShowCorrectionModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee: {selectedRecord?.name}</label>
              </div>
              <div className="form-group">
                <label>Date: {selectedRecord?.date}</label>
              </div>
              <div className="form-group">
                <label>Correction Type</label>
                <select 
                  value={correctionType}
                  onChange={(e) => setCorrectionType(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Type</option>
                  <option value="timeIn">Time In</option>
                  <option value="timeOut">Time Out</option>
                </select>
              </div>
              <div className="form-group">
                <label>Corrected Time</label>
                <input
                  type="time"
                  value={correctionTime}
                  onChange={(e) => setCorrectionTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCorrectionModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={submitCorrection}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
