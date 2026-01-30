import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import './SalaryTracker.css';

const seededRecords = [
  {
    employeeId: 'EMP001',
    employeeName: 'Robert Johnson',
    trips: 1,
    salary: 45000,
    status: 'Released',
    releaseDate: '2025-10-25',
    period: '2025-10-31',
    position: 'Driver',
    department: 'Operations'
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Sarah Williams',
    trips: 1,
    salary: 42000,
    status: 'Released',
    releaseDate: '2025-10-25',
    period: '2025-10-31',
    position: 'Coordinator',
    department: 'Operations'
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Michael Brown',
    trips: 1,
    salary: 46000,
    status: 'Released',
    releaseDate: '2026-01-19',
    period: '2026-01-19',
    position: 'Supervisor',
    department: 'Logistics'
  },
  {
    employeeId: 'EMP004',
    employeeName: 'David Miller',
    trips: 1,
    salary: 44000,
    status: 'Claimed',
    releaseDate: '2026-01-19',
    claimedDate: '2026-01-19',
    period: '2026-01-19',
    position: 'Operations Lead',
    department: 'Operations'
  },
  {
    employeeId: 'EMP005',
    employeeName: 'Lauren Adams',
    trips: 0,
    salary: 38000,
    status: 'Pending',
    period: '2026-01-23',
    position: 'Dispatcher',
    department: 'Operations'
  }
];

const SalaryTracker = ({ user, onLogout }) => {
  const [records, setRecords] = useState(seededRecords);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editData, setEditData] = useState({ salary: '', trips: '' });
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [reportRange, setReportRange] = useState('week');
  const [addData, setAddData] = useState({ employeeId: '', employeeName: '', period: '', salary: '', trips: 1 });
  const [addError, setAddError] = useState('');
  const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totals = useMemo(() => {
    const totalPayroll = records.reduce((sum, r) => sum + (parseFloat(r.salary) || 0), 0);
    const pending = records.filter((r) => r.status === 'Pending').reduce((sum, r) => sum + (parseFloat(r.salary) || 0), 0);
    const released = records.filter((r) => r.status === 'Released').reduce((sum, r) => sum + (parseFloat(r.salary) || 0), 0);
    const pendingCount = records.filter((r) => r.status === 'Pending').length;
    return { totalPayroll, pending, released, pendingCount };
  }, [records]);

  const statusCounts = useMemo(() => {
    return {
      All: records.length,
      Pending: records.filter((r) => r.status === 'Pending').length,
      Released: records.filter((r) => r.status === 'Released').length,
      Claimed: records.filter((r) => r.status === 'Claimed').length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const term = search.toLowerCase();
      const inSearch = !term ||
        rec.employeeId.toLowerCase().includes(term) ||
        rec.employeeName.toLowerCase().includes(term);

      const statusOk = statusFilter === 'All' || rec.status === statusFilter;

      const dateValue = rec.releaseDate ? new Date(rec.releaseDate) : rec.period ? new Date(rec.period) : null;
      const startOk = startDate && dateValue ? dateValue >= new Date(startDate) : true;
      const endOk = endDate && dateValue ? dateValue <= new Date(endDate) : true;

      return inSearch && statusOk && startOk && endOk;
    });
  }, [records, search, statusFilter, startDate, endDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, startDate, endDate]);

  const payrollPeriod = startDate && endDate
    ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : 'October 16-31, 2025';

  const handleManageClick = (rec) => {
    setSelectedRecord(rec);
    setEditData({ salary: rec.salary, trips: rec.trips });
    setShowManageModal(true);
  };

  const saveManageChanges = () => {
    setRecords((prev) => prev.map((r) => r.employeeId === selectedRecord.employeeId ? {
      ...r,
      salary: editData.salary,
      trips: editData.trips,
    } : r));
    setShowManageModal(false);
    setSelectedRecord(null);
  };

  const updateStatus = (employeeId, newStatus) => {
    const stampedDate = new Date().toISOString().split('T')[0];
    setRecords((prev) => prev.map((r) => {
      if (r.employeeId !== employeeId) return r;
      return {
        ...r,
        status: newStatus,
        releaseDate: newStatus === 'Released' ? stampedDate : r.releaseDate,
        claimedDate: newStatus === 'Claimed' ? stampedDate : r.claimedDate
      };
    }));
    setSelectedRecord((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  const releasePayment = (record) => {
    setRecords((prev) => prev.map((r) => r.employeeId === record.employeeId ? {
      ...r,
      status: 'Released',
      releaseDate: new Date().toISOString().split('T')[0]
    } : r));
  };

  const markClaimed = (record) => {
    setRecords((prev) => prev.map((r) => r.employeeId === record.employeeId ? {
      ...r,
      status: 'Claimed',
      claimedDate: new Date().toISOString().split('T')[0]
    } : r));
  };

  const exportReport = (format, range = reportRange) => {
    const filename = `salary_${range}.${format.toLowerCase()}`;
    console.log(`Exporting ${range} salary as ${format}: ${filename}`);
    alert(`Exporting ${range} salary records as ${format}...`);
    setExportDropdownOpen(false);
  };

  const formatDisplayDate = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-US');
  };

  const resetAddForm = () => {
    setAddData({ employeeId: '', employeeName: '', period: '', salary: '', trips: 1 });
    setAddError('');
  };

  const handleAddRecord = () => {
    const employeeId = addData.employeeId.trim();
    const employeeName = addData.employeeName.trim();
    const period = addData.period.trim();
    const salaryNum = parseFloat(addData.salary);
    const tripsNum = parseInt(addData.trips || 0, 10);

    if (!employeeId || !employeeName || !period || Number.isNaN(salaryNum) || salaryNum <= 0) {
      setAddError('Please complete all fields and ensure salary is greater than 0.');
      return;
    }

    const duplicate = records.some((r) => r.employeeId.toLowerCase() === employeeId.toLowerCase() && (r.period || '').toLowerCase() === period.toLowerCase());
    if (duplicate) {
      setAddError('A record for this employee and period already exists.');
      return;
    }

    const newRecord = {
      employeeId,
      employeeName,
      period,
      salary: salaryNum,
      trips: Number.isNaN(tripsNum) ? 0 : tripsNum,
      status: 'Pending',
      position: '',
      department: '',
      releaseDate: '',
      claimedDate: ''
    };

    setRecords((prev) => [newRecord, ...prev]);
    setShowAddModal(false);
    resetAddForm();
  };

  const isAdmin = user?.userRole === 'admin' || user?.userRole === 'super_admin';
  const isManager = user?.userRole === 'manager';

  return (
    <div className="salary-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="salary-container">
        <div className="header-section">
          <div>
            <h1>Employee Salary Tracker</h1>
            <p className="subtitle">{isAdmin ? 'Manage and track employee payroll' : 'View salary records and release payments'}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="summary-cards-row">
            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-label">Total Payroll</div>
              <div className="card-value">${(totals.totalPayroll).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="summary-card">
              <div className="card-icon orange-icon">⏱️</div>
              <div className="card-label">Pending Salaries</div>
              <div className="card-value orange">₱{(totals.pending).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="summary-card">
              <div className="card-icon green-icon">✓</div>
              <div className="card-label">Released Salaries</div>
              <div className="card-value green">₱{(totals.released).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="summary-card">
              <div className="card-icon">₹</div>
              <div className="card-label">Pending Employees</div>
              <div className="card-value">{totals.pendingCount}</div>
            </div>
          </div>
        )}

        {isManager && (
          <div className="summary-cards-row">
            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-label">Total Payroll</div>
              <div className="card-value">${(totals.totalPayroll).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="summary-card">
              <div className="card-icon orange-icon">⏱️</div>
              <div className="card-label">Pending Salaries</div>
              <div className="card-value orange">₱{(totals.pending).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="summary-card">
              <div className="card-icon green-icon">✓</div>
              <div className="card-label">Released Salaries</div>
              <div className="card-value green">₱{(totals.released).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="summary-card">
              <div className="card-icon">₹</div>
              <div className="card-label">Pending Employees</div>
              <div className="card-value">{totals.pendingCount}</div>
            </div>
          </div>
        )}

        {!isAdmin && !isManager && (
          <div className="permission-notice">
            <p>⚠️ Salary management features are restricted to admin and manager users only.</p>
          </div>
        )}

        {isAdmin && (
          <div className="payroll-header">
            <h1>Payroll Period: {payrollPeriod}</h1>
            <div className="subtext">Manage salary records, release payments, and export reports.</div>
          </div>
        )}

        {isManager && (
          <div className="payroll-header">
            <h1>Payroll Period: {payrollPeriod}</h1>
            <div className="subtext">Release payments and generate reports.</div>
          </div>
        )}

        <div className="search-actions">
          <div className="search-field">
            <input
              type="text"
              placeholder="Search by employee ID, name, or period..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="search-btn" aria-label="Search">🔍</button>
          </div>
          {isAdmin && (
            <button className="add-record-btn" onClick={() => setShowAddModal(true)}>+ Add Salary Record</button>
          )}
          {isAdmin && (
            <div className="export-dropdown-wrapper">
              <button className="export-btn" onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
                <span>📥</span> Export
              </button>
              {exportDropdownOpen && (
                <div className="export-dropdown-menu">
                  <div className="export-range">
                    <label>
                      <input type="radio" checked={reportRange === 'week'} onChange={() => setReportRange('week')} /> Weekly
                    </label>
                    <label>
                      <input type="radio" checked={reportRange === 'month'} onChange={() => setReportRange('month')} /> Monthly
                    </label>
                  </div>
                  <button onClick={() => exportReport('PDF')}>Export as .pdf</button>
                  <button onClick={() => exportReport('XLSX')}>Export as .xlsx</button>
                  <button onClick={() => exportReport('CSV')}>Export as .csv</button>
                </div>
              )}
            </div>
          )}
          {isManager && (
            <div className="export-dropdown-wrapper">
              <button className="export-btn" onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
                <span>📊</span> Generate Report
              </button>
              {exportDropdownOpen && (
                <div className="export-dropdown-menu">
                  <div className="export-range">
                    <label>
                      <input type="radio" checked={reportRange === 'week'} onChange={() => setReportRange('week')} /> Weekly
                    </label>
                    <label>
                      <input type="radio" checked={reportRange === 'month'} onChange={() => setReportRange('month')} /> Monthly
                    </label>
                  </div>
                  <button onClick={() => exportReport('PDF')}>Generate as .pdf</button>
                  <button onClick={() => exportReport('XLSX')}>Generate as .xlsx</button>
                </div>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="period-controls">
            <div className="date-inputs">
              <div className="date-group">
                <label>From:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="mm/dd/yyyy" />
              </div>
              <div className="date-group">
                <label>To:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="mm/dd/yyyy" />
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="status-filters">
            {Object.keys(statusCounts).map((status) => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        )}

        {(isAdmin || isManager) && (
          <div className="table-wrapper">
            <table className="salary-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Trips</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Release Date</th>
                <th>Claimed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">No salary records yet. Connect to the database to load data.</td>
                </tr>
              )}
              {paginatedRecords.map((record) => (
                <tr key={`${record.employeeId}-${record.period || record.releaseDate || 'row'}`}>
                  <td>{record.employeeId}</td>
                  <td>{record.employeeName}</td>
                  <td>{record.trips}</td>
                  <td>${(parseFloat(record.salary) || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-pill ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{formatDisplayDate(record.releaseDate)}</td>
                  <td>{formatDisplayDate(record.claimedDate)}</td>
                  <td>
                    {isAdmin && (
                      <div className="action-dropdown-wrapper">
                        <button 
                          className="manage-btn-dropdown"
                          onClick={() => setActionDropdownOpen(actionDropdownOpen === record.employeeId ? null : record.employeeId)}
                        >
                          Manage <span>▼</span>
                        </button>
                        {actionDropdownOpen === record.employeeId && (
                          <div className="action-dropdown-menu">
                            <button onClick={() => { handleManageClick(record); setActionDropdownOpen(null); }}>
                              ⚙️ Edit Details
                            </button>
                            {record.status !== 'Released' && (
                              <button onClick={() => { releasePayment(record); setActionDropdownOpen(null); }}>
                                ✓ Release Payment
                              </button>
                            )}
                            {record.status === 'Released' && (
                              <button onClick={() => { markClaimed(record); setActionDropdownOpen(null); }}>
                                ✓ Mark Claimed
                              </button>
                            )}
                            <button onClick={() => { setReceiptRecord(record); setShowReceiptModal(true); setActionDropdownOpen(null); }}>
                              📄 View Receipt
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {isManager && (
                      <div className="action-dropdown-wrapper">
                        <button 
                          className="manage-btn-dropdown"
                          onClick={() => setActionDropdownOpen(actionDropdownOpen === record.employeeId ? null : record.employeeId)}
                        >
                          Manage <span>▼</span>
                        </button>
                        {actionDropdownOpen === record.employeeId && (
                          <div className="action-dropdown-menu">
                            {record.status !== 'Released' && (
                              <button onClick={() => { releasePayment(record); setActionDropdownOpen(null); }}>
                                ✓ Release Payment
                              </button>
                            )}
                            {record.status === 'Released' && (
                              <button onClick={() => { markClaimed(record); setActionDropdownOpen(null); }}>
                                ✓ Mark Claimed
                              </button>
                            )}
                            <button onClick={() => { setReceiptRecord(record); setShowReceiptModal(true); setActionDropdownOpen(null); }}>
                              📄 View Receipt
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {(isAdmin || isManager) && filteredRecords.length > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                ‹‹
              </button>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                ››
              </button>
            </div>
            <div className="items-per-page">
              <label>Items per page:</label>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add Salary Record Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetAddForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Salary Record</h2>
              <button className="close-btn" onClick={() => { setShowAddModal(false); resetAddForm(); }}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Add a new salary record for a pay period. Existing records cannot be edited to prevent disputes.</p>
              {addError && <div className="error-text">{addError}</div>}
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  placeholder="emp007"
                  value={addData.employeeId}
                  onChange={(e) => setAddData({ ...addData, employeeId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={addData.employeeName}
                  onChange={(e) => setAddData({ ...addData, employeeName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Pay Period</label>
                <input
                  type="text"
                  placeholder="November 1-15, 2025"
                  value={addData.period}
                  onChange={(e) => setAddData({ ...addData, period: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={addData.salary}
                  onChange={(e) => setAddData({ ...addData, salary: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setShowAddModal(false); resetAddForm(); }}>Cancel</button>
              <button className="btn-add" onClick={handleAddRecord}>Add Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Salary Modal */}
      {showManageModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Salary Record</h2>
              <button className="close-btn" onClick={() => setShowManageModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee</label>
                <div className="readonly">{selectedRecord.employeeName}</div>
              </div>
              <div className="form-group">
                <label>Trips</label>
                <input
                  type="number"
                  value={editData.trips}
                  onChange={(e) => setEditData({ ...editData, trips: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Salary Amount</label>
                <input
                  type="number"
                  value={editData.salary}
                  onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={selectedRecord.status} onChange={(e) => updateStatus(selectedRecord.employeeId, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Released">Released</option>
                  <option value="Claimed">Claimed</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setShowManageModal(false)}>Cancel</button>
              <button className="btn primary" onClick={saveManageChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {showReceiptModal && receiptRecord && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="receipt-logo">
                <div className="logo-icon">📦</div>
                <h2>Gracewell NEXUS</h2>
              </div>
              <div className="receipt-period-label">
                <div className="period-label">Pay Period</div>
                <div className="period-value">October 16-31, 2025</div>
              </div>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span className="receipt-label">Employee Name:</span>
                <span className="receipt-value">{receiptRecord.employeeName}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Employee ID:</span>
                <span className="receipt-value">{receiptRecord.employeeId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Position:</span>
                <span className="receipt-value">{receiptRecord.position || 'N/A'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Department:</span>
                <span className="receipt-value">{receiptRecord.department || 'N/A'}</span>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-row">
                <span className="receipt-label-bold">Gross Salary:</span>
                <span className="receipt-amount-green">₱ {receiptRecord.salary?.toLocaleString()}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Deductions:</span>
                <span className="receipt-amount-red">- ₱ 0</span>
              </div>
              <div className="receipt-row net-salary">
                <span className="receipt-label-bold">Net Salary:</span>
                <span className="receipt-amount-blue">₱ {receiptRecord.salary?.toLocaleString()}</span>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-footer-info">
                <div className="receipt-date-row">
                  <span className="date-label">Release Date:</span>
                  <span className="date-value">{receiptRecord.releaseDate ? new Date(receiptRecord.releaseDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="receipt-date-row">
                  <span className="date-label">Claimed Date:</span>
                  <span className="date-value">{receiptRecord.claimedDate ? new Date(receiptRecord.claimedDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="receipt-status-badge">
                  <span className={`status-badge-${receiptRecord.status?.toLowerCase()}`}>{receiptRecord.status}</span>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="btn-receipt-close" onClick={() => setShowReceiptModal(false)}>Close</button>
              <button className="btn-receipt-download" onClick={() => alert('PDF download coming soon')}>Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {showReceiptModal && receiptRecord && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="receipt-logo">
                <div className="logo-icon">📦</div>
                <h2>Gracewell NEXUS</h2>
              </div>
              <div className="receipt-period-label">
                <div className="period-label">Pay Period</div>
                <div className="period-value">October 16-31, 2025</div>
              </div>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span className="receipt-label">Employee Name:</span>
                <span className="receipt-value">{receiptRecord.employeeName}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Employee ID:</span>
                <span className="receipt-value">{receiptRecord.employeeId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Position:</span>
                <span className="receipt-value">{receiptRecord.position || 'N/A'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Department:</span>
                <span className="receipt-value">{receiptRecord.department || 'N/A'}</span>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-row">
                <span className="receipt-label-bold">Gross Salary:</span>
                <span className="receipt-amount-green">₱ {receiptRecord.salary?.toLocaleString()}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Deductions:</span>
                <span className="receipt-amount-red">- ₱ 0</span>
              </div>
              <div className="receipt-row net-salary">
                <span className="receipt-label-bold">Net Salary:</span>
                <span className="receipt-amount-blue">₱ {receiptRecord.salary?.toLocaleString()}</span>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-footer-info">
                <div className="receipt-date-row">
                  <span className="date-label">Release Date:</span>
                  <span className="date-value">{receiptRecord.releaseDate ? new Date(receiptRecord.releaseDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="receipt-date-row">
                  <span className="date-label">Claimed Date:</span>
                  <span className="date-value">{receiptRecord.claimedDate ? new Date(receiptRecord.claimedDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="receipt-status-badge">
                  <span className={`status-badge-${receiptRecord.status?.toLowerCase()}`}>{receiptRecord.status}</span>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="btn-receipt-close" onClick={() => setShowReceiptModal(false)}>Close</button>
              <button className="btn-receipt-download" onClick={() => alert('PDF download coming soon')}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryTracker;
