import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin Follow-Up APIs
export const getDashboardStats = async () => {
  const response = await api.get('/admin/followups/dashboard');
  return response.data;
};

export const getAllFollowUps = async () => {
  const response = await api.get('/admin/followups');
  return response.data;
};

export const getFollowUpById = async (id) => {
  const response = await api.get(`/admin/followups/${id}`);
  return response.data;
};

export const getOverdueFollowUps = async () => {
  const response = await api.get('/admin/followups/overdue');
  return response.data;
};

export const getTodayFollowUps = async () => {
  const response = await api.get('/admin/followups/today');
  return response.data;
};

export const getTomorrowFollowUps = async () => {
  const response = await api.get('/admin/followups/tomorrow');
  return response.data;
};

export const getAllEmployees = async () => {
  const response = await api.get('/admin/followups/employees');
  return response.data;
};

export const getEmployeePerformance = async () => {
  const response = await api.get('/admin/followups/employees/performance');
  return response.data;
};

export const getEmployeePerformanceById = async (id) => {
  const response = await api.get(`/admin/followups/employees/${id}/performance`);
  return response.data;
};

export const filterFollowUps = async (filters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.employee) params.append('employee', filters.employee);
  if (filters.status) params.append('status', filters.status);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  
  const response = await api.get(`/admin/followups/filter?${params.toString()}`);
  return response.data;
};

export default api;
