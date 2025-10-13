import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (roleData) => api.post('/roles', roleData),
  update: (id, roleData) => api.put(`/roles/${id}`, roleData),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (deptData) => api.post('/departments', deptData),
  update: (id, deptData) => api.put(`/departments/${id}`, deptData),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Job Descriptions API
export const jobDescriptionsAPI = {
  getAll: (params) => api.get('/jobdescriptions', { params }),
  getById: (id) => api.get(`/jobdescriptions/${id}`),
  getByMemberPNK: (memberNoPNK) => api.get(`/jobdescriptions/member/${memberNoPNK}`),
  create: (jobdescData) => api.post('/jobdescriptions', jobdescData),
  update: (id, jobdescData) => api.put(`/jobdescriptions/${id}`, jobdescData),
  delete: (id) => api.delete(`/jobdescriptions/${id}`),
  approve: (id) => api.put(`/jobdescriptions/${id}/approve`),
};

export default api;