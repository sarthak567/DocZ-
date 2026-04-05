import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('docz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('docz_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const authAPI = {
  login: async (walletAddress, signature, message) => {
    const { data } = await api.post('/users/auth', { walletAddress, signature, message });
    return data;
  },

  verifyWallet: async (walletAddress) => {
    const { data } = await api.get(`/users/verify/${walletAddress}`);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },

  getUserByWallet: async (wallet) => {
    const { data } = await api.get(`/users/wallet/${wallet}`);
    return data;
  },
};

export const documentAPI = {
  upload: async (formData) => {
    const file = formData.get('file');
    const title = formData.get('title');
    const documentType = formData.get('documentType');
    const description = formData.get('description');
    const tags = formData.get('tags');

    let fileData = null;
    if (file) {
      fileData = await fileToBase64(file);
    }

    const { data } = await api.post('/documents/upload', {
      title,
      documentType,
      description,
      tags,
      fileData,
      fileName: file?.name,
      mimeType: file?.type,
    });
    return data;
  },

  getAll: async (params = {}) => {
    const { data } = await api.get('/documents', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },

  verify: async (verifyData) => {
    const { data } = await api.post('/documents/verify', verifyData);
    return data;
  },

  share: async (id, expiresIn) => {
    const { data } = await api.post(`/documents/${id}/share`, { expiresIn });
    return data;
  },

  accessSharedLink: async (linkId) => {
    const { data } = await api.get(`/documents/shared/${linkId}`);
    return data;
  },

  manageAccess: async (id, accessData) => {
    const { data } = await api.post(`/documents/${id}/access`, accessData);
    return data;
  },

  revoke: async (id) => {
    const { data } = await api.post(`/documents/${id}/revoke`);
    return data;
  },

  getAuditLog: async (id) => {
    const { data } = await api.get(`/documents/${id}/audit`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/documents/stats');
    return data;
  },

  getTypes: async () => {
    const { data } = await api.get('/documents/types');
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/documents/${id}`);
    return data;
  },
};

export default api;
