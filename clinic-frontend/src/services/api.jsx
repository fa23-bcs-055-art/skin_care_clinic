import axios from "axios";
import toast from "react-hot-toast";

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE_URL = API_URL.replace('/api', '');

console.log("🔧 API Configuration:", { API_URL, BASE_URL });

// Image URL Helper
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;

  let normalizedPath = imagePath.replace(/\\/g, '/').trim();
  normalizedPath = normalizedPath.replace(/^\/?uploads\/uploads\//, 'uploads/');
  normalizedPath = normalizedPath.replace(/^\/?uploads\//, '/uploads/');
  normalizedPath = normalizedPath.replace(/^\//, '');

  if (!normalizedPath.startsWith('uploads/')) {
    normalizedPath = `uploads/${normalizedPath}`;
  }
  normalizedPath = '/' + normalizedPath;

  return `${BASE_URL}${normalizedPath}`;
};

// Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true, // ADD THIS - Important for cookies
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.log('✅ Response:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (import.meta.env.DEV) console.error('❌ Error:', status, data);

      switch (status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          if (!window.location.pathname.includes('/login') && !window._isRedirectingToLogin) {
            window._isRedirectingToLogin = true;
            toast.error('Session expired. Please login again.');
            setTimeout(() => {
              window._isRedirectingToLogin = false;
              window.location.href = '/login';
            }, 1000);
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          toast.error(data.message || 'Validation failed.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

// LOGOUT FUNCTION - FIXED
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Always clear local storage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
};

// API Service Methods
export const apiService = {
  // ========== AUTH ==========
  login: (email, password, rememberMe) => api.post('/auth/login', { email, password, rememberMe }),
  register: (userData) => api.post('/auth/register', userData),
  logout: logoutUser,
  getCurrentUser: () => api.get('/auth/me'),

  // ========== PATIENTS ==========
  getPatients: () => api.get('/patients'),
  getPatient: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),

  // ========== APPOINTMENTS ==========
  getAppointments: () => api.get('/appointments'),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`),

  // ========== PAYMENTS ==========
  getPayments: () => api.get('/payments'),
  createPayment: (data) => api.post('/payments', data),
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  getPaymentStats: () => api.get('/payments/stats'),

  // ========== EXPENSES ==========
  getExpenses: () => api.get('/expenses'),
  createExpense: (data) => api.post('/expenses', data),

  // ========== INVENTORY ==========
  getInventory: () => api.get('/inventory'),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),

  // ========== DASHBOARD ==========
  getDashboardStats: () => api.get('/dashboard/stats'),
  getFullDashboard: () => api.get('/dashboard/full'),

  // ========== NOTIFICATIONS ==========
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/mark-all/read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  // ========== USERS (Admin) ==========
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),

  // ========== REPORTS ==========
  getReports: (params) => api.get('/reports', { params }),
  getFinancialSummary: (params) => api.get('/reports/financial-summary', { params }),
  exportReport: (format, params) => api.get(`/reports/export/${format}`, { params, responseType: 'blob' }),

  // ========== PAYROLL ==========
  getPayrollEmployees: () => api.get('/payroll/employees'),
  getSalaryConfig: (userId) => api.get(`/payroll/config/${userId}`),
  saveSalaryConfig: (userId, data) => api.post(`/payroll/config/${userId}`, data),
  getDefaultSalaries: () => api.get('/payroll/default-salaries'),
  generatePayrollBatch: (month, year) => api.post('/payroll/generate', { month, year }),
  getPayrollBatch: (month, year) => api.get(`/payroll/batch?month=${month}&year=${year}`),
  updateSalarySlipStatus: (slipId, status) => api.put(`/payroll/slips/${slipId}/status`, { status }),
  exportBankFile: (month, year) => api.get(`/payroll/export/bank?month=${month}&year=${year}`, { responseType: 'blob' }),
  getPayrollSummary: () => api.get('/payroll/summary'),

  // ========== INVOICES ==========
  getInvoices: () => api.get('/invoices'),
  createInvoice: (data) => api.post('/invoices', data),
  generateInvoiceFromPayment: (paymentId) => api.post(`/invoices/from-payment/${paymentId}`),
  downloadInvoice: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

export default api;