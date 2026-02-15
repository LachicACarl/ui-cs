import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';
import { apiClient } from '../utils/authService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = ({ user, onLogout }) => {
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await apiClient.get('/employees');
      setEmployees(data?.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data } = await apiClient.get('/dashboard/stats');
      setStats(data?.stats || null);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

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
          <div className="charts-container">
            <div className="chart-card">
              <h3>Attendance Status</h3>
              {stats && (
                <Doughnut 
                  data={{
                    labels: ['Present', 'Absent'],
                    datasets: [{
                      label: 'Employee Attendance',
                      data: [stats.today_present || 0, (stats.total_employees || 0) - (stats.today_present || 0)],
                      backgroundColor: ['#4CAF50', '#FF6B6B'],
                      borderColor: ['#fff', '#fff'],
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              )}
            </div>

            <div className="chart-card">
              <h3>Salary Status</h3>
              {stats && (
                <Doughnut 
                  data={{
                    labels: ['Pending', 'Released'],
                    datasets: [{
                      label: 'Salary Distribution',
                      data: [stats.pending_amount || 0, stats.released_amount || 0],
                      backgroundColor: ['#FFC107', '#2196F3'],
                      borderColor: ['#fff', '#fff'],
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
