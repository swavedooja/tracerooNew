import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const MaterialsAPI = {
  list: (params) => api.get('/materials', { params }).then(r => r.data),
  get: (code) => api.get(`/materials/${code}`).then(r => r.data),
  create: (payload) => api.post('/materials', payload).then(r => r.data),
  update: (code, payload) => api.put(`/materials/${code}`, payload).then(r => r.data),
  remove: (code) => api.delete(`/materials/${code}`).then(r => r.data),
  images: (code) => api.get(`/materials/${code}/images`).then(r => r.data),
  documents: (code) => api.get(`/materials/${code}/documents`).then(r => r.data),
  uploadImage: (code, file, type = 'material') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    return api.post(`/materials/${code}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  uploadDocument: (code, file, docType) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', docType);
    return api.post(`/materials/${code}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
};

export const PackagingAPI = {
  create: (payload) => api.post('/packaging-hierarchy', payload).then(r => r.data),
  get: (id) => api.get(`/packaging-hierarchy/${id}`).then(r => r.data),
  update: (id, payload) => api.put(`/packaging-hierarchy/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/packaging-hierarchy/${id}`).then(r => r.data),
  preview: (id) => api.get(`/packaging-hierarchy/${id}/preview`).then(r => r.data),
};

export const WarehouseAPI = {
  list: () => api.get('/warehouses').then(r => r.data),
  get: (code) => api.get(`/warehouses/${code}`).then(r => r.data),
  create: (payload) => api.post('/warehouses', payload).then(r => r.data),
  update: (code, payload) => api.put(`/warehouses/${code}`, payload).then(r => r.data),
  remove: (code) => api.delete(`/warehouses/${code}`).then(r => r.data),
};

export const LabelTemplateAPI = {
  list: () => api.get('/label-templates').then(r => r.data),
  get: (id) => api.get(`/label-templates/${id}`).then(r => r.data),
  create: (payload) => api.post('/label-templates', payload).then(r => r.data),
  update: (id, payload) => api.put(`/label-templates/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/label-templates/${id}`).then(r => r.data),
};

export const InventoryAPI = {
  list: () => api.get('/inventory').then(r => r.data),
  registerBatch: (payload) => api.post('/inventory/register-batch', payload).then(r => r.data),
  packBox: (payload) => api.post('/inventory/pack-box', payload).then(r => r.data),
};

export const TraceAPI = {
  getHistory: (serial) => api.get(`/trace/${serial}`).then(r => r.data),
};

export default api;
