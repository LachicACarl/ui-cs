import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const shiftDate = (days) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + days);
      return next;
    });
  };

  const setFilterAndDate = (filter) => {
    setDateFilter(filter);
    const today = new Date();

    if (filter === 'today') {
      setSelectedDate(today);
    } else if (filter === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      setSelectedDate(lastWeek);
    } else if (filter === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      setSelectedDate(lastMonth);
    }
  };

  return (
    <div className="admin-container">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <div className="welcome-section">
          <h1>Welcome, {user?.employeeName || 'Admin'}</h1>
          
          <div className="filter-section">
            <span>Filter by Date:</span>
            <div className="filter-buttons">
              <button 
                className={dateFilter === 'today' ? 'active' : ''} 
                onClick={() => setFilterAndDate('today')}
              >
                Today
              </button>
              <button 
                className={dateFilter === 'week' ? 'active' : ''} 
                onClick={() => setFilterAndDate('week')}
              >
                Last Week
              </button>
              <button 
                className={dateFilter === 'month' ? 'active' : ''} 
                onClick={() => setFilterAndDate('month')}
              >
                Last Month
              </button>
            </div>
            <div className="date-controls">
              <button className="nav-btn" aria-label="Previous date" onClick={() => shiftDate(-1)}>‹</button>
              <div className="date-display">
                <span className="calendar-icon">📅</span>
                <span>{formattedDate}</span>
              </div>
              <button className="nav-btn" aria-label="Next date" onClick={() => shiftDate(1)}>›</button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Charts will be populated from database */}
          <div className="placeholder-message">
            <p>📊 Dashboard charts will be populated from database</p>
            <p style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>Ready for database integration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
