import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './SalaryTracker.css';

const SalaryTracker = ({ user, onLogout }) => {
  const [year, setYear] = useState('2024');
  const [salaryData, setSalaryData] = useState([
    { id: 'S001', employeeId: 'E001', name: 'John Smith', baseSalary: 50000, bonus: 5000, deduction: 2000, netSalary: 53000, status: 'Pending', paymentDate: '2026-01-31' },
    { id: 'S002', employeeId: 'E002', name: 'Sarah Johnson', baseSalary: 55000, bonus: 6000, deduction: 2500, netSalary: 58500, status: 'Released', paymentDate: '2026-01-31' },
    { id: 'S003', employeeId: 'E003', name: 'Mike Davis', baseSalary: 48000, bonus: 4500, deduction: 1800, netSalary: 50700, status: 'Pending', paymentDate: '2026-01-31' },
    { id: 'S004', employeeId: 'E004', name: 'Emily Brown', baseSalary: 52000, bonus: 5500, deduction: 2200, netSalary: 55300, status: 'Released', paymentDate: '2026-01-31' },
    { id: 'S005', employeeId: 'E005', name: 'Robert Wilson', baseSalary: 60000, bonus: 7000, deduction: 3000, netSalary: 64000, status: 'Pending', paymentDate: '2026-01-31' },
  ]);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddSalaryModal, setShowAddSalaryModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [newSalary, setNewSalary] = useState({ name: '', baseSalary: '', bonus: '', deduction: '' });

  const handleReleasePayment = (id) => {
    setSalaryData(salaryData.map(salary =>
      salary.id === id ? { ...salary, status: 'Released' } : salary
    ));
  };

  const handleViewReceipt = (salary) => {
    setSelectedSalary(salary);
    setShowReceiptModal(true);
  };

  const handleAddSalary = () => {
    if (!newSalary.name || !newSalary.baseSalary || !newSalary.bonus || !newSalary.deduction) {
      alert('Please fill all fields');
      return;
    }

    const netSalary = parseFloat(newSalary.baseSalary) + parseFloat(newSalary.bonus) - parseFloat(newSalary.deduction);
    const newRecord = {
      id: `S${String(salaryData.length + 1).padStart(3, '0')}`,
      employeeId: `E${String(salaryData.length + 1).padStart(3, '0')}`,
      name: newSalary.name,
      baseSalary: parseFloat(newSalary.baseSalary),
      bonus: parseFloat(newSalary.bonus),
      deduction: parseFloat(newSalary.deduction),
      netSalary: netSalary,
      status: 'Pending',
      paymentDate: new Date().toISOString().split('T')[0]
    };

    setSalaryData([...salaryData, newRecord]);
    setShowAddSalaryModal(false);
    setNewSalary({ name: '', baseSalary: '', bonus: '', deduction: '' });
  };

  const exportToCSV = () => {
    const csv = [
      ['ID', 'Employee ID', 'Name', 'Base Salary', 'Bonus', 'Deduction', 'Net Salary', 'Status'],
      ...salaryData.map(s => [s.id, s.employeeId, s.name, s.baseSalary, s.bonus, s.deduction, s.netSalary, s.status])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${year}.csv`;
    a.click();
  };

  const totalBaseSalary = salaryData.reduce((sum, emp) => sum + emp.baseSalary, 0);
  const totalBonus = salaryData.reduce((sum, emp) => sum + emp.bonus, 0);
  const totalNetSalary = salaryData.reduce((sum, emp) => sum + emp.netSalary, 0);

  return (
    <div className="salary-page">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="salary-container">
        <div className="salary-header">
          <h1>Employee Salary Tracker</h1>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="year-select">
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>

        <div className="salary-stats">
          <div className="stat-card">
            <span className="stat-label">Total Base Salary</span>
            <span className="stat-value">${(totalBaseSalary / 1000).toFixed(0)}K</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Bonus</span>
            <span className="stat-value">${(totalBonus / 1000).toFixed(0)}K</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-label">Total Net Salary</span>
            <span className="stat-value">${(totalNetSalary / 1000).toFixed(0)}K</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-export" onClick={exportToCSV}>📥 Export</button>
          <button className="btn-add" onClick={() => setShowAddSalaryModal(true)}>➕ Add Salary</button>
        </div>

        <table className="salary-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Base Salary</th>
              <th>Bonus</th>
              <th>Deduction</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((salary) => (
              <tr key={salary.id}>
                <td>{salary.id}</td>
                <td>{salary.name}</td>
                <td>${salary.baseSalary.toLocaleString()}</td>
                <td>${salary.bonus.toLocaleString()}</td>
                <td>${salary.deduction.toLocaleString()}</td>
                <td className="net-salary">${salary.netSalary.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${salary.status.toLowerCase()}`}>
                    {salary.status}
                  </span>
                </td>
                <td className="action-cell">
                  <button 
                    className={`action-btn release ${salary.status === 'Released' ? 'disabled' : ''}`}
                    onClick={() => handleReleasePayment(salary.id)}
                    disabled={salary.status === 'Released'}
                  >
                    Release
                  </button>
                  <button className="action-btn edit">Edit</button>
                  <button 
                    className="action-btn receipt"
                    onClick={() => handleViewReceipt(salary)}
                  >
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedSalary && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Salary Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceiptModal(false)}>✕</button>
            </div>
            <div className="receipt-content">
              <div className="receipt-header">
                <h3>GRACEWELL NEXUS</h3>
                <p>Salary Receipt</p>
              </div>
              <div className="receipt-details">
                <div className="detail-row">
                  <span>Receipt ID:</span>
                  <span>{selectedSalary.id}</span>
                </div>
                <div className="detail-row">
                  <span>Employee:</span>
                  <span>{selectedSalary.name}</span>
                </div>
                <div className="detail-row">
                  <span>Payment Date:</span>
                  <span>{selectedSalary.paymentDate}</span>
                </div>
                <hr />
                <div className="detail-row">
                  <span>Base Salary:</span>
                  <span>${selectedSalary.baseSalary.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Bonus:</span>
                  <span>${selectedSalary.bonus.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Deduction:</span>
                  <span>-${selectedSalary.deduction.toLocaleString()}</span>
                </div>
                <hr />
                <div className="detail-row total">
                  <span>Net Salary:</span>
                  <span>${selectedSalary.netSalary.toLocaleString()}</span>
                </div>
                <hr />
                <div className="detail-row">
                  <span>Status:</span>
                  <span>{selectedSalary.status}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowReceiptModal(false)}>Close</button>
              <button className="btn-print" onClick={() => window.print()}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Salary Modal */}
      {showAddSalaryModal && (
        <div className="modal-overlay" onClick={() => setShowAddSalaryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Salary Record</h2>
              <button className="close-btn" onClick={() => setShowAddSalaryModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  value={newSalary.name}
                  onChange={(e) => setNewSalary({...newSalary, name: e.target.value})}
                  className="form-input"
                  placeholder="Enter employee name"
                />
              </div>
              <div className="form-group">
                <label>Base Salary</label>
                <input
                  type="number"
                  value={newSalary.baseSalary}
                  onChange={(e) => setNewSalary({...newSalary, baseSalary: e.target.value})}
                  className="form-input"
                  placeholder="Enter base salary"
                />
              </div>
              <div className="form-group">
                <label>Bonus</label>
                <input
                  type="number"
                  value={newSalary.bonus}
                  onChange={(e) => setNewSalary({...newSalary, bonus: e.target.value})}
                  className="form-input"
                  placeholder="Enter bonus"
                />
              </div>
              <div className="form-group">
                <label>Deduction</label>
                <input
                  type="number"
                  value={newSalary.deduction}
                  onChange={(e) => setNewSalary({...newSalary, deduction: e.target.value})}
                  className="form-input"
                  placeholder="Enter deduction"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddSalaryModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleAddSalary}>Add Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryTracker;
