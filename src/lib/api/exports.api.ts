import { api } from "./client";

export const exportsApi = {
  list: async (projectId: string): Promise<Export[]> => {
    const res = await api.get<any>(`/api/exports/${projectId}`);
    return res.exports ?? [];
  },

  // Calls the Puppeteer-based PDF export endpoint.
  // Platform controls page dimensions: 'kdp' | 'apple' | 'ingram'
  downloadPdf: async (projectId: string, platform = "kdp", template = "classic") => {
    const blob = await api.get<Blob>(`/api/projects/${projectId}/export/pdf`, {
      params: { platform, template },
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-${platform}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};