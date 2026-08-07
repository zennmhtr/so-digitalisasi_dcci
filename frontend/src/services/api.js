import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (roleData) => api.post('/roles', roleData),
  update: (id, roleData) => api.put(`/roles/${id}`, roleData),
  delete: (id) => api.delete(`/roles/${id}`),
};

export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (deptData) => api.post('/departments', deptData),
  update: (id, deptData) => api.put(`/departments/${id}`, deptData),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const jobDescriptionsAPI = {
  getAll: (params) => api.get('/jobdescriptions', { params }),
  getById: (id) => api.get(`/jobdescriptions/${id}`),
  getByMemberPNK: (memberNoPNK) => api.get(`/jobdescriptions/member/${memberNoPNK}`),
  getByDepartment: (departmentId) => api.get(`/jobdescriptions/department/${departmentId}`),
  create: (jobdescData) => api.post('/jobdescriptions', jobdescData),
  update: (id, jobdescData) => api.put(`/jobdescriptions/${id}`, jobdescData),
  delete: (id) => api.delete(`/jobdescriptions/${id}`),
  approve: (id) => api.put(`/jobdescriptions/${id}/approve`),
};

export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getByDepartment: (departmentId) => api.get(`/members/department/${departmentId}`),
  create: (memberData) => api.post('/members', memberData),
  update: (id, memberData) => api.put(`/members/${id}`, memberData),
  delete: (id) => api.delete(`/members/${id}`),
};

export const soChangeRequestsAPI = {
  getAll: (params) => api.get('/so-change-requests', { params }),
  getById: (id) => api.get(`/so-change-requests/${id}`),
  create: (requestData) => api.post('/so-change-requests', requestData),
  approve: (id, reviewComments) => api.put(`/so-change-requests/${id}/approve`, { reviewComments }),
  revisi: (id, reviewComments) => api.put(`/so-change-requests/${id}/revisi`, { reviewComments }),
  reject: (id, reviewComments) => api.put(`/so-change-requests/${id}/reject`, { reviewComments }),
  cancel: (id) => api.put(`/so-change-requests/${id}/cancel`),
  delete: (id) => api.delete(`/so-change-requests/${id}`),
};

export const soBagianDataAPI = {
  get: (bagianId) => api.get(`/so-bagian-data/${bagianId}`),
  getAll: () => api.get('/so-bagian-data'),
  save: (bagianId, data) => api.put(`/so-bagian-data/${bagianId}`, data),
  addBox: (bagianId, box) => api.post(`/so-bagian-data/${bagianId}/box`, box),
  deleteBox: (bagianId, boxId) => api.delete(`/so-bagian-data/${bagianId}/box/${boxId}`),
};

export const soBagianChangeRequestsAPI = {
  getAll: (params) => api.get('/so-bagian-change-requests', { params }),
  getById: (id) => api.get(`/so-bagian-change-requests/${id}`),
  create: (requestData) => api.post('/so-bagian-change-requests', requestData),
  approve: (id, reviewComments) => api.put(`/so-bagian-change-requests/${id}/approve`, { reviewComments }),
  revisi: (id, reviewComments) => api.put(`/so-bagian-change-requests/${id}/revisi`, { reviewComments }),
  reject: (id, reviewComments) => api.put(`/so-bagian-change-requests/${id}/reject`, { reviewComments }),
  cancel: (id) => api.put(`/so-bagian-change-requests/${id}/cancel`),
  delete: (id) => api.delete(`/so-bagian-change-requests/${id}`),
};

export const soBagianDepartmentsAPI = {
  getAll: () => api.get("/so-bagian-departments"),
};

export const jobDescChangeRequestsAPI = {
  getAll: (params) => api.get('/jobdesc-change-requests', { params }),
  getById: (id) => api.get(`/jobdesc-change-requests/${id}`),
  create: (requestData) => api.post('/jobdesc-change-requests', requestData),
  approve: (id, reviewComments) => api.put(`/jobdesc-change-requests/${id}/approve`, { reviewComments }),
  revisi: (id, reviewComments) => api.put(`/jobdesc-change-requests/${id}/revisi`, { reviewComments }),
  reject: (id, reviewComments) => api.put(`/jobdesc-change-requests/${id}/reject`, { reviewComments }),
  cancel: (id) => api.put(`/jobdesc-change-requests/${id}/cancel`),
  delete: (id) => api.delete(`/jobdesc-change-requests/${id}`),
}

export const matriksSkillChangeRequestsAPI = {
  getAll: (params) => api.get('/matriks-skill-change-requests', { params }),
  getById: (id) => api.get(`/matriks-skill-change-requests/${id}`),
  create: (requestData) => api.post('/matriks-skill-change-requests', requestData),
  approve: (id, reviewComments) => api.put(`/matriks-skill-change-requests/${id}/approve`, { reviewComments }),
  revisi: (id, reviewComments) => api.put(`/matriks-skill-change-requests/${id}/revisi`, { reviewComments }),
  reject: (id, reviewComments) => api.put(`/matriks-skill-change-requests/${id}/reject`, { reviewComments }),
  cancel: (id) => api.put(`/matriks-skill-change-requests/${id}/cancel`),
  delete: (id) => api.delete(`/matriks-skill-change-requests/${id}`),
  getAllData: () => api.get('/matriks-skill-change-requests/data/all'),
  initializeData: (data) => api.post('/matriks-skill-change-requests/data/initialize', data),
}

export const matriksSkillDepartmentsAPI = {
  getAll: () => api.get('/matriks-skill-departments'),
};

export default api;