import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// 认证相关
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getUser: () => api.get('/auth/user'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// 记账记录
export const recordAPI = {
  list: (params) => api.get('/records', { params }),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
  getToday: () => api.get('/records/today'),
  getYearlyStats: (params) => api.get('/records/stats/yearly', { params }),
  getMonthlyStats: (params) => api.get('/records/stats/monthly', { params }),
  getDailyTrend: (params) => api.get('/records/stats/daily', { params }),
  export: (params) => api.get('/records/export', { params }),
};

// 分类
export const categoryAPI = {
  list: () => api.get('/categories'),
  getByType: (type) => api.get(`/categories/type/${type}`),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// 预算
export const budgetAPI = {
  list: () => api.get('/budgets'),
  getUsage: (params) => api.get('/budgets/usage', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// 支付渠道
export const channelAPI = {
  list: () => api.get('/channels'),
  create: (data) => api.post('/channels', data),
  delete: (id) => api.delete(`/channels/${id}`),
};

export default api;
