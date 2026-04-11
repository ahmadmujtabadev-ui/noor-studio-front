import { api } from './client';
import type { CreditPackage, CreditTransaction, CreditBalance, SubscriptionInfo, PlanLimitsResponse } from './types';

export const paymentsApi = {
  getPackages: () =>
    api.get<{ packages: CreditPackage[] }>('/api/payments/packages').then((r) => r.packages),

  getBalance: () => api.get<CreditBalance>('/api/payments/balance'),

  getPlanLimits: () => api.get<PlanLimitsResponse>('/api/payments/plan-limits'),

  getTransactions: (params?: { limit?: number; offset?: number }) =>
    api
      .get<{ transactions: CreditTransaction[] }>('/api/payments/transactions', { params })
      .then((r) => r.transactions),

  // One-time credit purchase
  createCheckout: (data: { packageId: string; successUrl?: string; cancelUrl?: string }) =>
    api.post<{ url: string; sessionId: string }>('/api/payments/create-checkout', {
      ...data,
      successUrl: data.successUrl || `${window.location.origin}/app/billing/success`,
      cancelUrl: data.cancelUrl || `${window.location.origin}/app/billing/cancel`,
    }),

  // Subscription plan (creator / author / studio)
  createSubscription: (data: { planId: string; successUrl?: string; cancelUrl?: string }) =>
    api.post<{ url: string; sessionId: string }>('/api/payments/create-subscription', {
      ...data,
      successUrl: data.successUrl || `${window.location.origin}/app/billing/success`,
      cancelUrl: data.cancelUrl || `${window.location.origin}/app/billing/cancel`,
    }),

  getSubscription: () =>
    api.get<SubscriptionInfo>('/api/payments/subscription'),

  cancelSubscription: () =>
    api.post<{ message: string }>('/api/payments/cancel-subscription', {}),

  createPortalSession: () =>
    api.post<{ url: string }>('/api/payments/portal-session', {}),
};
