import API from './api';

export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('epharmacy_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await API.put('/users/profile', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('epharmacy_user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('epharmacy_user') || 'null');
  }
};
