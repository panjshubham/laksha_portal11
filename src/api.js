const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

function getAuthHeader() {
  const token = localStorage.getItem('lakshya_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const config = { ...options, headers };
  
  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const api = {
  signup: (email, password, name) => request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getDashboardSummary: () => request('/dashboard/summary'),
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  saveDraft: (id, updates) => request(`/projects/${id}/draft`, { method: 'PATCH', body: JSON.stringify(updates) }),
  submitApproval: (id, payload) => request(`/projects/${id}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
  getProjectHistory: (id) => request(`/projects/${id}/history`),
  bulkUpdate: (updates) => request('/projects/bulk', { method: 'PATCH', body: JSON.stringify({ updates }) }),
  getProfile: () => request('/users/me'),
  updateProfile: (data) => request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data) => request('/users/me/password', { method: 'PATCH', body: JSON.stringify(data) }),
};
