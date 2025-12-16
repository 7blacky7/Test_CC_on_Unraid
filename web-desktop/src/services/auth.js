import api from './api';

// TODO: Implement authentication service with login, logout, and token management
export const authService = {
  /**
   * Login with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{user: Object, token: string}>}
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      const { token, user } = response.data;

      // Store token in localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      return { user, token };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local token
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Check if user is authenticated and get user info
   * @returns {Promise<Object|null>}
   */
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }

    try {
      const response = await api.get('/api/auth/me');
      return response.data.user;
    } catch (error) {
      localStorage.removeItem('auth_token');
      return null;
    }
  },

  /**
   * Get stored auth token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Check if user has valid token
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};
