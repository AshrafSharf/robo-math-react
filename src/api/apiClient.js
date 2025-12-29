/**
 * Base API Client
 *
 * Provides authenticated fetch wrapper for API calls.
 * Uses VITE_SERVER_PATH for base URL and VITE_API_TOKEN for auth.
 */

// Use VITE_USE_PROXY=true for dev proxy, otherwise use VITE_SERVER_PATH
const USE_PROXY = import.meta.env.VITE_USE_PROXY === 'true';
const API_BASE_URL = USE_PROXY ? '' : (import.meta.env.VITE_SERVER_PATH || '');
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/storage/lessons/123/assets')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

/**
 * GET request helper
 */
export function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export function post(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export function put(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * PATCH request helper
 */
export function patch(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export function del(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

export default {
  request: apiRequest,
  get,
  post,
  put,
  patch,
  del,
};
