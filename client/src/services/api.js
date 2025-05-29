import axios from 'axios';
import useAuthStore from '../store/authStore';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5097/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/email/${email}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
  getByDepartment: (departmentId) => api.get(`/users/department/${departmentId}`),
  getByTeam: (teamId) => api.get(`/users/team/${teamId}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getDetails: (id) => api.get(`/departments/${id}/details`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  deactivate: (id) => api.delete(`/departments/${id}`),
  getByUser: (userId) => api.get(`/departments/user/${userId}`),
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getDetails: (id) => api.get(`/teams/${id}/details`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  deactivate: (id) => api.delete(`/teams/${id}`),
  getByDepartment: (departmentId) => api.get(`/teams/department/${departmentId}`),
  getByUser: (userId) => api.get(`/teams/user/${userId}`),
};

// Tickets API
export const ticketsAPI = {
  // Basic CRUD
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  
  // Filtering
  getByUser: (userId) => api.get(`/tickets/user/${userId}`),
  getAssigned: (userId) => api.get(`/tickets/assigned/${userId}`),
  getByDepartment: (departmentId) => api.get(`/tickets/department/${departmentId}`),
  getByTeam: (teamId) => api.get(`/tickets/team/${teamId}`),
  getByDateRange: (startDate, endDate) => 
    api.get(`/tickets/analytics/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  // Actions
  assign: (id, userId) => api.post(`/tickets/${id}/assign`, { assignedToUserId: userId }),
  unassign: (id) => api.post(`/tickets/${id}/unassign`),
  updateStatus: (id, statusId) => api.post(`/tickets/${id}/status`, { statusId }),
  close: (id) => api.post(`/tickets/${id}/close`),
  reopen: (id) => api.post(`/tickets/${id}/reopen`),
  
  // Comments
  getComments: (id, includeInternal = false) => 
    api.get(`/tickets/${id}/comments?includeInternal=${includeInternal}`),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
  
  // Attachments
  getAttachments: (id) => api.get(`/tickets/${id}/attachments`),
  addAttachment: (id, data) => api.post(`/tickets/${id}/attachments`, data),
  removeAttachment: (attachmentId) => api.delete(`/tickets/attachments/${attachmentId}`),
  
  // Analytics
  getActiveCount: () => api.get('/tickets/analytics/active-count'),
  getCountByStatus: (statusId) => api.get(`/tickets/analytics/status/${statusId}/count`),
  getCountByUser: (userId) => api.get(`/tickets/analytics/user/${userId}/count`),
  getCountByDepartment: (departmentId) => api.get(`/tickets/analytics/department/${departmentId}/count`),
};

// Ticket Categories API
export const ticketCategoriesAPI = {
  getAll: () => api.get('/ticket-categories'),
  getActive: () => api.get('/ticket-categories/active'),
  getById: (id) => api.get(`/ticket-categories/${id}`),
  create: (data) => api.post('/ticket-categories', data),
  update: (id, data) => api.put(`/ticket-categories/${id}`, data),
  deactivate: (id) => api.delete(`/ticket-categories/${id}`),
};

// Ticket Priorities API
export const ticketPrioritiesAPI = {
  getAll: () => api.get('/ticket-priorities'),
  getById: (id) => api.get(`/ticket-priorities/${id}`),
  create: (data) => api.post('/ticket-priorities', data),
  update: (id, data) => api.put(`/ticket-priorities/${id}`, data),
  delete: (id) => api.delete(`/ticket-priorities/${id}`),
};

// Ticket Statuses API
export const ticketStatusesAPI = {
  getAll: () => api.get('/ticket-statuses'),
  getById: (id) => api.get(`/ticket-statuses/${id}`),
  create: (data) => api.post('/ticket-statuses', data),
  update: (id, data) => api.put(`/ticket-statuses/${id}`, data),
  delete: (id) => api.delete(`/ticket-statuses/${id}`),
  getTicketCount: (id) => api.get(`/ticket-statuses/${id}/tickets-count`),
};

// FAQ API
export const faqAPI = {
  // Categories
  getCategories: () => api.get('/faq/categories'),
  getCategoryWithItems: (categoryId) => api.get(`/faq/categories/${categoryId}`),
  createCategory: (data) => api.post('/faq/categories', data),
  
  // Items
  getActiveFAQs: () => api.get('/faq'),
  getFAQById: (id) => api.get(`/faq/${id}`),
  searchFAQs: (searchTerm) => api.get(`/faq/search?searchTerm=${encodeURIComponent(searchTerm)}`),
  createFAQ: (data) => api.post('/faq', data),
};

export default api;