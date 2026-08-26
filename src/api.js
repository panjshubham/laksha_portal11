const API_BASE = 'http://localhost:3001/api';

function getAuthHeader() {
  const token = localStorage.getItem('lakshya_token');
  return token ? { 'Authorization': \`Bearer \${token}\` } : {};
}

async function request(endpoint, options = {}) {
  const url = \`\${API_BASE}\${endpoint}\`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const config = { ...options, headers };
  
  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || \`HTTP error! status: \${response.status}\`);
  }

  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getDashboardSummary: () => request('/dashboard/summary'),
  getProjects: () => request('/projects'),
  getProject: (id) => request(\`/projects/\${id}\`),
  saveDraft: (id, payload) => request(\`/projects/\${id}/draft\`, { method: 'PATCH', body: JSON.stringify(payload) }),
  submitApproval: (id, payload) => request(\`/projects/\${id}/submit\`, { method: 'POST', body: JSON.stringify(payload) }),
  bulkUpdate: (updates) => request('/projects/bulk', { method: 'PATCH', body: JSON.stringify({ updates }) }),
};
