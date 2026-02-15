// Backend API base URL (configure via REACT_APP_API_BASE_URL)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

let authToken = null;

const setAuthHeader = (token) => {
  authToken = token || null;
};

const buildHeaders = (headers = {}, body) => {
  const baseHeaders = { ...headers };
  if (!body || body instanceof FormData) {
    return baseHeaders;
  }
  if (!baseHeaders['Content-Type']) {
    baseHeaders['Content-Type'] = 'application/json';
  }
  return baseHeaders;
};

const request = async (method, path, body, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const headers = buildHeaders(options.headers, body);

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers
  };

  if (body !== undefined && body !== null) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!response.ok) {
    const error = new Error('Request failed');
    error.response = { status: response.status, data };
    throw error;
  }

  return { data };
};

export const apiClient = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options)
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
};

export const loginUser = async (employeeId, password) => {
  try {
    const { data } = await apiClient.post('/auth/login', {
      employeeId,
      password
    });

    const accessToken = data?.accessToken || data?.token;
    const user = data?.user || data?.profile || data;

    if (!accessToken || !user) {
      return { success: false, error: 'Invalid login response from server.' };
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authData', JSON.stringify(user));
    setAuthHeader(accessToken);

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || 'Login failed. Please try again.'
    };
  }
};

export const verifySession = async () => {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    logoutUser();
    return null;
  }

  setAuthHeader(token);

  try {
    const { data } = await apiClient.get('/auth/me');
    const user = data?.user || data;
    localStorage.setItem('authData', JSON.stringify(user));
    return user;
  } catch {
    logoutUser();
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authData');
  setAuthHeader(null);
};

export const hasRole = (user, requiredRole) => {
  if (!user) return false;
  if (requiredRole === 'admin') {
    return user.userRole === 'admin' || user.userRole === 'super_admin';
  }
  if (requiredRole === 'manager') {
    return ['manager', 'admin', 'super_admin'].includes(user.userRole);
  }
  if (requiredRole === 'employee') {
    return true;
  }
  return false;
};

export const getPermissions = (role) => {
  const permissions = {
    super_admin: {
      viewAttendance: true,
      manageSalary: true,
      releasePayroll: true,
      manageEmployees: true,
      editEmployees: true,
      manageUsers: true,
      viewReports: true,
      editCompanySettings: true
    },
    admin: {
      viewAttendance: true,
      manageSalary: true,
      releasePayroll: true,
      manageEmployees: true,
      editEmployees: true,
      manageUsers: true,
      viewReports: true,
      editCompanySettings: true
    },
    manager: {
      viewAttendance: true,
      manageSalary: false,
      releasePayroll: false,
      manageEmployees: true,
      editEmployees: false,
      manageUsers: false,
      viewReports: true,
      editCompanySettings: false
    },
    employee: {
      viewAttendance: true,
      manageSalary: false,
      releasePayroll: false,
      manageEmployees: false,
      editEmployees: false,
      manageUsers: false,
      viewReports: false,
      editCompanySettings: false
    }
  };

  return permissions[role] || {};
};

// Log audit trail (server-side validation recommended)
export const logAudit = async (action, details) => {
  try {
    await apiClient.post('/audit/log', {
      action,
      details,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData')).employeeId : null
    });
  } catch (error) {
    console.warn('Audit log failed:', error);
  }
};
