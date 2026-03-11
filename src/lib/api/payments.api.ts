import { api } from './client';
import type { CreditPackage, CreditTransaction, CreditBalance } from './types';

export const paymentsApi = {
  getPackages: () => api.get<CreditPackage[]>('/api/payments/packages'),

  getBalance: () => api.get<CreditBalance>('/api/payments/balance'),

  getTransactions: (params?: { limit?: number; offset?: number }) =>
    api.get<CreditTransaction[]>('/api/payments/transactions', { params }),

  createCheckout: (data: { packageId: string; successUrl?: string; cancelUrl?: string }) =>
    api.post<{ url: string; sessionId: string }>('/api/payments/checkout', {
      ...data,
      successUrl: data.successUrl || `${window.location.origin}/app/billing/success`,
      cancelUrl: data.cancelUrl || `${window.location.origin}/app/billing/cancel`,
    }),

  cancelSubscription: () =>
    api.post<{ message: string }>('/api/payments/cancel-subscription', {}),
};
