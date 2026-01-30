import React from 'react';
import './EmployeeDashboard.css';

const EmployeeDashboard = ({ user, onLogout }) => {
  const profile = {
    firstName: user?.employeeName?.split(' ')[0] || 'Roberta',
    middleName: user?.middleName || 'Cortez',
    lastName: user?.employeeName?.split(' ').slice(1).join(' ') || 'Rubilyn',
    employeeId: user?.employeeId || 'EMP001',
    email: user?.email || 'rrc.gonzales@trucking.com',
    contactNo: user?.contactNo || '09162345693',
    position: user?.position || 'Truck Driver',
    department: user?.department || 'Operations',
    photo:
      user?.profileImage ||
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  };

  const attendanceRows = [
    {
      id: 1,
      checkIn: 'Oct 27, 2025 — 08:00 AM',
      checkOut: 'Oct 30, 2025 — 04:00 PM',
      status: 'Present',
      action: 'Request Correction'
    }
  ];

  const salaryRows = [
    { id: 1, period: 'October 16-31, 2025', salary: '₱ 45,000', status: 'Pending', releaseDate: '-', actions: ['Claim', 'View Receipt'] },
    { id: 2, period: 'October 1-15, 2025', salary: '₱ 46,000', status: 'Released', releaseDate: '10/10/2025', actions: ['Claim', 'View Receipt'] },
    { id: 3, period: 'September 16-30, 2025', salary: '₱ 45,000', status: 'Claimed', releaseDate: '09/25/2025', actions: ['Claim', 'View Receipt'] }
  ];

  const getActionTone = (label, status) => {
    if (label === 'View Receipt') return 'green';
    if (label === 'Claim' && status === 'Claimed') return 'muted';
    return 'warn';
  };

  return (
    <div className="employee-container">
      <header className="employee-header">
        <div className="brand-block">
          <div className="brand-mark">✦</div>
          <span className="brand-text">Gracewell NEXUS</span>
        </div>
        <button className="header-logout" onClick={onLogout}>
          ↩ Log Out
        </button>
      </header>

      <div className="employee-shell">
        <div className="welcome-row">
          <h2 className="welcome-title">Welcome, {profile.firstName}!</h2>
        </div>

        <div className="profile-card">
          <div className="profile-card-top">
            <span className="profile-chip">Employee Profile</span>
          </div>
          <div className="profile-grid">
            <div className="profile-photo-frame">
              <img src={profile.photo} alt="Employee" />
            </div>

            <div className="profile-fields">
              <div className="field-row"><span className="field-label">First Name:</span><span className="field-value">{profile.firstName}</span></div>
              <div className="field-row"><span className="field-label">Middle Name:</span><span className="field-value">{profile.middleName}</span></div>
              <div className="field-row"><span className="field-label">Last Name:</span><span className="field-value">{profile.lastName}</span></div>
              <div className="field-row"><span className="field-label">Employee ID:</span><span className="field-value">{profile.employeeId}</span></div>
              <div className="field-row"><span className="field-label">Email:</span><span className="field-value">{profile.email}</span></div>
              <div className="field-row"><span className="field-label">Contact No:</span><span className="field-value">{profile.contactNo}</span></div>
              <div className="field-row"><span className="field-label">Position:</span><span className="field-value">{profile.position}</span></div>
              <div className="field-row"><span className="field-label">Department:</span><span className="field-value">{profile.department}</span></div>
            </div>

            <div className="profile-qr">
              <div className="qr-meta">
                <div className="qr-id">Employee ID: <strong>{profile.employeeId}</strong></div>
                <div className="qr-note">Scan the QR code for quick identification</div>
              </div>
              <div className="qr-box">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    profile.employeeId
                  )}`}
                  alt="Employee QR"
                />
              </div>
              <button className="btn-enlarge">↗ Click to Enlarge</button>
            </div>
          </div>
          <div className="profile-card-footer">
            <button className="btn-edit-profile">Edit Profile</button>
          </div>
        </div>

        <div className="reports-container">
          <div className="card">
            <div className="card-head">
              <div className="section-title blue">
                <span className="section-dot blue"></span>
                <span className="section-icon" role="img" aria-label="calendar">📅</span>
                My Attendance Report
              </div>
              <div className="head-actions">
                <button className="pill-btn soft">Last Week <span className="caret">▾</span></button>
                <button className="pill-btn warn"><span className="pill-icon">🔔</span>Notify Absence</button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="plain-table">
                <thead>
                  <tr>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.checkIn}</td>
                      <td>{row.checkOut}</td>
                      <td><span className="badge success">{row.status}</span></td>
                      <td><button className="pill-action warn">{row.action}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
          <div className="card-head">
            <div className="section-title green">
              <span className="section-dot green"></span>
              <span className="section-icon" role="img" aria-label="salary">🪙</span>
              My Salary Report
            </div>
            <div className="head-actions">
              <button className="pill-btn soft">Last Week <span className="caret">▾</span></button>
              <button className="pill-btn icon-only warn" aria-label="Download">
                <span className="pill-icon">⬇</span>
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="plain-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Release Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.period}</td>
                    <td>{row.salary}</td>
                    <td><span className={`badge ${row.status.toLowerCase()}`}>{row.status}</span></td>
                    <td>{row.releaseDate}</td>
                    <td>
                      <div className="table-actions">
                        {row.actions.map((actionLabel) => (
                          <button
                            key={actionLabel}
                            className={`pill-action ${getActionTone(actionLabel, row.status)}`}
                          >
                            {actionLabel}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;