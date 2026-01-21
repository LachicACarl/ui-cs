# Gracewell NEXUS - React Version

This is a React.js version of the Gracewell NEXUS Employee Management System with role-based access control.

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The app will open at http://localhost:3000

## Features

- **Role-Based Access Control**: Admin, Manager, and Employee roles
- **Authentication**: Simple login system with role-based redirects
- **Admin Dashboard**: System administration and management controls
- **Manager Dashboard**: Time correction approvals and department oversight
- **Employee Dashboard**: Attendance tracking and salary information
- **Face Detection**: Employee check-in system
- **Responsive Design**: Works on desktop and mobile devices

## Test Credentials

### Admin
- **ID**: `admin`
- **Password**: any value

### Manager
- **ID**: `manager`
- **Password**: any value

### Employee
- **ID**: `employee`
- **Password**: any value

### Alternate Credentials
- Admin IDs: A001, A002, A003
- Manager IDs: M001, M002, M003
- Employee IDs: E001, E002, etc.

## Project Structure

```
src/
├── components/
│   ├── Navbar.js
│   ├── Navbar.css
│   └── ProtectedRoute.js
├── pages/
│   ├── Login.js
│   ├── Login.css
│   ├── AdminDashboard.js
│   ├── AdminDashboard.css
│   ├── ManagerDashboard.js
│   ├── ManagerDashboard.css
│   ├── EmployeeDashboard.js
│   ├── EmployeeDashboard.css
│   ├── FaceDetection.js
│   └── FaceDetection.css
├── App.js
├── App.css
├── index.js
└── index.css
```

## Technologies Used

- **React**: Frontend framework
- **React Router**: Client-side routing
- **Chart.js & react-chartjs-2**: Data visualization
- **CSS3**: Styling

## Features by Role

### Admin
- View system logs and alerts
- Monitor recent activities
- System administration controls
- Access to all features

### Manager
- Approve/deny employee time corrections
- View department statistics
- Manage employee attendance
- Oversight of department operations

### Employee
- View personal attendance
- Check salary status
- Face detection check-in
- View personal records

## Security

- Protected routes based on user role
- LocalStorage authentication
- Automatic redirects for unauthorized access
- Session management with logout functionality

## Future Enhancements

- Backend API integration
- Database connection
- Real face detection implementation
- Email notifications
- Advanced reporting
- User profile customization
