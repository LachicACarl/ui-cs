import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { getPermissions } from '../utils/authService';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = React.useState(false);

  const perms = getPermissions(user?.userRole);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.userRole === 'super_admin' || user?.userRole === 'admin') return '/admin';
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
        
        {user?.userRole !== 'employee' && (perms.viewAttendance || perms.manageSalary || perms.manageEmployees || perms.manageUsers) && (
          <div className="dropdown">
            <div 
              className="employee-link"
              onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
            >
              Employee <span>▼</span>
            </div>
            {employeeDropdownOpen && (
              <div className="dropdown-content">
                {perms.viewAttendance && <Link to="/attendance">Employee Attendance Tracker</Link>}
                {perms.manageSalary && (
                  user?.userRole === 'super_admin' || user?.userRole === 'admin' ? (
                    <Link to="/salary">Employee Salary Tracker</Link>
                  ) : (
                    <Link to="/salary-manager">Employee Salary Tracker</Link>
                  )
                )}
                {perms.manageEmployees && <Link to="/records">Employee Records</Link>}
                {perms.manageUsers && <Link to="/users">User Management</Link>}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="profile">
        <div className="profile-avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="profile-avatar-img" />
          ) : (
            user?.employeeName?.substring(0, 2).toUpperCase() || 'GC'
          )}
        </div>
        {user?.userRole !== 'employee' && (
          <span 
            className="profile-name"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            {user?.employeeName || 'Guest'} <span>▼</span>
          </span>
        )}
        {user?.userRole === 'employee' && (
          <span className="profile-name">
            {user?.employeeName || 'Guest'}
          </span>
        )}
        
        {user?.userRole !== 'employee' && profileDropdownOpen && (
          <div className="profile-dropdown">
            <Link to="/profile">👤 Profile</Link>
            <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', textAlign: 'left', width: '100%' }}>🚪 Log Out</button>
          </div>
        )}
        {user?.userRole === 'employee' && (
          <div className="profile-dropdown" style={{ display: 'block' }}>
            <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: '12px 14px', font: 'inherit', textAlign: 'left', width: '100%', margin: 0 }}>🚪 Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
