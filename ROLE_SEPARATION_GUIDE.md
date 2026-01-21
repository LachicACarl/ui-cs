# Role-Based Access Control Implementation Guide

## Overview
The system now has three distinct user roles with proper separation and access control:

### 1. **ADMIN Role**
- **Employee IDs**: A001, A002, A003
- **Dashboard**: `admindashboard.html`
- **Access Rights**:
  - Full system administration
  - User management
  - Attendance management
  - Salary tracker
  - Employee records
  - System logs & alerts

### 2. **MANAGER Role**
- **Employee IDs**: M001, M002, M003
- **Dashboard**: `managerdashboard.html`
- **Access Rights**:
  - Attendance management (approve/deny time corrections)
  - Employee salary tracking
  - Employee records viewing
  - Department management features

### 3. **EMPLOYEE Role**
- **Employee IDs**: E001, E002, etc. (any ID not in Admin or Manager lists)
- **Dashboard**: `facedetection.html` (Employee Dashboard)
- **Access Rights**:
  - View personal attendance
  - Check salary status
  - View personal records
  - Submit time corrections

---

## Authentication Flow

### Login Page (`loginpage.html`)
When a user logs in:
1. Employee ID is checked against Admin and Manager lists
2. Appropriate role flags are set:
   - `isAdmin` (true/false)
   - `isManager` (true/false)
   - `userRole` ("admin", "manager", or "employee")
3. User is redirected to appropriate dashboard

```javascript
// Admin Credentials
Admin IDs: A001, A002, A003 → admindashboard.html

// Manager Credentials  
Manager IDs: M001, M002, M003 → managerdashboard.html

// Employee Credentials
Employee IDs: E001, E002, etc. → facedetection.html
```

---

## Access Control Implementation

### Files with Role Checks:

#### Admin-Only Access
- **admindashboard.html** - Requires: `isAdmin === 'true'` AND `userRole === 'admin'`
- **usermanagement.html** - Requires: `isAdmin === 'true'` AND `userRole === 'admin'`

#### Admin & Manager Access
- **managerdashboard.html** - Requires: `isManager === 'true'` OR `isAdmin === 'true'`
- **attendancemangement.html** - Requires: `isManager === 'true'` OR `isAdmin === 'true'`
- **employeerecord.html** - Requires: `isManager === 'true'` OR `isAdmin === 'true'`
- **truckingcompany.html** (Salary Tracker) - Requires: `isManager === 'true'` OR `isAdmin === 'true'`

#### Employee-Only Access
- **facedetection.html** - Redirects Admins/Managers to their dashboards
- Employees who try to access restricted pages are redirected to `facedetection.html`

#### No Role Check (Accessible to All Authenticated Users)
- dashboard.html
- profilesetting.html
- viewemployeerecord.html
- viewsalaryrecord.html
- employeedashboard.html

---

## LocalStorage Data Structure

Each user has the following stored in `localStorage`:

```javascript
{
  employeeId: "A001",           // User's ID
  employeeName: "A001",         // User's name (from actual user data)
  userRole: "admin",            // "admin", "manager", or "employee"
  isAdmin: "true",              // "true" or "false"
  isManager: "false"            // "true" or "false"
}
```

---

## Security Features

✓ **Dual Validation**: Each protected page checks BOTH role flags (`isAdmin`/`isManager`) AND `userRole`
✓ **Redirect on Unauthorized Access**: Users redirected to appropriate dashboard if they try to access unauthorized pages
✓ **Logout Clears All Flags**: All authentication data removed on logout
✓ **Role Separation**: Clear distinction between Admin and Manager capabilities

---

## Testing the System

### Test Admin Login:
```
Employee ID: A001
Password: (any value)
Expected: Redirect to Admin Dashboard
```

### Test Manager Login:
```
Employee ID: M001
Password: (any value)
Expected: Redirect to Manager Dashboard
```

### Test Employee Login:
```
Employee ID: E001
Password: (any value)
Expected: Redirect to Face Detection/Employee Dashboard
```

### Test Unauthorized Access:
If you manually change role values in `localStorage` or try to access protected URLs directly:
- **Admin pages** redirect non-admins to employee dashboard
- **Manager pages** redirect non-managers to employee dashboard
- **Employee pages** redirect admins/managers to their dashboards

---

## How to Add New Users

### To Add a New Admin:
Edit `loginpage.html` and add to `adminIds` array:
```javascript
const adminIds = ['A001', 'A002', 'A003', 'A004']; // Add new admin ID
```

### To Add a New Manager:
Edit `loginpage.html` and add to `managerIds` array:
```javascript
const managerIds = ['M001', 'M002', 'M003', 'M004']; // Add new manager ID
```

### To Add a New Employee:
No change needed! Any ID not in admin/manager lists automatically becomes an employee.

---

## Modified Files Summary

| File | Changes |
|------|---------|
| loginpage.html | Added manager role logic, role assignment based on ID |
| admindashboard.html | Dual validation for admin access, updated logout |
| managerdashboard.html | Updated to allow both managers and admins, updated logout |
| facedetection.html | Updated redirects based on role, updated logout |
| employeerecord.html | Added admin/manager access check, updated logout |
| attendancemangement.html | Added admin/manager access check, updated logout |
| truckingcompany.html | Added admin/manager access check, updated logout |
| usermanagement.html | Added strict admin-only access check, updated logout |

---

## Key Functions in Each File

### Access Check Functions
```javascript
// Admin-only (e.g., admindashboard.html)
function checkAdminAccess() {
  const isAdmin = localStorage.getItem('isAdmin');
  const userRole = localStorage.getItem('userRole');
  if (!isAdmin || isAdmin !== 'true' || userRole !== 'admin') {
    // Redirect to appropriate page
  }
}

// Manager and Admin (e.g., managerdashboard.html)
function checkManagerAccess() {
  const isManager = localStorage.getItem('isManager');
  const isAdmin = localStorage.getItem('isAdmin');
  if ((!isManager || isManager !== 'true') && (!isAdmin || isAdmin !== 'true')) {
    // Redirect to employee dashboard
  }
}

// Logout in all pages
function logout() {
  localStorage.removeItem('employeeId');
  localStorage.removeItem('employeeName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('isManager');
  window.location.href = 'loginpage.html';
}
```

---

## Future Enhancements

1. **Backend Integration**: Replace localStorage with server-side authentication
2. **Session Management**: Implement session timeouts
3. **Audit Logging**: Track all admin actions
4. **Permission Matrix**: More granular role permissions
5. **API Authorization**: Validate tokens on API endpoints
6. **Two-Factor Authentication**: Add 2FA for admin accounts

---

## Support

For questions or issues with the role-based access control system, refer to this guide or contact the development team.
