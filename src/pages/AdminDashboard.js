import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('activities');

  const activities = [
    { text: 'Employee Check-in: John Smith (ID: E001)', time: 'Today, 09:15 AM' },
    { text: 'Salary Release: Department - Finance', time: 'Today, 08:30 AM' },
    { text: 'System Backup Completed', time: 'Yesterday, 11:45 PM' },
    { text: 'User Access: Sarah Johnson (Admin)', time: 'Yesterday, 08:00 AM' },
    { text: 'Attendance Report Generated', time: '2 days ago' },
  ];

  const logs = [
    { text: '[INFO] System started successfully', time: 'Today, 06:00 AM' },
    { text: '[INFO] Database synced', time: 'Today, 06:15 AM' },
    { text: '[INFO] Face detection service running', time: 'Today, 06:20 AM' },
    { text: '[WARNING] High memory usage detected', time: 'Today, 02:30 PM' },
    { text: '[INFO] Scheduled backup completed', time: 'Yesterday, 11:00 PM' },
  ];

  const alerts = [
    { text: '🔴 3 Failed Login Attempts', time: 'Today, 10:45 AM' },
    { text: '🟡 Disk Space: 85% Full', time: 'Today, 02:00 PM' },
    { text: '🟢 All Systems Operational', time: 'Today, 09:00 AM' },
    { text: '🔴 1 Employee Has Exceeded Leave Limit', time: 'Yesterday, 04:30 PM' },
  ];

  const renderTabContent = () => {
    let items = [];
    if (activeTab === 'activities') items = activities;
    else if (activeTab === 'logs') items = logs;
    else if (activeTab === 'alerts') items = alerts;

    return (
      <ul className="activity-list">
        {items.map((item, index) => (
          <li key={index} className="activity-item">
            <span>{item.text}</span>
            <span className="activity-time">{item.time}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="admin-container">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">System Administration & Management</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">156</div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Present Today</div>
            <div className="stat-value green">142</div>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">On Leave</div>
            <div className="stat-value orange">8</div>
            <div className="stat-icon">📋</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">System Users</div>
            <div className="stat-value">5</div>
            <div className="stat-icon">👤</div>
          </div>
        </div>

        <div className="records-section">
          <div className="records-header">
            <h2 className="records-title">Admin Controls & Management</h2>
          </div>

          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              Recent Activities
            </button>
            <button 
              className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              System Logs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              Alerts
            </button>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
