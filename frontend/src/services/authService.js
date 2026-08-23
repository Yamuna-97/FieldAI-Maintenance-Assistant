/**
 * Authentication Service for FieldAI Assistant
 * Handles login, signup, token storage, and session validation against MongoDB backend.
 */
import { fetchApi } from './api';

const TOKEN_KEY = 'fieldai_auth_token';
const USER_KEY = 'fieldai_auth_user';

export const authService = {
  /**
   * Log in an existing user.
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    const data = await fetchApi('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data && data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Register a new user with technician profile details.
   * @param {Object|string} dataOrName 
   * @param {string} [email] 
   * @param {string} [password] 
   * @param {string} [department] 
   * @param {string} [role] 
   * @param {string} [technician_id] 
   */
  async register(dataOrName, email, password, department, role, technician_id) {
    let payload;
    if (typeof dataOrName === 'object') {
      payload = dataOrName;
    } else {
      payload = {
        name: dataOrName,
        email,
        password,
        department: department || "Mechanical & Rotating Equipment",
        role: role || "Field Technician",
        technician_id: technician_id || ""
      };
    }

    const data = await fetchApi('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data && data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Log out the current user and purge storage.
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Fetch authenticated user info from backend.
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const user = await fetchApi('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      // If token expired or invalid, clear cache
      this.logout();
      return null;
    }
  },

  /**
   * Get cached user from localStorage.
   */
  getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Get active JWT token.
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if user token is stored.
   */
  isAuthenticated() {
    return !!this.getToken();
  }
};
