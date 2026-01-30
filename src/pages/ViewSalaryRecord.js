import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './ViewSalaryRecord.css';
import { useNavigate, useLocation } from 'react-router-dom';

const ViewSalaryRecord = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const recordData = location.state?.record || {};

  const [formData, setFormData] = useState({
    employeeId: recordData.employeeId || '',
    employeeName: recordData.employeeName || '',
    position: recordData.position || '',
    department: recordData.department || '',
    baseSalary: recordData.salary || '',
    employmentStatus: recordData.employmentStatus || 'Regular',
    paymentLogs: recordData.paymentLogs || []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    alert('Salary record saved successfully!');
    console.log('Saved data:', formData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="view-salary-container">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container">
        <div className="breadcrumb">
          <span>Employee</span>
          <span>&gt;</span>
          <span>Employee Salary Tracker</span>
          <span>&gt;</span>
          <span className="current">View Salary Record</span>
        </div>

        <div className="salary-record-card">
          <div className="record-layout">
            {/* Left side - Profile Section */}
            <div className="profile-section">
              <div className="profile-avatar">
                <span>{formData.employeeName?.charAt(0)}</span>
              </div>
              <div className="profile-info">
                <p className="profile-name">{formData.employeeName}</p>
                <p className="profile-id">{formData.employeeId}</p>
              </div>
            </div>

            {/* Right side - Form Details */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ID Number</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Base Salary</label>
                  <input
                    type="text"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Employment Status</label>
                  <input
                    type="text"
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Payment Logs</label>
                <div className="payment-logs-container">
                  {formData.paymentLogs && formData.paymentLogs.length > 0 ? (
                    <table className="payment-logs-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.paymentLogs.map((log, index) => (
                          <tr key={index}>
                            <td>{log.date}</td>
                            <td>{log.amount}</td>
                            <td>{log.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-logs">No payment logs available</div>
                  )}
                </div>
              </div>

              <div className="button-group">
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSalaryRecord;
