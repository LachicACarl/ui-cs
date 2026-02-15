import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';
import { apiClient, logAudit } from '../utils/authService';

const EmployeeDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [attendanceFilter, setAttendanceFilter] = useState('week');
  const [salaryFilter, setSalaryFilter] = useState('week');
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [salaryRows, setSalaryRows] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (user?.employeeId) {
      fetchAttendanceRecords();
    }
  }, [attendanceFilter, user?.employeeId]);

  useEffect(() => {
    if (user?.employeeId) {
      fetchSalaryRecords();
    }
  }, [salaryFilter, user?.employeeId]);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await apiClient.get('/dashboard/stats');
      setStats(data?.stats || null);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('en-US');
  };

  const getRange = (filter) => {
    if (filter === 'all') return { startDate: '', endDate: '' };
    const endDate = new Date();
    const startDate = new Date();
    if (filter === 'month') {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setDate(endDate.getDate() - 7);
    }
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  const cycleFilter = (current) => {
    if (current === 'week') return 'month';
    if (current === 'month') return 'all';
    return 'week';
  };

  const getFilterLabel = (filter) => {
    if (filter === 'month') return 'Last Month';
    if (filter === 'all') return 'All Time';
    return 'Last Week';
  };

  const fetchAttendanceRecords = async () => {
    setAttendanceLoading(true);
    try {
      const { startDate, endDate } = getRange(attendanceFilter);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (user?.employeeId) params.append('employeeId', user.employeeId);

      const { data } = await apiClient.get(`/attendance/records?${params.toString()}`);
      const rows = (data?.records || []).map((record) => {
        const status = record.check_in && record.check_out
          ? 'Present'
          : record.check_in
            ? 'Incomplete'
            : 'Absent';

        return {
          id: record.id,
          checkIn: formatDateTime(record.check_in),
          checkOut: formatDateTime(record.check_out),
          status,
          action: 'Request Correction'
        };
      });
      setAttendanceRows(rows);
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchSalaryRecords = async () => {
    setSalaryLoading(true);
    try {
      const { startDate, endDate } = getRange(salaryFilter);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (user?.employeeId) params.append('employeeId', user.employeeId);

      const { data } = await apiClient.get(`/salary/records?${params.toString()}`);
      const rows = (data?.records || []).map((record) => {
        const periodStart = formatDate(record.period_start);
        const periodEnd = formatDate(record.period_end);
        const period = periodStart && periodEnd ? `${periodStart} - ${periodEnd}` : periodEnd || periodStart || '-';
        const actions = record.status === 'Released'
          ? ['Claim', 'View Receipt']
          : ['View Receipt'];

        return {
          id: record.id,
          period,
          salary: `₱ ${Number(record.amount || 0).toLocaleString('en-US')}`,
          status: record.status || 'Pending',
          releaseDate: record.released_at ? formatDate(record.released_at) : '-',
          actions
        };
      });
      setSalaryRows(rows);
    } catch (error) {
      console.error('Failed to fetch salary records:', error);
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleNotifyAbsence = async () => {
    await logAudit('ABSENCE_NOTIFY', {
      employeeId: user?.employeeId,
      date: new Date().toISOString().split('T')[0]
    });
    alert('Absence notification sent.');
  };

  const handleAttendanceAction = async (row) => {
    await logAudit('ATTENDANCE_CORRECTION_REQUEST', {
      employeeId: user?.employeeId,
      attendanceId: row.id
    });
    alert('Correction request submitted.');
  };

  const downloadReceipt = async (record) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'}/salary/receipt/${record.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        alert('Failed to download receipt');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary_receipt_${user?.employeeId || 'employee'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Receipt download error:', error);
      alert('Failed to download receipt');
    }
  };

  const handleSalaryAction = async (actionLabel, row) => {
    if (actionLabel === 'Claim') {
      try {
        await apiClient.put(`/salary/claim/${row.id}`);
        await logAudit('SALARY_CLAIMED', {
          employeeId: user?.employeeId,
          recordId: row.id
        });
        await fetchSalaryRecords();
        alert('Salary claimed successfully.');
      } catch (error) {
        console.error('Claim error:', error);
        alert(error?.response?.data?.message || 'Failed to claim salary');
      }
      return;
    }

    if (actionLabel === 'View Receipt') {
      await downloadReceipt(row);
    }
  };

  const downloadSalaryCsv = () => {
    if (!salaryRows.length) {
      alert('No salary records to download.');
      return;
    }
    const headers = ['Period', 'Salary', 'Status', 'Release Date'];
    const rows = salaryRows.map((row) => [row.period, row.salary, row.status, row.releaseDate]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_salary_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    profile.employeeId
  )}`;

  const handleEnlargeQr = () => {
    window.open(qrUrl, '_blank', 'noopener,noreferrer');
  };


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
              <button className="btn-enlarge" onClick={handleEnlargeQr}>↗ Click to Enlarge</button>
            </div>
          </div>
          <div className="profile-card-footer">
            <button className="btn-edit-profile" onClick={() => navigate('/profile')}>Edit Profile</button>
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
                <button className="pill-btn soft" onClick={() => setAttendanceFilter(cycleFilter(attendanceFilter))}>
                  {getFilterLabel(attendanceFilter)} <span className="caret">▾</span>
                </button>
                <button className="pill-btn warn" onClick={handleNotifyAbsence}>
                  <span className="pill-icon">🔔</span>Notify Absence
                </button>
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
                  {attendanceLoading && (
                    <tr>
                      <td colSpan="4">Loading attendance records...</td>
                    </tr>
                  )}
                  {!attendanceLoading && attendanceRows.length === 0 && (
                    <tr>
                      <td colSpan="4">No attendance records found.</td>
                    </tr>
                  )}
                  {!attendanceLoading && attendanceRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.checkIn}</td>
                      <td>{row.checkOut}</td>
                      <td><span className="badge success">{row.status}</span></td>
                      <td>
                        <button className="pill-action warn" onClick={() => handleAttendanceAction(row)}>
                          {row.action}
                        </button>
                      </td>
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
              <button className="pill-btn soft" onClick={() => setSalaryFilter(cycleFilter(salaryFilter))}>
                {getFilterLabel(salaryFilter)} <span className="caret">▾</span>
              </button>
              <button className="pill-btn icon-only warn" aria-label="Download" onClick={downloadSalaryCsv}>
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
                {salaryLoading && (
                  <tr>
                    <td colSpan="5">Loading salary records...</td>
                  </tr>
                )}
                {!salaryLoading && salaryRows.length === 0 && (
                  <tr>
                    <td colSpan="5">No salary records found.</td>
                  </tr>
                )}
                {!salaryLoading && salaryRows.map((row) => (
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
                            onClick={() => handleSalaryAction(actionLabel, row)}
                            disabled={actionLabel === 'Claim' && row.status !== 'Released'}
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