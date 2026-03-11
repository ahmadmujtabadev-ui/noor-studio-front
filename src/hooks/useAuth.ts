import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCredits, useIsAuthenticated, useUser } from '@/lib/store/authStore';

export { useUser, useCredits, useIsAuthenticated };
export { useAuthStore };

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => navigate('/app/dashboard'),
  });
}

export function useRegisterMutation() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      register(name, email, password),
    onSuccess: () => navigate('/app/dashboard'),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const qc = useQueryClient();

  return () => {
    logout();
    qc.clear();
    navigate('/auth');
  };
}
