// src/api/realApi.ts — НАСТОЯЩИЙ API ДЛЯ РАБОТЫ С БЭКЕНДОМ
import { Role, User, Service, RepairRequest, RequestStatus } from '../types';

const API_URL = 'http://localhost:5240/api'; // ← твой настоящий сервер

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, error || response.statusText);
  }
  return response.json();
};

// Сохраняем токен в localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // --- Auth ---
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    localStorage.setItem('token', data.token);
    return { user: data.user, token: data.token };
  },

  // --- Requests ---
  getRequests: async (): Promise<RepairRequest[]> => {
    const res = await fetch(`${API_URL}/requests`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  createRequest: async (request: Omit<RepairRequest, 'id' | 'createdAt' | 'comments' | 'status'>): Promise<RepairRequest> => {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(request),
    });
    return handleResponse(res);
  },

  // --- Services ---
  getServices: async (): Promise<Service[]> => {
    const res = await fetch(`${API_URL}/services`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // --- Users ---
  getTechnicians: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users/technicians`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};