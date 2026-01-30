import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import './AttendanceManagement.css';

const AttendanceManagement = ({ user, onLogout }) => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const totals = useMemo(() => {
    const totalEmployees = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    return { totalEmployees, present, absent };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const term = search.toLowerCase();
      const inSearch = !term ||
        rec.name.toLowerCase().includes(term) ||
        rec.department.toLowerCase().includes(term) ||
        rec.status.toLowerCase().includes(term) ||
        rec.id.toLowerCase().includes(term);

      const deptOk = department === 'all' || rec.department === department;

      const dateValue = rec.date ? new Date(rec.date) : null;
      const startOk = startDate && dateValue ? dateValue >= new Date(startDate) : true;
      const endOk = endDate && dateValue ? dateValue <= new Date(endDate) : true;

      return inSearch && deptOk && startOk && endOk;
    });
  }, [records, search, department, startDate, endDate]);

  const openEditModal = (rec) => {
    setSelectedRecord(rec);
    setEditCheckIn(rec.checkIn === '-' ? '' : rec.checkIn);
    setEditCheckOut(rec.checkOut === '-' ? '' : rec.checkOut);
    setEditModalOpen(true);
  };

  const saveEdits = () => {
    setRecords((prev) => prev.map((r) => r.id === selectedRecord.id ? {
      ...r,
      checkIn: editCheckIn || '-',
      checkOut: editCheckOut || '-',
      correctionStatus: 'Approved'
    } : r));
    setEditModalOpen(false);
    setSelectedRecord(null);
  };

  const setCorrectionStatus = (rec, status) => {
    setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, correctionStatus: status } : r));
  };

  const setIssueStatus = (rec, status) => {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const note = status === 'Resolved'
      ? `Resolved on ${timestamp}`
      : rec.issueNote || 'Flagged for review';

    setRecords((prev) => prev.map((r) => r.id === rec.id ? {
      ...r,
      issueStatus: status,
      issueNote: note
    } : r));
  };

  const exportReport = (format) => {
    const filename = `attendance_export.${format.toLowerCase()}`;
    console.log(`Exporting attendance as ${format}: ${filename}`);
    alert(`Exporting attendance as ${format} format...`);
    setExportDropdownOpen(false);
  };

  const rangeLabel = () => {
    if (!startDate && !endDate) return 'Awaiting database date range';
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Start';
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'End';
    return `${start} to ${end}`;
  };

  return (
    <div className="attendance-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="attendance-container">
        <div className="header-row">
          <div>
            <h1>Attendance Management</h1>
            <p className="subtitle">Track employee attendance and work hours</p>
          </div>
        </div>

        <div className="cards-row">
          <div className="summary-card">
            <div className="card-label">Total Employees</div>
            <div className="card-value">{totals.totalEmployees}</div>
            <div className="card-icon">👥</div>
          </div>
          <div className="summary-card">
            <div className="card-label">Present</div>
            <div className="card-value green">{totals.present}</div>
            <div className="card-icon status-dot green"></div>
          </div>
          <div className="summary-card">
            <div className="card-label">Absent</div>
            <div className="card-value red">{totals.absent}</div>
            <div className="card-icon status-dot red"></div>
          </div>
        </div>

        <div className="filters-bar compact">
          <div className="range-label">Attendance Records - {rangeLabel()}</div>
          <div className="search-actions">
            <div className="search-field">
              <input
                aria-label="Search attendance"
                type="text"
                placeholder="Search by name, department, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn" aria-label="Search" type="button">
                <span>🔍</span>
              </button>
            </div>
            <div className="export-dropdown-wrapper">
              <button className="export-pill" onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
                <span className="download-icon">⬇</span>
                Export
              </button>
              {exportDropdownOpen && (
                <div className="export-dropdown-menu">
                  <button onClick={() => exportReport('PDF')}>Export as .pdf</button>
                  <button onClick={() => exportReport('XLSX')}>Export as .xlsx</button>
                  <button onClick={() => exportReport('CSV')}>Export as .csv</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Corrected Time</th>
                <th>Issue Status</th>
                <th>Resolution Notes</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-state">No attendance records yet. Connect to the database to load data.</td>
                </tr>
              )}
              {filteredRecords.map((record) => (
                <tr key={`${record.id}-${record.date}`}>
                  <td>{record.name}</td>
                  <td>{record.department}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>{record.correctedTime}</td>
                  <td>
                    <span className={`issue-pill ${(record.issueStatus || 'Open').toLowerCase()}`}>
                      {record.issueStatus || 'Open'}
                    </span>
                  </td>
                  <td className="resolution-note">{record.issueNote || 'No notes yet'}</td>
                  <td>
                    <span className={`status-pill ${record.status?.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="approve" onClick={() => setCorrectionStatus(record, 'Approved')}>Approve</button>
                      <button className="deny" onClick={() => setCorrectionStatus(record, 'Denied')}>Deny</button>
                      <button className="resolve" onClick={() => setIssueStatus(record, record.issueStatus === 'Resolved' ? 'Open' : 'Resolved')}>
                        {record.issueStatus === 'Resolved' ? 'Reopen' : 'Resolve'}
                      </button>
                      <button className="edit" onClick={() => openEditModal(record)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Time In/Out</h2>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee</label>
                <div className="readonly">{selectedRecord?.name}</div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <div className="readonly">{selectedRecord?.date}</div>
              </div>
              <div className="form-group inline">
                <div>
                  <label>Time In</label>
                  <input type="text" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} placeholder="08:00 AM" />
                </div>
                <div>
                  <label>Time Out</label>
                  <input type="text" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} placeholder="05:00 PM" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button className="btn primary" onClick={saveEdits}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
