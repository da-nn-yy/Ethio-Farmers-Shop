export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthToken() {
  return localStorage.getItem('firebase_id_token') || null;
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function http(method, path, { params, body, headers } = {}) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

// Listings
export const ListingsApi = {
  browse: (params) => http('GET', '/listings', { params }),
  create: (payload) => http('POST', '/listings', { body: payload }),
  update: (id, payload) => http('PUT', `/listings/${id}`, { body: payload }),
  remove: (id) => http('DELETE', `/listings/${id}`),
};

// Orders
export const OrdersApi = {
  mine: () => http('GET', '/orders'),
  create: (payload) => http('POST', '/orders', { body: payload }),
  updateStatus: (id, status) => http('PUT', `/orders/${id}/status`, { body: { status } }),
};

// Favorites
export const FavoritesApi = {
  list: () => http('GET', '/favorites'),
  listFarmers: () => http('GET', '/favorites/farmers'),
  add: (listingId) => http('POST', '/favorites', { body: { listingId } }),
  remove: (listingId) => http('DELETE', `/favorites/${listingId}`),
};