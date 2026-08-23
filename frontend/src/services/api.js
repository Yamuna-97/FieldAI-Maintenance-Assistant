/**
 * Centralized API Client for FieldAI Assistant
 * Uses VITE_API_BASE_URL with graceful fallback handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = localStorage.getItem('fieldai_auth_token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      let message = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          message = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        if (errorText) message = errorText;
      }
      throw new Error(message || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[API Client Warning] Request to ${url} failed:`, err.message);
    throw err;
  }
}

export async function checkBackendHealth() {
  try {
    return await fetchApi('/health');
  } catch (e) {
    return { status: 'offline', error: e.message };
  }
}

export async function getSystemStatus() {
  try {
    return await fetchApi('/api/v1/system/status');
  } catch (e) {
    return null; // Signals component to use mock system status
  }
}
