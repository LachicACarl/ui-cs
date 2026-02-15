import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ManagerDashboard.css';
import { apiClient, logAudit } from '../utils/authService';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('approvals');
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchEmployees();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await apiClient.get('/dashboard/stats');
      setStats(data?.stats || null);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const [employees, setEmployees] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);

  const fetchEmployees = async () => {
    try {
      const { data } = await apiClient.get('/employees');
      setEmployees(data?.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleApprove = async (index) => {
    const item = pendingApprovals[index];
    const approvedDate = new Date().toLocaleDateString('en-US');
    setPendingApprovals((prev) => prev.filter((_, idx) => idx !== index));
    setApprovedRequests((prev) => [
      { employeeName: item.employeeName, department: item.department, approvedDate, status: 'Approved' },
      ...prev
    ]);
    await logAudit('ATTENDANCE_CORRECTION_APPROVED', {
      employeeName: item.employeeName,
      department: item.department,
      correctedTime: item.correctedTime
    });
  };

  const handleDeny = async (index) => {
    const item = pendingApprovals[index];
    setPendingApprovals((prev) => prev.filter((_, idx) => idx !== index));
    await logAudit('ATTENDANCE_CORRECTION_DENIED', {
      employeeName: item.employeeName,
      department: item.department,
      correctedTime: item.correctedTime
    });
  };

  const departmentStats = [
    { label: 'Total Employees', value: stats?.total_employees || '0' },
    { label: 'Present Today', value: stats?.today_present || '0' },
    { label: 'On Leave', value: '0' },
    { label: 'Pending Approvals', value: stats?.pending_salaries || '0' },
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
                    <button className="action-btn approve" onClick={() => handleApprove(idx)}>Approve</button>
                    <button className="action-btn deny" onClick={() => handleDeny(idx)}>Deny</button>
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
