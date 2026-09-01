const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

const TOKEN_KEY = 'lakshya_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getHeaders(extraHeaders = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const config = {
    ...options,
    headers: getHeaders(options.headers),
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.unverified = !!data.unverified;
    error.email = data.email;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication & Session
  async getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const data = await request('/api/auth/me');
      return data.user || null;
    } catch {
      setToken(null);
      return null;
    }
  },

  async signUp(email, password, name, role = 'user') {
    return await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  async signIn(email, password) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async verifyEmail(token) {
    const data = await request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async resendVerification(email) {
    return await request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email) {
    return await request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token, newPassword) {
    return await request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async signOut() {
    setToken(null);
    return true;
  },

  // User Profile
  async getProfile() {
    const data = await request('/api/users/me');
    return data;
  },

  async updateProfile(updates) {
    return await request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async changePassword(currentPassword, newPassword) {
    return await request('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Projects & Stage-Gate Pipeline
  async getProjects() {
    return await request('/api/projects');
  },

  async getDashboardSummary() {
    return await request('/api/dashboard/summary');
  },

  async getProject(id) {
    return await request(`/api/projects/${id}`);
  },

  async createProject(projectData) {
    return await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async saveDraft(id, updates) {
    return await request(`/api/projects/${id}/draft`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async submitApproval(id, { to_stage, comments }) {
    return await request(`/api/projects/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ to_stage, comments }),
    });
  },

  async getProjectHistory(id) {
    return await request(`/api/projects/${id}/history`);
  },

  async deleteProject(id) {
    return await request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Management
  async getUsers() {
    return await request('/api/users');
  },

  async updateUserRole(id, role) {
    return await request(`/api/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async toggleUserVerification(id, verified) {
    return await request(`/api/users/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
  },

  async resendUserVerification(id) {
    return await request(`/api/users/${id}/resend-verification`, {
      method: 'POST',
    });
  },

  async deleteUser(id) {
    return await request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};
