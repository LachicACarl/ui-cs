import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ProfileSetting.css';
import { apiClient } from '../utils/authService';

const ProfileSetting = ({ user, onLogout, setUser }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: user?.employeeName?.split(' ')[0] || 'Roberta',
    lastName: user?.employeeName?.split(' ').slice(1).join(' ') || 'Rubilyn',
    email: 'roberta.gonzales@gracewell.com',
    position: 'Truck Driver',
    department: 'Operations',
    contactNumber: '+63 917 123 4567',
    emergencyContact: '+63 917 987 6543',
    emergencyContactName: 'Maria Gonzales',
  });

  const [profileImage, setProfileImage] = useState(user?.profileImage || localStorage.getItem('userProfileImage') || null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profileData);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Employment history data
  const [employmentHistory] = useState([
    {
      id: 1,
      event: 'Hired',
      date: '2022-01-15',
      details: 'Joined as Truck Driver',
      status: 'completed'
    },
    {
      id: 2,
      event: 'Position Update',
      date: '2023-06-01',
      details: 'Promoted to Senior Driver',
      status: 'completed'
    },
    {
      id: 3,
      event: 'Performance Review',
      date: '2024-01-10',
      details: 'Annual performance review - Excellent',
      status: 'completed'
    },
    {
      id: 4,
      event: 'Account Status',
      date: '2024-01-26',
      details: 'Account status: Active',
      status: 'completed'
    }
  ]);

  const handleEditClick = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleSaveChanges = async () => {
    try {
      const { data } = await apiClient.put('/users/profile', {
        name: `${editData.firstName} ${editData.lastName}`,
        email: editData.email,
        department: editData.department
      });

      if (data?.success) {
        setProfileData(editData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(error?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleChangePhoto = () => {
    setShowImageModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (tempImage) {
      try {
        // Convert base64 to blob
        const response = await fetch(tempImage);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('photo', blob, 'profile.jpg');

        const { data } = await apiClient.post('/users/upload-photo', formData);
        if (data?.imageUrl) {
          setProfileImage(data.imageUrl);
          setShowImageModal(false);
          setTempImage(null);
          if (setUser) {
            setUser(prev => ({ ...prev, profileImage: data.imageUrl }));
          }
          alert('Profile photo updated successfully!');
        } else {
          alert(data?.message || 'Failed to upload photo');
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        alert(error?.response?.data?.message || 'Failed to upload photo');
      }
    }
  };

  const handleCancelImageUpload = () => {
    setShowImageModal(false);
    setTempImage(null);
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdatePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Show email confirmation modal
    setShowChangePasswordModal(false);
    setShowEmailConfirmModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="profile-content">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your personal information and account settings</p>
        </div>

        <div className="profile-main">
          {/* Profile Picture Section - Minimal */}
          <div className="profile-picture-section-compact">
            <div className="profile-avatar-small">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image-small" />
              ) : (
                user?.employeeName?.substring(0, 2).toUpperCase() || 'GC'
              )}
            </div>
            <button className="btn-change-photo-compact" onClick={handleChangePhoto}>
              Change Photo
            </button>
          </div>

          {/* Personal Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!isEditing && (
                <button className="btn-edit" onClick={handleEditClick}>
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={editData.contactNumber}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="position"
                      value={editData.position}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={editData.department}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled
                    />
                  </div>
                </div>

                <div className="form-buttons">
                  <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                  <button className="btn-save" onClick={handleSaveChanges}>Save Changes</button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <div className="info-group">
                    <label>First Name</label>
                    <p>{profileData.firstName}</p>
                  </div>
                  <div className="info-group">
                    <label>Last Name</label>
                    <p>{profileData.lastName}</p>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <label>Email</label>
                    <p>{profileData.email}</p>
                  </div>
                  <div className="info-group">
                    <label>Contact Number</label>
                    <p>{profileData.contactNumber}</p>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-group">
                    <label>Position</label>
                    <p>{profileData.position}</p>
                  </div>
                  <div className="info-group">
                    <label>Department</label>
                    <p>{profileData.department}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contact Section */}
          <div className="profile-section">
            <h2>Emergency Contact</h2>
            <div className="profile-info">
              <div className="info-row">
                <div className="info-group">
                  <label>Emergency Contact Name</label>
                  <p>{profileData.emergencyContactName}</p>
                </div>
                <div className="info-group">
                  <label>Emergency Contact Number</label>
                  <p>{profileData.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Security</h2>
              <button className="btn-change-password" onClick={handleChangePassword}>
                🔒 Change Password
              </button>
            </div>
            <div className="security-info">
              <p>Last password change: 30 days ago</p>
              <p>Two-factor authentication: <span className="status-disabled">Not enabled</span></p>
            </div>
          </div>

          {/* Employment History Section */}
          <div className="profile-section">
            <h2>Employment History</h2>
            <div className="history-timeline">
              {employmentHistory.map((record, index) => (
                <div key={record.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="history-header">
                      <h3>{record.event}</h3>
                      <span className="history-date">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    <p className="history-details">{record.details}</p>
                  </div>
                  {index < employmentHistory.length - 1 && <div className="timeline-line"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button 
                className="close-btn"
                onClick={() => setShowChangePasswordModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowChangePasswordModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-submit"
                onClick={handleUpdatePassword}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {showEmailConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowEmailConfirmModal(false)}>
          <div className="modal-content email-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEmailConfirmModal(false)}>×</button>
            <div className="modal-body text-center">
              <div className="email-icon">📧</div>
              <h2>Check your email</h2>
              <p>We've sent an email to <strong>{profileData.email}</strong> to confirm your password change.</p>
              <button 
                className="btn-submit btn-gotit"
                onClick={() => setShowEmailConfirmModal(false)}
              >
                Got it
              </button>
              <p className="resend-text">
                Don't receive the email? <span className="resend-link">Resend</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={handleCancelImageUpload}>
          <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Profile Photo</h2>
              <button className="modal-close" onClick={handleCancelImageUpload}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="image-upload-area">
                {tempImage ? (
                  <div className="image-preview-container">
                    <img src={tempImage} alt="Preview" className="image-preview" />
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <p>Click to select image or drag and drop</p>
                    <p className="upload-hint">JPG, PNG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={(input) => {
                    if (input) input.click = () => input.click();
                  }}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="file-input"
                  id="image-input"
                  style={{ display: 'none' }}
                />
              </div>
              
              <label htmlFor="image-input" className="btn-choose-file">
                Choose File
              </label>

              {tempImage && (
                <p className="image-info">Image selected and ready to save</p>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={handleCancelImageUpload}
              >
                Cancel
              </button>
              <button 
                className="btn-submit"
                onClick={handleSaveImage}
                disabled={!tempImage}
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetting;
