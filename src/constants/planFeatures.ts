// ─── Plan Feature Definitions ─────────────────────────────────────────────────
// Single source of truth for plan limits on the frontend.
// Must stay in sync with backend PLAN_LIMITS in server/routes/payments.js
// -1 = unlimited

export type PlanId = 'free' | 'creator' | 'author' | 'studio';

export interface PlanLimits {
  credits: number;
  booksPerMonth: number;
  characters: number;
  knowledgeBases: number;
  kdpExport: boolean;
  commercial: boolean;
  teamCollab: boolean;
  bulkExport: boolean;
  apiAccess: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    credits: 50,
    booksPerMonth: 1,
    characters: 3,
    knowledgeBases: 1,
    kdpExport: false,
    commercial: false,
    teamCollab: false,
    bulkExport: false,
    apiAccess: false,
  },
  creator: {
    credits: 100,
    booksPerMonth: 5,
    characters: 10,
    knowledgeBases: 2,
    kdpExport: false,
    commercial: false,
    teamCollab: false,
    bulkExport: false,
    apiAccess: false,
  },
  author: {
    credits: 300,
    booksPerMonth: -1,
    characters: -1,
    knowledgeBases: -1,
    kdpExport: true,
    commercial: true,
    teamCollab: false,
    bulkExport: false,
    apiAccess: false,
  },
  studio: {
    credits: 1000,
    booksPerMonth: -1,
    characters: -1,
    knowledgeBases: -1,
    kdpExport: true,
    commercial: true,
    teamCollab: true,
    bulkExport: true,
    apiAccess: true,
  },
};

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  monthlyCredits: number;
  popular?: boolean;
  features: Array<{ label: string; included: boolean }>;
}

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: 'creator',
    name: 'Creator',
    price: '$29',
    period: '/mo',
    description: 'For families getting started',
    monthlyCredits: 100,
    features: [
      { label: '5 books per month', included: true },
      { label: '10 character designs', included: true },
      { label: '5 knowledge bases', included: true },
      { label: 'Standard export (PDF)', included: true },
      { label: '100 AI credits/month', included: true },
      { label: 'Email support', included: true },
      { label: 'KDP-ready export', included: false },
      { label: 'Commercial license', included: false },
    ],
  },
  {
    id: 'author',
    name: 'Author',
    price: '$79',
    period: '/mo',
    description: 'For serious creators',
    monthlyCredits: 300,
    popular: true,
    features: [
      { label: 'Unlimited books', included: true },
      { label: 'Unlimited characters', included: true },
      { label: 'Unlimited knowledge bases', included: true },
      { label: 'KDP-ready export', included: true },
      { label: '300 AI credits/month', included: true },
      { label: 'Priority support', included: true },
      { label: 'Commercial license', included: true },
      { label: 'Team collaboration', included: false },
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$199',
    period: '/mo',
    description: 'For publishers & schools',
    monthlyCredits: 1000,
    features: [
      { label: 'Everything in Author', included: true },
      { label: 'Team collaboration', included: true },
      { label: 'Bulk export tools', included: true },
      { label: 'API access', included: true },
      { label: '1000 AI credits/month', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Commercial license', included: true },
      { label: 'KDP-ready export', included: true },
    ],
  },
];

export const PLAN_ORDER: PlanId[] = ['free', 'creator', 'author', 'studio'];

export function planRank(plan: string): number {
  return PLAN_ORDER.indexOf(plan as PlanId);
}

/** Returns human-readable limit string, e.g. "10" or "Unlimited" */
export function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : String(value);
}

/** Returns true if the user is within their plan limit for a resource */
export function isWithinLimit(limit: number, usage: number): boolean {
  if (limit === -1) return true;
  return usage < limit;
}
