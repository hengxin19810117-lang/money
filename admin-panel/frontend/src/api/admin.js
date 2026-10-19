import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? 'http://127.0.0.1:3002/api/admin' : '/api/admin',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const adminAPI = {
  login: (data) => api.post('/login', data),
  getDashboard: () => api.get('/dashboard'),
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  getRecords: (params) => api.get('/records', { params }),
  getStatistics: () => api.get('/statistics'),
};

export default api;
