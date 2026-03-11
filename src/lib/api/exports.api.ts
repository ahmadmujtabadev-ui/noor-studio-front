import { api, tokenStorage } from './client';
import type { Export } from './types';

const BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:3001';

export const exportsApi = {
  list: (projectId: string) =>
    api.get<Export[]>('/api/exports', { params: { projectId } }),

  downloadPdf: async (projectId: string): Promise<string> => {
    const token = tokenStorage.get();
    const res = await fetch(`${BASE_URL}/api/exports/${projectId}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};
