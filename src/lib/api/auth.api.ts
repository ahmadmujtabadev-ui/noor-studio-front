import { api } from './client';
import type { AuthResponse, LoginResult, User } from './types';

export const authApi = {
  // Legacy – kept for any existing callers
  login: (data: { email: string; password: string }) =>
    api.post<LoginResult>('/api/auth/login', data, { auth: false }),

  me: () => api.get<{ user: User }>('/api/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/api/auth/change-password', data),

  // ── Signup (OTP flow) ────────────────────────────────────────────────────
  sendSignupOtp: (data: { name: string; email: string; password: string; birthYear: number }) =>
    api.post<{ message: string }>('/api/auth/send-signup-otp', data, { auth: false }),

  verifySignupOtp: (data: { email: string; otp: string }) =>
    api.post<AuthResponse>('/api/auth/verify-signup-otp', data, { auth: false }),

  // ── Resend OTP ───────────────────────────────────────────────────────────
  resendOtp: (data: { email?: string; purpose: 'signup' | 'forgot-password' | '2fa'; preAuthToken?: string }) =>
    api.post<{ message: string }>('/api/auth/resend-otp', data, { auth: false }),

  // ── Forgot password (OTP flow) ───────────────────────────────────────────
  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/api/auth/forgot-password', data, { auth: false }),

  verifyResetOtp: (data: { email: string; otp: string }) =>
    api.post<{ resetToken: string }>('/api/auth/verify-reset-otp', data, { auth: false }),

  resetPassword: (data: { resetToken: string; password: string }) =>
    api.post<{ message: string }>('/api/auth/reset-password', data, { auth: false }),

  // ── 2FA ──────────────────────────────────────────────────────────────────
  verify2fa: (data: { preAuthToken: string; otp: string }) =>
    api.post<AuthResponse>('/api/auth/verify-2fa', data, { auth: false }),

  toggle2fa: (data: { enabled: boolean }) =>
    api.patch<{ message: string; twoFactorEnabled: boolean }>('/api/user/2fa', data),
};
