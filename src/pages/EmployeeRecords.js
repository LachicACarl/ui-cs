import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './EmployeeRecords.css';
import { apiClient } from '../utils/authService';

const EmployeeRecords = ({ user, onLogout }) => {
  // RBAC per Gracewell NEXUS: Admin can edit. Manager can view. Employee read-only.
  const canEditRecords = user?.userRole === 'admin' || user?.userRole === 'super_admin';
  const canViewRecords = ['admin', 'super_admin', 'manager'].includes(user?.userRole);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeRole = (value) => {
    const role = (value || '').toLowerCase();
    if (['super_admin', 'admin', 'manager', 'employee'].includes(role)) {
      return role;
    }
    return 'employee';
  };

  const normalizeStatus = (value) => {
    if (!value) return 'active';
    return String(value).toLowerCase() === 'inactive' ? 'inactive' : 'active';
  };

  const formatStatus = (value) => {
    return String(value || 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
  };

  const parseName = (fullName) => {
    if (!fullName) return { firstName: '', middleName: '', lastName: '' };
    
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return { firstName: parts[0], middleName: '', lastName: '' };
    } else if (parts.length === 2) {
      return { firstName: parts[0], middleName: '', lastName: parts[1] };
    } else {
      // 3 or more parts: first, middle(s), last
      return {
        firstName: parts[0],
        middleName: parts.slice(1, -1).join(' '),
        lastName: parts[parts.length - 1]
      };
    }
  };

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (departmentFilter !== 'All') params.append('department', departmentFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const { data } = await apiClient.get(`/employees?${params.toString()}`);
      
      const transformed = (data.employees || []).map(e => ({
        id: e.employee_id,
        name: e.name,
        position: e.position || e.role,
        department: e.department || 'N/A',
        status: formatStatus(e.status),
        joinDate: e.created_at ? e.created_at.split('T')[0] : '',
        email: e.email,
        phone: e.phone || e.contact_number || '555-0000'
      }));
      
      setEmployees(transformed);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrPayload, setQrPayload] = useState({ employeeId: '', qrImageUrl: '' });
  const [addStep, setAddStep] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    firstName: '',
    middleName: '',
    lastName: '',
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

  const handleSaveEdit = async () => {
    if (!editFormData.name || !editFormData.position || !editFormData.email) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const { data } = await apiClient.put(`/employees/${editFormData.id}`, {
        name: editFormData.name,
        email: editFormData.email,
        role: normalizeRole(editFormData.position),
        department: editFormData.department,
        status: normalizeStatus(editFormData.status)
      });

      if (data?.success) {
        await fetchEmployees();
        setShowEditModal(false);
        setSelectedEmployee(null);
      } else {
        alert(data?.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update employee');
    }
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

  const handleNameChange = (e) => {
    const fullName = e.target.value;
    const { firstName, middleName, lastName } = parseName(fullName);
    setNewEmployee({
      ...newEmployee,
      name: fullName,
      firstName,
      middleName,
      lastName
    });
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.employeeId || !newEmployee.position || !newEmployee.department || !newEmployee.joinDate || !newEmployee.name || !newEmployee.email) {
      alert('Please fill all required fields on this step.');
      return;
    }

    try {
      const { data } = await apiClient.post('/employees', {
        employeeId: newEmployee.employeeId.trim(),
        name: newEmployee.name,
        email: newEmployee.email,
        role: 'employee', // Set role as 'employee' - position is separate
        department: newEmployee.department,
        position: newEmployee.position, // Send position separately
        phone: newEmployee.phone || newEmployee.contactNumber // Send phone separately
      });

      if (data?.success) {
        await fetchEmployees();
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
        const qrImageUrl = data.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(newEmployee.employeeId.trim())}`;
        setQrPayload({ employeeId: newEmployee.employeeId.trim(), qrImageUrl });
        setShowQrModal(true);
      } else {
        alert(data?.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Add employee error:', error);
      alert(error?.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleDeactivateEmployee = async (id) => {
    if (window.confirm('Deactivate this employee? They will remain in the list but marked as Inactive.')) {
      try {
        const employee = employees.find(e => e.id === id);
        const { data } = await apiClient.put(`/employees/${id}`, {
          name: employee.name,
          email: employee.email,
          role: 'employee',
          department: employee.department,
          status: 'inactive',
          position: employee.position,
          phone: employee.phone
        });

        if (data?.success) {
          await fetchEmployees();
          setShowViewModal(false);
          alert('Employee marked as inactive');
        } else {
          alert(data?.message || 'Failed to deactivate employee');
        }
      } catch (error) {
        console.error('Deactivate error:', error);
        alert('Failed to deactivate employee');
      }
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
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                  className="form-input"
                >
                  <option value="">Select department</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="IT">IT</option>
                </select>
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
                      onChange={handleNameChange}
                      className="form-input"
                      placeholder="Enter first middle last name"
                    />
                  </div>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={newEmployee.firstName}
                      readOnly
                      className="form-input"
                      style={{backgroundColor: '#f0f0f0'}}
                    />
                  </div>
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      value={newEmployee.middleName}
                      readOnly
                      className="form-input"
                      style={{backgroundColor: '#f0f0f0'}}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={newEmployee.lastName}
                      readOnly
                      className="form-input"
                      style={{backgroundColor: '#f0f0f0'}}
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
                    <label>Department *</label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select department</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <select
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      className="form-input"
                      disabled={!newEmployee.department}
                    >
                      <option value="">Select position</option>
                      {newEmployee.department === 'Finance' && (
                        <option value="Finance Head">Finance Head</option>
                      )}
                      {newEmployee.department === 'Operations' && (
                        <>
                          <option value="Operations Head">Operations Head</option>
                          <option value="Trucker">Trucker</option>
                          <option value="Porter">Porter</option>
                        </>
                      )}
                      {newEmployee.department === 'IT' && (
                        <>
                          <option value="IT Head">IT Head</option>
                          <option value="Developer">Developer</option>
                          <option value="IT Support">IT Support</option>
                        </>
                      )}
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

      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee QR Code</h2>
              <button className="close-btn" onClick={() => setShowQrModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <p>Employee ID: <strong>{qrPayload.employeeId}</strong></p>
              {qrPayload.qrImageUrl && (
                <img src={qrPayload.qrImageUrl} alt="Employee QR Code" style={{ width: 220, height: 220 }} />
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-submit" onClick={() => window.open(qrPayload.qrImageUrl, '_blank', 'noopener,noreferrer')}>
                Open QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRecords;
