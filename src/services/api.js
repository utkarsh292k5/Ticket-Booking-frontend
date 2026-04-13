import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', refreshToken),
};

// Movie APIs
export const movieAPI = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  getByStatus: (status) => api.get(`/movies/status/${status}`),
  create: (movie) => api.post('/admin/movies', movie),
  update: (id, movie) => api.put(`/admin/movies/${id}`, movie),
  delete: (id) => api.delete(`/admin/movies/${id}`),
};

// Theatre APIs
export const theatreAPI = {
  getAll: (city) => api.get('/theatres', { params: { city } }),
  getById: (id) => api.get(`/theatres/${id}`),
  create: (theatre) => api.post('/admin/theatres', theatre),
  update: (id, theatre) => api.put(`/admin/theatres/${id}`, theatre),
  delete: (id) => api.delete(`/admin/theatres/${id}`),
  getScreens: (theatreId) => api.get(`/theatres/${theatreId}/screens`),
};

// Screen APIs
export const screenAPI = {
  create: (screen) => api.post('/admin/screens', screen),
  getSeats: (screenId) => api.get(`/screens/${screenId}/seats`),
  createSeats: (screenId, seats) => api.post(`/admin/screens/${screenId}/seats`, seats),
  deleteSeats: (screenId) => api.delete(`/admin/screens/${screenId}/seats`),
};

// Show APIs
export const showAPI = {
  getShows: (movieId, date, city) => api.get('/shows', { params: { movieId, date, city } }),
  getById: (id) => api.get(`/shows/${id}`),
  getSeatAvailability: (showId) => api.get(`/shows/${showId}/seats`),
  create: (show) => api.post('/admin/shows', show),
  update: (id, show) => api.put(`/admin/shows/${id}`, show),
  delete: (id) => api.delete(`/admin/shows/${id}`),
};

// Booking APIs
export const bookingAPI = {
  lockSeats: (lockRequest) => api.post(`/shows/${lockRequest.showId}/lock-seats`, lockRequest),
  unlockSeats: (showId, seatIds) => api.post(`/shows/${showId}/unlock-seats`, seatIds),
  initiate: (bookingRequest) => api.post('/bookings/initiate', bookingRequest),
  confirm: (bookingId, transactionId) => api.post('/bookings/confirm', null, {
    params: { bookingId, transactionId }
  }),
  getById: (id) => api.get(`/bookings/${id}`),
  getUserBookings: (userId) => api.get('/users/me/bookings', { params: { userId } }),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  getShowBookings: (showId) => api.get(`/admin/shows/${showId}/bookings`),
  getStats: () => api.get('/admin/bookings/stats'),
};

// Payment APIs
export const paymentAPI = {
  create: (transactionId, paymentMethod) => api.post('/payments/create', null, {
    params: { transactionId, paymentMethod }
  }),
  verify: (transactionId, gatewayResponse) => api.post('/payments/verify', null, {
    params: { transactionId, gatewayResponse }
  }),
  getByTransactionId: (transactionId) => api.get(`/payments/${transactionId}`),
};

export default api;