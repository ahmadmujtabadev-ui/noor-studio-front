import { NoorApiError } from './types';

const BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:8000';

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'noor_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Normalize _id → id ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalize<T>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalize) as unknown as T;
  const result: Record<string, unknown> = { ...obj };
  if (result._id && !result.id) result.id = result._id;
  // Recursively normalize nested objects
  for (const key of Object.keys(result)) {
    if (result[key] && typeof result[key] === 'object') {
      result[key] = normalize(result[key]);
    }
  }
  return result as T;
}

// ─── Core Request ─────────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, params, ...init } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers });

  // Handle binary (PDF) responses
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
    if (!res.ok) throw new NoorApiError('Download failed', 'DOWNLOAD_ERROR', res.status);
    return res.blob() as unknown as T;
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new NoorApiError(`Server error (${res.status})`, 'PARSE_ERROR', res.status);
  }

  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = data as any;
    const errBody = err?.error || {};
    throw new NoorApiError(
      errBody.message || err?.message || `Request failed (${res.status})`,
      errBody.code || 'API_ERROR',
      res.status,
      data
    );
  }

  // Auto-normalize _id → id recursively
  return normalize<T>(data);
}

// ─── HTTP Methods ─────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),

  download: async (path: string): Promise<string> => {
    const token = tokenStorage.get();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new NoorApiError('Download failed', 'DOWNLOAD_ERROR', res.status);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};
