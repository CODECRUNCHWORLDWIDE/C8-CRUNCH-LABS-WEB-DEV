// api.js — a Bearer-token-aware fetch wrapper.
//
// Every call to the resource server should go through apiFetch so that the
// Authorization header is added consistently. If the user is not authenticated
// or the access token has expired and silent renew has not yet completed,
// apiFetch throws — the caller decides how to react (typically: log the error,
// redirect to sign-in, or show a "your session expired" message).

import { userManager } from './auth';

const RESOURCE_BASE = 'http://localhost:3001';

/**
 * Authenticated fetch. Throws if not signed in.
 * @param {string} path - relative to RESOURCE_BASE, e.g. '/api/me'
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const user = await userManager.getUser();
  if (!user || user.expired) {
    throw new Error('Not authenticated (no valid access token in user store)');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${user.access_token}`);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  return fetch(`${RESOURCE_BASE}${path}`, { ...options, headers });
}

/**
 * Convenience: GET /api/me and return parsed JSON.
 */
export async function fetchMe() {
  const res = await apiFetch('/api/me');
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`/api/me returned ${res.status}: ${body}`);
  }
  return res.json();
}
