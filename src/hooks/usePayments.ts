import { useQuery, useMutation } from '@tanstack/react-query';
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

export function useCreateCheckout() {
  return useMutation({
    mutationFn: paymentsApi.createCheckout,
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
    onSuccess: (objectUrl) => {
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `noorstudio-book.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      refreshUser();
    },
  });
}
