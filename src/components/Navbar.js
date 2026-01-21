import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = React.useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.userRole === 'admin') return '/admin';
    if (user?.userRole === 'manager') return '/manager';
    return '/employee';
  };

  return (
    <div className="navbar">
      <Link to={getDashboardLink()} className="logo">
        <span className="logo-icon">✦</span>
        Gracewell NEXUS
      </Link>
      
      <div className="nav-links">
        <Link to={getDashboardLink()} className="dashboard-btn">Dashboard</Link>
        
        <div className="dropdown">
          <div 
            className="employee-link"
            onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
          >
            Employee <span>▼</span>
          </div>
          {employeeDropdownOpen && (
            <div className="dropdown-content">
              <Link to="/attendance">Attendance Management</Link>
              <Link to="/salary">Employee Salary Tracker</Link>
              <Link to="/records">Employee Records</Link>
              <Link to="/users">User Management</Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="profile">
        <div className="profile-avatar">
          {user?.employeeName?.substring(0, 2).toUpperCase() || 'GC'}
        </div>
        <span 
          className="profile-name"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        >
          {user?.employeeName || 'Guest'} <span>▼</span>
        </span>
        
        {profileDropdownOpen && (
          <div className="profile-dropdown">
            <Link to="/profile">👤 Profile</Link>
            <a onClick={handleLogout} style={{ cursor: 'pointer' }}>🚪 Log Out</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
