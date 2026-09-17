import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach Authorization header if token exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('vpms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 responses, clear stale token and notify the app
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vpms_token');
      window.dispatchEvent(new Event('vpms_auth_expired'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

export const locationsAPI = {
  getAll: () => API.get('/locations'),
  getById: (id) => API.get(`/locations/${id}`),
  create: (data) => API.post('/locations', data),
  update: (id, data) => API.put(`/locations/${id}`, data),
  delete: (id) => API.delete(`/locations/${id}`),
};

export const slotsAPI = {
  getByLocation: (locationId, filters = {}) => API.get(`/slots/location/${locationId}`, { params: filters }),
  getReserved: (locationId) => API.get('/slots/reserved', { params: { locationId } }),
  create: (data) => API.post('/slots', data),
  updateStatus: (id, statusData) => API.patch(`/slots/${id}/status`, statusData),
  reserve: (id, customerData) => API.post(`/slots/${id}/reserve`, customerData),
  delete: (id) => API.delete(`/slots/${id}`),
};

export const vehiclesAPI = {
  entry: (entryData) => API.post('/vehicles/entry', entryData),
  getActive: (locationId) => API.get('/vehicles/active', { params: { locationId } }),
  exit: (exitData) => API.post('/vehicles/exit', exitData),
};

export const billingAPI = {
  pay: (paymentData) => API.post('/billing/pay', paymentData),
  getTransactions: (vehicleNumber) => API.get('/billing/transactions', { params: { vehicleNumber } }),
};

export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
};

export default API;
