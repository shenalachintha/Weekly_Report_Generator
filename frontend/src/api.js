const API_BASE = 'http://localhost:5004/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, token may have expired
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getCurrentUser: () => request('/auth/me'),
  },

  reports: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.userId) query.append('userId', params.userId);
      if (params.projectId) query.append('projectId', params.projectId);
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.weekStartDate) query.append('weekStartDate', params.weekStartDate);
      if (params.page) query.append('page', params.page);
      if (params.pageSize) query.append('pageSize', params.pageSize);
      return request(`/reports?${query.toString()}`);
    },
    getById: (id) => request(`/reports/${id}`),
    createDraft: (reportData) =>
      request('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      }),
    updateDraft: (id, reportData) =>
      request(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reportData),
      }),
    submit: (id) =>
      request(`/reports/${id}/submit`, {
        method: 'POST',
      }),
    review: (id, reviewData) =>
      request(`/reports/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
    getVersions: (id) => request(`/reports/${id}/versions`),
  },

  projects: {
    getAll: () => request('/projects'),
    getById: (id) => request(`/projects/${id}`),
    create: (projectData) =>
      request('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),
    update: (id, projectData) =>
      request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      }),
    delete: (id) =>
      request(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  users: {
    getAll: () => request('/users'),
    getProfile: (id) => request(`/users/${id}/profile`),
    updateRole: (id, role) =>
      request(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    delete: (id) =>
      request(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  dashboard: {
    getSummary: (weekStartDate) => {
      const query = weekStartDate ? `?weekStartDate=${weekStartDate}` : '';
      return request(`/dashboard/summary${query}`);
    },
    getCharts: () => request('/dashboard/charts'),
    getSideBySide: (weekStartDate, sectionType = 'Blockers') => {
      const query = new URLSearchParams();
      if (weekStartDate) query.append('weekStartDate', weekStartDate);
      query.append('sectionType', sectionType);
      return request(`/dashboard/side-by-side?${query.toString()}`);
    },
  },

  ai: {
    query: (prompt, projectId, weekStartDate) =>
      request('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt, projectId, weekStartDate }),
      }),
    getSummary: (weekStartDate) => {
      const query = weekStartDate ? `?weekStartDate=${weekStartDate}` : '';
      return request(`/ai/summary${query}`);
    },
  },
};
