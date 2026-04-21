import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bca_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const albumsAPI = {
  getAll: () => api.get('/albums'),
  getOne: (id) => api.get(`/albums/${id}`),
  create: (data) => api.post('/albums', data),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`)
};

export const photosAPI = {
  upload: (formData, onProgress) =>
    api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }),
  delete: (id) => api.delete(`/photos/${id}`),
  setCover: (albumId, photoId) => api.put(`/photos/${albumId}/cover`, { photoId })
};

export default api;
