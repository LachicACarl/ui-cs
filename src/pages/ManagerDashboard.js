import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './ManagerDashboard.css';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('approvals');

  const pendingApprovals = [
    { employeeName: 'John Smith', department: 'Operations', requestTime: 'Jan 15, 2026 - 08:00 AM', correctedTime: 'Jan 15, 2026 - 07:00 AM', status: 'Pending' },
    { employeeName: 'Sarah Williams', department: 'Operations', requestTime: 'Jan 14, 2026 - 09:30 AM', correctedTime: 'Jan 14, 2026 - 08:45 AM', status: 'Pending' },
  ];

  const approvedRequests = [
    { employeeName: 'Michael Brown', department: 'Operations', approvedDate: 'Jan 13, 2026', status: 'Approved' },
    { employeeName: 'Jennifer Davis', department: 'Maintenance', approvedDate: 'Jan 12, 2026', status: 'Approved' },
  ];

  const departmentStats = [
    { label: 'Total Employees', value: '85' },
    { label: 'Present Today', value: '78' },
    { label: 'On Leave', value: '5' },
    { label: 'Late Arrivals', value: '2' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'approvals') {
      return (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Pending Time Corrections</h3>
          <table className="manager-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Request Time</th>
                <th>Corrected Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.employeeName}</td>
                  <td>{item.department}</td>
                  <td>{item.requestTime}</td>
                  <td>{item.correctedTime}</td>
                  <td><span className="status-badge pending">{item.status}</span></td>
                  <td>
                    <button className="action-btn approve">Approve</button>
                    <button className="action-btn deny">Deny</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'approved') {
      return (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Approved Requests</h3>
          <table className="manager-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Approved Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedRequests.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.employeeName}</td>
                  <td>{item.department}</td>
                  <td>{item.approvedDate}</td>
                  <td><span className="status-badge approved">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="manager-container">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Manager Dashboard</h1>
          <p className="section-subtitle">Department Management & Employee Oversight</p>
        </div>

        <div className="stats-container">
          {departmentStats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="records-section">
          <div className="records-header">
            <h2 className="records-title">Time Corrections & Approvals</h2>
          </div>

          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              Pending Approvals
            </button>
            <button 
              className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved Requests
            </button>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
