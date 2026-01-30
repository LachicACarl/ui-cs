import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './EmployeeRecords.css';

const EmployeeRecords = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [employees, setEmployees] = useState([
    { id: 'E001', name: 'John Smith', position: 'Senior Developer', department: 'IT', status: 'Active', joinDate: '2020-01-15', email: 'john.smith@gracewell.com', phone: '555-0101' },
    { id: 'E002', name: 'Sarah Johnson', position: 'HR Manager', department: 'HR', status: 'Active', joinDate: '2021-03-20', email: 'sarah.johnson@gracewell.com', phone: '555-0102' },
    { id: 'E003', name: 'Mike Davis', position: 'Project Manager', department: 'PM', status: 'Active', joinDate: '2019-06-10', email: 'mike.davis@gracewell.com', phone: '555-0103' },
    { id: 'E004', name: 'Emily Brown', position: 'UI/UX Designer', department: 'Design', status: 'Active', joinDate: '2022-02-14', email: 'emily.brown@gracewell.com', phone: '555-0104' },
    { id: 'E005', name: 'Robert Wilson', position: 'Business Analyst', department: 'Business', status: 'Inactive', joinDate: '2021-09-01', email: 'robert.wilson@gracewell.com', phone: '555-0105' },
    { id: 'E006', name: 'Lisa Anderson', position: 'Junior Developer', department: 'IT', status: 'Active', joinDate: '2023-01-10', email: 'lisa.anderson@gracewell.com', phone: '555-0106' },
    { id: 'E007', name: 'James Martinez', position: 'Accountant', department: 'Finance', status: 'Active', joinDate: '2020-11-05', email: 'james.martinez@gracewell.com', phone: '555-0107' },
    { id: 'E008', name: 'Jennifer Taylor', position: 'Marketing Specialist', department: 'Marketing', status: 'Active', joinDate: '2022-05-15', email: 'jennifer.taylor@gracewell.com', phone: '555-0108' },
  ]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    contactNumber: '',
    address: '',
    email: '',
    birthdate: '',
    idPhotoName: '',
    employeeId: '',
    position: '',
    department: '',
    joinDate: '',
    status: 'Active',
    salary: '',
    phone: ''
  });

  const itemsPerPage = 5;
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData({ ...employee });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.name || !editFormData.position || !editFormData.email) {
      alert('Please fill all required fields');
      return;
    }

    setEmployees(employees.map(emp => 
      emp.id === editFormData.id ? editFormData : emp
    ));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const validateAddStepOne = () => {
    if (!newEmployee.name || !newEmployee.contactNumber || !newEmployee.address || !newEmployee.email || !newEmployee.birthdate) {
      alert('Please fill all required fields on this step.');
      return false;
    }
    return true;
  };

  const handleNextAddStep = () => {
    if (validateAddStepOne()) {
      setAddStep(2);
    }
  };

  const handleBackAddStep = () => {
    setAddStep(1);
  };

  const handleAddEmployee = () => {
    if (!newEmployee.employeeId || !newEmployee.position || !newEmployee.department || !newEmployee.joinDate || !newEmployee.salary) {
      alert('Please fill all required fields on this step.');
      return;
    }

    const nextId = newEmployee.employeeId.trim() || `E${String(employees.length + 1).padStart(3, '0')}`;
    const newRecord = {
      id: nextId,
      name: newEmployee.name,
      position: newEmployee.position,
      department: newEmployee.department,
      status: newEmployee.status || 'Active',
      joinDate: newEmployee.joinDate,
      email: newEmployee.email,
      phone: newEmployee.contactNumber,
      salary: newEmployee.salary,
    };

    setEmployees([...employees, newRecord]);
    setShowAddModal(false);
    setAddStep(1);
    setNewEmployee({
      name: '',
      contactNumber: '',
      address: '',
      email: '',
      birthdate: '',
      idPhotoName: '',
      employeeId: '',
      position: '',
      department: '',
      joinDate: '',
      status: 'Active',
      salary: '',
      phone: ''
    });
  };

  const handleDeactivateEmployee = (id) => {
    if (window.confirm('Deactivate this employee? They will remain in the list but marked as Inactive.')) {
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: 'Inactive' } : emp));
      setShowViewModal(false);
      alert('Employee marked as inactive');
    }
  };

  return (
    <div className="records-page">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="records-container">
        <div className="records-header">
          <h1>Employee Records</h1>
          <button className="add-employee-btn" onClick={() => setShowAddModal(true)}>+ Add New Employee</button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Employee ID, Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Department</label>
            <select 
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option>All</option>
              <option>IT</option>
              <option>HR</option>
              <option>PM</option>
              <option>Design</option>
              <option>Business</option>
              <option>Finance</option>
              <option>Marketing</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="records-count">
          Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
        </div>

        <table className="records-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="emp-id">{employee.id}</td>
                <td className="emp-name">{employee.name}</td>
                <td>{employee.position}</td>
                <td>{employee.department}</td>
                <td>{new Date(employee.joinDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${employee.status.toLowerCase()}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="emp-email">{employee.email}</td>
                <td>
                  <button className="view-btn" onClick={() => handleView(employee)}>👁️ View</button>
                  <button className="edit-btn" onClick={() => handleEdit(employee)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => handleDeactivateEmployee(employee.id)}>🚫 Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-results">No employees found matching your search.</div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <p><strong>Employee ID:</strong> {selectedEmployee.id}</p>
                <p><strong>Name:</strong> {selectedEmployee.name}</p>
                <p><strong>Position:</strong> {selectedEmployee.position}</p>
                <p><strong>Department:</strong> {selectedEmployee.department}</p>
                <p><strong>Join Date:</strong> {new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowViewModal(false)}>Close</button>
              <button className="btn-delete" onClick={() => handleDeactivateEmployee(selectedEmployee.id)}>Deactivate Employee</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Employee Information</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee ID (Read-only)</label>
                <input type="text" value={editFormData.id} disabled className="form-input" />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input
                  type="text"
                  value={editFormData.position}
                  onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setAddStep(1); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="close-btn" onClick={() => { setShowAddModal(false); setAddStep(1); }}>×</button>
            </div>
            <div className="modal-body">
              {addStep === 1 && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="form-input"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      value={newEmployee.contactNumber}
                      onChange={(e) => setNewEmployee({...newEmployee, contactNumber: e.target.value})}
                      className="form-input"
                      placeholder="+63XXX XXX XXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent Address *</label>
                    <input
                      type="text"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                      className="form-input"
                      placeholder="Street No., Brgy..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="form-input"
                      placeholder="employee@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Birthdate *</label>
                    <input
                      type="date"
                      value={newEmployee.birthdate}
                      onChange={(e) => setNewEmployee({...newEmployee, birthdate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Photo *</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      className="form-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setNewEmployee({ ...newEmployee, idPhotoName: file ? file.name : '' });
                      }}
                    />
                    {newEmployee.idPhotoName && <small className="file-hint">Selected: {newEmployee.idPhotoName}</small>}
                  </div>
                </div>
              )}

              {addStep === 2 && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Employee ID Number *</label>
                    <input
                      type="text"
                      value={newEmployee.employeeId}
                      onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                      className="form-input"
                      placeholder="Enter ID e.g. E009"
                    />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      className="form-input"
                      placeholder="e.g. Truck Driver"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select department</option>
                      <option>IT</option>
                      <option>HR</option>
                      <option>PM</option>
                      <option>Design</option>
                      <option>Business</option>
                      <option>Finance</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hire Date *</label>
                    <input
                      type="date"
                      value={newEmployee.joinDate}
                      onChange={(e) => setNewEmployee({...newEmployee, joinDate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      value={newEmployee.status}
                      onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                      className="form-input"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Annual Salary *</label>
                    <input
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                      className="form-input"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {addStep === 1 && (
                <>
                  <button className="btn-cancel" onClick={() => { setShowAddModal(false); setAddStep(1); }}>Cancel</button>
                  <button className="btn-submit" onClick={handleNextAddStep}>Next</button>
                </>
              )}
              {addStep === 2 && (
                <>
                  <button className="btn-cancel" onClick={handleBackAddStep}>Back</button>
                  <button className="btn-submit" onClick={handleAddEmployee}>Add Employee</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRecords;
