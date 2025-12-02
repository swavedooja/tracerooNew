import axios from 'axios';
import { mockData } from './mockData';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || process.env.NODE_ENV === 'production'; // Default to mock in production for GitHub Pages demo if not specified otherwise

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Helper to simulate network delay
const mockDelay = (data, ms = 500) => new Promise(resolve => setTimeout(() => resolve(data), ms));

// Helper to handle API calls with fallback to mock data
const withFallback = (apiCall, mockResponse) => {
  if (USE_MOCK) return mockDelay(mockResponse);
  return apiCall().catch(err => {
    console.warn('API call failed, falling back to mock data:', err);
    return mockDelay(mockResponse);
  });
};

export const MaterialsAPI = {
  list: (params) => withFallback(() => api.get('/materials', { params }).then(r => r.data), mockData.materials.list),
  get: (code) => withFallback(() => api.get(`/materials/${code}`).then(r => r.data), mockData.materials.details(code)),
  create: (payload) => withFallback(() => api.post('/materials', payload).then(r => r.data), { ...payload, id: 'MOCK-NEW-ID' }),
  update: (code, payload) => withFallback(() => api.put(`/materials/${code}`, payload).then(r => r.data), { ...payload, material_code: code }),
  remove: (code) => withFallback(() => api.delete(`/materials/${code}`).then(r => r.data), { success: true }),
  images: (code) => withFallback(() => api.get(`/materials/${code}/images`).then(r => r.data), mockData.materials.images),
  documents: (code) => withFallback(() => api.get(`/materials/${code}/documents`).then(r => r.data), mockData.materials.documents),
  uploadImage: (code, file, type = 'material') => {
    const mockResponse = { id: Math.random(), url: URL.createObjectURL(file), type };
    if (USE_MOCK) return mockDelay(mockResponse);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    return api.post(`/materials/${code}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
      .catch(err => {
        console.warn('Upload failed, falling back to mock:', err);
        return mockDelay(mockResponse);
      });
  },
  uploadDocument: (code, file, docType) => {
    const mockResponse = { id: Math.random(), name: file.name, url: '#', type: docType };
    if (USE_MOCK) return mockDelay(mockResponse);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', docType);
    return api.post(`/materials/${code}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
      .catch(err => {
        console.warn('Upload failed, falling back to mock:', err);
        return mockDelay(mockResponse);
      });
  },
};

export const PackagingAPI = {
  create: (payload) => withFallback(() => api.post('/packaging-hierarchy', payload).then(r => r.data), { ...payload, id: 'PKG-NEW' }),
  get: (id) => withFallback(() => api.get(`/packaging-hierarchy/${id}`).then(r => r.data), mockData.packaging.get(id)),
  update: (id, payload) => withFallback(() => api.put(`/packaging-hierarchy/${id}`, payload).then(r => r.data), { ...payload, id }),
  remove: (id) => withFallback(() => api.delete(`/packaging-hierarchy/${id}`).then(r => r.data), { success: true }),
  preview: (id) => withFallback(() => api.get(`/packaging-hierarchy/${id}/preview`).then(r => r.data), mockData.packaging.preview(id)),
};

export const WarehouseAPI = {
  list: () => withFallback(() => api.get('/warehouses').then(r => r.data), mockData.warehouses.list),
  get: (code) => withFallback(() => api.get(`/warehouses/${code}`).then(r => r.data), mockData.warehouses.details(code)),
  create: (payload) => withFallback(() => api.post('/warehouses', payload).then(r => r.data), { ...payload, warehouse_code: 'WH-NEW' }),
  update: (code, payload) => withFallback(() => api.put(`/warehouses/${code}`, payload).then(r => r.data), { ...payload, warehouse_code: code }),
  remove: (code) => withFallback(() => api.delete(`/warehouses/${code}`).then(r => r.data), { success: true }),
};

export const LabelTemplateAPI = {
  list: () => withFallback(() => api.get('/label-templates').then(r => r.data), mockData.labelTemplates.list),
  get: (id) => withFallback(() => api.get(`/label-templates/${id}`).then(r => r.data), mockData.labelTemplates.details(id)),
  create: (payload) => withFallback(() => api.post('/label-templates', payload).then(r => r.data), { ...payload, id: Math.floor(Math.random() * 1000) }),
  update: (id, payload) => withFallback(() => api.put(`/label-templates/${id}`, payload).then(r => r.data), { ...payload, id }),
  remove: (id) => withFallback(() => api.delete(`/label-templates/${id}`).then(r => r.data), { success: true }),
};

export const InventoryAPI = {
  list: () => withFallback(() => api.get('/inventory').then(r => r.data), mockData.inventory.list),
  registerBatch: (payload) => withFallback(() => api.post('/inventory/register-batch', payload).then(r => r.data), { success: true, ...payload }),
  packBox: (payload) => withFallback(() => api.post('/inventory/pack-box', payload).then(r => r.data), { success: true, ...payload }),
};

export const TraceAPI = {
  getHistory: (serial) => withFallback(() => api.get(`/trace/${serial}`).then(r => r.data), mockData.trace.history(serial)),
};

export default api;
