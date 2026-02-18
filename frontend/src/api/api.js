import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Employee API
export const employeeApi = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Attendance API
export const attendanceApi = {
  getByEmployee: (employeeId) => api.get(`/attendance/${employeeId}`),
  mark: (data) => api.post('/attendance', data),
  getTodaySummary: () => api.get('/attendance/today/summary'),
  getStats: () => api.get('/attendance/today/summary'),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
