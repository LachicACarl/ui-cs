import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './UserManagement.css';
import { apiClient } from '../utils/authService';

const UserManagement = ({ user, onLogout }) => {
  // RBAC: Admin-only access enforcement (per Gracewell NEXUS flow)
  React.useEffect(() => {
    if (!user || (user.userRole !== 'admin' && user.userRole !== 'super_admin')) {
      window.location.href = '/';
    }
  }, [user]);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const allPermissions = [
    'View All',
    'View Own',
    'Edit All',
    'Edit Own',
    'Delete',
    'Manage Users',
    'Manage Attendance',
    'Manage Salary',
    'Export Data',
    'Generate Reports'
  ];

  const toggleUserStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const { data } = await apiClient.put(`/users/${id}/status`, { status: newStatus });
      if (data?.success) {
        await fetchUsers();
      } else {
        alert(data?.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error?.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleEdit = (userObj) => {
    setEditFormData({ ...userObj });
    setSelectedPermissions([...userObj.permissions]);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const { data } = await apiClient.put(`/users/${editFormData.id}/status`, {
        status: editFormData.status
      });
      if (data?.success) {
        await fetchUsers();
        setShowEditModal(false);
        alert('User updated successfully');
      } else {
        alert(data?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error?.response?.data?.message || 'Failed to update user');
    }
  };

  const togglePermission = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  return (
    <div className="users-page">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="users-container">
        <div className="users-header">
          <h1>User Management</h1>
        </div>

        <div className="users-stats">
          <div className="stat-card">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-card active">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{activeUsers}</span>
          </div>
          <div className="stat-card inactive">
            <span className="stat-label">Inactive Users</span>
            <span className="stat-value">{inactiveUsers}</span>
          </div>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Permissions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="text-center">Loading users...</td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">No users found</td>
              </tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="username">{u.username}</td>
                <td>
                  <span className={`role-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${u.status.toLowerCase()}`}>
                    {u.status}
                  </span>
                </td>
                <td>{u.lastLogin}</td>
                <td className="permissions-cell">
                  <span className="permission-count">{u.permissions.length} permissions</span>
                </td>
                <td>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(u)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`status-btn ${u.status.toLowerCase()}`}
                    onClick={() => toggleUserStatus(u.id)}
                  >
                    {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal with Permissions */}
      {showEditModal && editFormData && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>User ID (Read-only)</label>
                <input type="text" value={editFormData.id} disabled className="form-input" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  className="form-input"
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Employee</option>
                </select>
              </div>
              
              <div className="permissions-section">
                <h3>Permissions & Access</h3>
                <div className="permissions-grid">
                  {allPermissions.map(permission => (
                    <label key={permission} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                      />
                      <span>{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
