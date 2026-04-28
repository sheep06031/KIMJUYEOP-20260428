import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkHealth() {
  const response = await api.get('/api/health');
  return response.data;
}

export async function fetchProducts(page = 1, limit = 12) {
  const response = await api.get('/api/products', {
    params: { page, limit },
  });
  return response.data;
}

export async function fetchProductById(productId) {
  const response = await api.get(`/api/products/${productId}`);
  return response.data.product;
}

export async function fetchProductInsights(page = 1, limit = 12) {
  const response = await api.get('/api/product-insights', {
    params: { page, limit },
  });
  return response.data;
}

export async function sendChatMessage({ messages, familySize, hasChildren, storageSpace, monthlyUsage }) {
  const response = await api.post('/api/chat', {
    messages,
    familySize,
    hasChildren,
    storageSpace,
    monthlyUsage,
  });

  return response.data;
}

export default api;
