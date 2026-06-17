// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  ACCOUNTANT: 'Accountant',
  PATIENT: 'Patient'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show'
};

// Payment Status
export const PAYMENT_STATUS = {
  SUCCESS: 'Success',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
  INSURANCE: 'Insurance'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'Appointment',
  PAYMENT: 'Payment',
  REMINDER: 'Reminder',
  LOW_STOCK: 'LowStock',
  ALERT: 'Alert'
};

// Timeframes for analytics
export const TIMEFRAMES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DDTHH:mm:ss',
  TIME: 'HH:mm'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 20, 50, 100]
};

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTER_SUCCESS: 'Registration successful! Please login.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SAVE_SUCCESS: 'Saved successfully!',
  SAVE_FAILED: 'Failed to save. Please try again.',
  DELETE_SUCCESS: 'Deleted successfully!',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Session expired. Please login again.'
};
// Quick Actions for Dashboard
export const QUICK_ACTIONS = [
  { label: 'Add Patient', action: 'patient', icon: '👥', color: '#2196F3', path: '/admin/patients' },
  { label: 'Add Appointment', action: 'appointment', icon: '📅', color: '#4CAF50', path: '/admin/appointments/new' },
  { label: 'Record Payment', action: 'payment', icon: '💰', color: '#FF9800', path: '/admin/finance' },
  { label: 'Add Expense', action: 'expense', icon: '📉', color: '#f44336', path: '/admin/finance' },
];

// Dashboard Stats Configuration
export const DASHBOARD_STATS = [
  { key: 'totalPatients', label: 'Total Patients', icon: '👥', color: '#2196F3' },
  { key: 'todayAppointments', label: "Today's Appointments", icon: '📅', color: '#FF9800' },
  { key: 'totalRevenue', label: 'Monthly Revenue', icon: '💰', color: '#4CAF50' },
  { key: 'totalExpenses', label: 'Monthly Expenses', icon: '📉', color: '#f44336' },
  { key: 'pendingApprovals', label: 'Pending Approvals', icon: '⏳', color: '#FF9800' },
];

// Navigation Items
export const ADMIN_NAV_ITEMS = [
  { path: "/admin", icon: "📊", label: "Dashboard" },
  { path: "/admin/patients", icon: "👥", label: "Patients" },
  { path: "/admin/appointments", icon: "📅", label: "Appointments" },
  { path: "/admin/finance", icon: "💰", label: "Finance" },
  { path: "/admin/inventory", icon: "📦", label: "Inventory" },
  { path: "/admin/users", icon: "👤", label: "Users" },
  { path: "/admin/settings", icon: "⚙️", label: "Settings" }
];