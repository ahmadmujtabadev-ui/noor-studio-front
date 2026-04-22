import { api, tokenStorage } from "./client";

export const exportsApi = {
  // Fix list: should be GET not POST
  list: async (projectId: string): Promise<Export[]> => {
    const res = await api.get<any>(`/api/exports/${projectId}`);
    return res.exports ?? [];
  },

  downloadPdf: async (projectId: string) => {
    // Use api.post with responseType blob — same auth as list()
    const blob = await api.post<Blob>("/api/exports",
      { projectId },
      { responseType: "blob" }  // tells your client: don't parse JSON, return raw bytes
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_${projectId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};