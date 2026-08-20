/**
 * Centralized API Client for FieldAI Assistant
 * Uses VITE_API_BASE_URL with graceful fallback handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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
      const errorBody = await response.text();
      throw new Error(`API Error [${response.status}]: ${errorBody || response.statusText}`);
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
