import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments.api';
import { useUser } from './useAuth';
import { PLAN_LIMITS, isWithinLimit } from '@/constants/planFeatures';
import type { PlanId } from '@/constants/planFeatures';

export function usePlanLimits() {
  const user = useUser();

  const query = useQuery({
    queryKey: ['payments', 'plan-limits'],
    queryFn: paymentsApi.getPlanLimits,
    staleTime: 60 * 1000,
    retry: false,
    enabled: !!user,
  });

  const plan = (user?.plan ?? 'free') as PlanId;
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const usage = query.data?.usage ?? { characters: 0, knowledgeBases: 0, booksThisMonth: 0 };

  const isSubscriptionActive =
    user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing';

  const canCreateCharacter = isWithinLimit(limits.characters, usage.characters);
  const canCreateKnowledgeBase = isWithinLimit(limits.knowledgeBases, usage.knowledgeBases);
  const canCreateBook = isWithinLimit(limits.booksPerMonth, usage.booksThisMonth);

  return {
    plan,
    limits,
    usage,
    isLoading: query.isLoading,
    isSubscriptionActive,
    canCreateCharacter,
    canCreateKnowledgeBase,
    canCreateBook,
    refresh: query.refetch,
  };
}
