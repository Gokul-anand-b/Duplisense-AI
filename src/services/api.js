/**
 * DupliSense AI — API Service Client (Django REST Framework Backend)
 * Connects React 19 Frontend to Django at http://127.0.0.1:8000/api/
 * Includes automatic graceful fallback to mockData if backend is unreachable.
 */
import {
  mockProjects,
  mockSimilarityResults,
  mockRecommendations,
  mockApprovals,
  mockAnalytics,
  mockUsers,
} from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Django API] Failed to fetch ${endpoint}, using mock fallback:`, err.message);
    return null;
  }
}

async function uploadFile(endpoint, formData) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Django API] Upload failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const authApi = {
  login: async (email, password) => {
    const result = await fetchJson('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result && result.user) return result.user;
    
    // Fallback: match mock user
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) return found;
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    const result = await fetchJson('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (result && result.user) return result.user;
    return { ...userData, id: Date.now() };
  },

  getMe: async () => {
    const result = await fetchJson('/auth/me/');
    return result || mockUsers[0];
  },

  getUsers: async () => {
    const result = await fetchJson('/auth/users/');
    return result || mockUsers;
  },
};

export const projectsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const result = await fetchJson(`/projects/${query ? '?' + query : ''}`);
    return result || mockProjects;
  },

  getById: async (id) => {
    const result = await fetchJson(`/projects/${id}/`);
    return result || mockProjects.find((p) => p.id === parseInt(id));
  },

  submit: async (projectData) => {
    const result = await fetchJson('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return result || { project: { ...projectData, id: Date.now() } };
  },

  extractFromDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await uploadFile('/projects/extract-from-document/', formData);
  },

  uploadCodebase: async (projectId, fileOrFormData) => {
    let formData = fileOrFormData;
    if (fileOrFormData instanceof File) {
      formData = new FormData();
      formData.append('zip_file', fileOrFormData);
    }
    return await uploadFile(`/projects/${projectId}/upload-code/`, formData);
  },

  getDownloadUrl: (projectId) => {
    return `${API_BASE_URL}/projects/${projectId}/download-code/`;
  },
};

export const similarityApi = {
  getAll: async () => {
    const result = await fetchJson('/similarity/');
    return result || mockSimilarityResults;
  },

  getById: async (id) => {
    const result = await fetchJson(`/similarity/${id}/`);
    return result || mockSimilarityResults.find((r) => r.id === parseInt(id));
  },

  scanProject: async (projectId) => {
    const result = await fetchJson('/similarity/scan/', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
    return result;
  },

  verifyPdfAgainstCode: async (fileOrData) => {
    let res;
    if (fileOrData instanceof File) {
      const formData = new FormData();
      formData.append('file', fileOrData);
      res = await uploadFile('/similarity/verify-pdf-against-code/', formData);
    } else {
      res = await fetchJson('/similarity/verify-pdf-against-code/', {
        method: 'POST',
        body: JSON.stringify(fileOrData),
      });
    }
    return res;
  },
};

export const approvalsApi = {
  getRecommendations: async (status = '') => {
    const result = await fetchJson(`/approvals/recommendations/${status ? '?status=' + status : ''}`);
    return result || (status ? mockRecommendations.filter(r => r.status === status) : mockRecommendations);
  },

  requestReuse: async (data) => {
    const result = await fetchJson('/approvals/request-reuse/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  },

  approve: async (id, payload = {}) => {
    const result = await fetchJson(`/approvals/recommendations/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result || { message: 'Approved' };
  },

  reject: async (id) => {
    const result = await fetchJson(`/approvals/recommendations/${id}/reject/`, {
      method: 'POST',
    });
    return result || { message: 'Rejected' };
  },

  getApprovals: async () => {
    const result = await fetchJson('/approvals/');
    return result || mockApprovals;
  },

  getDownloadUrl: (recommendationId) => {
    return `${API_BASE_URL}/approvals/recommendations/${recommendationId}/download-code/`;
  },
};

export const analyticsApi = {
  getOverview: async () => {
    const result = await fetchJson('/analytics/');
    return result || mockAnalytics;
  },
};
