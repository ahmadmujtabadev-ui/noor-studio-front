import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments.api';
import { exportsApi } from '@/lib/api/exports.api';
import { useAuthStore } from '@/lib/store/authStore';

// ─── Payments ────────────────────────────────────────────────────────────────

export function useCreditPackages() {
  return useQuery({
    queryKey: ['payments', 'packages'],
    queryFn: paymentsApi.getPackages,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreditBalance() {
  return useQuery({
    queryKey: ['payments', 'balance'],
    queryFn: paymentsApi.getBalance,
    staleTime: 60 * 1000,
  });
}

export function useTransactions(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['payments', 'transactions', params],
    queryFn: () => paymentsApi.getTransactions(params),
    staleTime: 60 * 1000,
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['payments', 'subscription'],
    queryFn: paymentsApi.getSubscription,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: paymentsApi.createCheckout,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}

export function useCreateSubscription() {
  return useMutation({
    mutationFn: paymentsApi.createSubscription,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'subscription'] });
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: paymentsApi.createPortalSession,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export function useExports(projectId: string | undefined) {
  return useQuery({
    queryKey: ['exports', projectId],
    queryFn: () => exportsApi.list(projectId!),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export function useDownloadPdf(projectId: string) {
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return useMutation({
    mutationFn: () => exportsApi.downloadPdf(projectId),
    onSuccess: () => {
      refreshUser();
    },
  });
}
