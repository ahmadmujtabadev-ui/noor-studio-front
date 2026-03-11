import { api } from './client';
import type { AuthResponse, User } from './types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', data, { auth: false }),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data, { auth: false }),

  me: () => api.get<{ user: User }>('/api/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/api/auth/change-password', data),
};
