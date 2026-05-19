import { api } from './client';

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  bannedUsers: number;
  totalProjects: number;
  signupsToday: number;
  aiCostToday: string;
  aiUsage: {
    totalRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    successRate: number;
  };
}

export interface AdminUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: string;
  credits: number;
  isBanned: boolean;
  bannedReason?: string;
  bannedAt?: string;
  isEmailVerified: boolean;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBook {
  _id: string;
  id: string;
  title?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReport {
  _id: string;
  id: string;
  userId: { _id: string; name: string; email: string };
  projectId?: { _id: string; title?: string };
  type: 'inappropriate' | 'copyright' | 'other';
  description?: string;
  outputRef?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  adminNote?: string;
  createdAt: string;
}

export interface AdminFeedback {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  type: 'nps' | 'cancellation' | 'general';
  score?: number;
  comment?: string;
  page?: string;
  createdAt: string;
}

export interface AIUsageRecord {
  _id: string;
  id: string;
  userId?: { _id: string; name: string; email: string };
  provider: string;
  model?: string;
  stage?: string;
  success: boolean;
  tokensIn?: number;
  tokensOut?: number;
  durationMs?: number;
  createdAt: string;
}

export const adminApi = {
  getStats: () =>
    api.get<AdminStats>('/api/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get<{ users: AdminUser[]; total: number; page: number; totalPages: number }>(
      '/api/admin/users',
      { params }
    ),

  banUser: (id: string, reason?: string) =>
    api.patch<{ message: string; user: AdminUser }>(`/api/admin/users/${id}/ban`, { reason }),

  unbanUser: (id: string) =>
    api.patch<{ message: string; user: AdminUser }>(`/api/admin/users/${id}/unban`),

  getUserBooks: (id: string) =>
    api.get<{ user: { name: string; email: string }; books: AdminBook[]; total: number }>(
      `/api/admin/users/${id}/books`
    ),

  adjustCredits: (id: string, amount: number, description: string) =>
    api.post<{ user: AdminUser }>(`/api/admin/users/${id}/credits`, { amount, description }),

  updateUser: (id: string, data: { role?: string; plan?: string }) =>
    api.patch<{ user: AdminUser }>(`/api/admin/users/${id}`, data),

  refundUser: (id: string, data: { chargeId: string; amount?: number; reason?: string }) =>
    api.post<{ message: string }>(`/api/admin/users/${id}/refund`, data),

  getReports: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ reports: AdminReport[]; total: number; page: number; totalPages: number }>(
      '/api/reports',
      { params }
    ),

  updateReport: (id: string, data: { status?: string; adminNote?: string }) =>
    api.patch<{ report: AdminReport }>(`/api/reports/${id}`, data),

  getAiUsage: (days?: number) =>
    api.get<{ usage: AIUsageRecord[] }>('/api/admin/ai-usage', { params: { days } }),

  getMargin: () =>
    api.get<{
      estimatedMrr: number;
      aiCost30d: number;
      grossProfit30d: number;
      grossMarginPct: string | null;
      planBreakdown: Array<{ _id: string; count: number }>;
      dailyCostSeries: Array<{ date: string; calls: number; aiCost: number }>;
    }>('/api/admin/margin'),

  getFeedback: (params?: { type?: string; page?: number; limit?: number }) =>
    api.get<{ feedback: AdminFeedback[]; total: number; page: number; totalPages: number; npsAverage: string | null; npsCount: number }>(
      '/api/admin/feedback',
      { params }
    ),
};
