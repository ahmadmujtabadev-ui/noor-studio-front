/**
 * exportBookPdf.ts
 *
 * ── v2 (backend Puppeteer) ──────────────────────────────────────────────────
 * PDF export is now handled server-side via Puppeteer.
 * The backend route GET /api/projects/:projectId/export/pdf:
 *   1. Reads the project's saved fabricJson pages from MongoDB
 *   2. Converts each page to HTML (preserving all Fabric styles pixel-for-pixel)
 *   3. Screenshots each page with Puppeteer (fonts + images fully loaded)
 *   4. Assembles screenshots into a 6"×8" PDF with pdf-lib
 *   5. Streams the PDF back as a download
 *
 * The old client-side Fabric.js + jsPDF implementation is preserved below
 * (commented out) for reference.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { BookPage } from "@/hooks/useBookEditor";

// PDF page dimensions (unchanged — 6" × 8")
const PAGE_W_MM = 152.4;
const PAGE_H_MM = 203.2;
void PAGE_W_MM; void PAGE_H_MM; // suppress unused-var warnings

// ─── v2: Backend fetch ────────────────────────────────────────────────────────

export interface ExportOptions {
  /** Required for backend export — the project's MongoDB _id */
  projectId?: string;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Exports all pages of a project as a PDF by calling the backend
 * Puppeteer export route.  The pages array is ignored (the server reads
 * directly from MongoDB), but the signature is kept compatible so
 * existing callers don't need changing.
 */
export async function exportBookPdf(
  _pages:   BookPage[],
  title:    string,
  options?: ExportOptions,
): Promise<void> {
  const { projectId, onProgress } = options ?? {};

  if (!projectId) {
    throw new Error("exportBookPdf: projectId is required for backend PDF export.");
  }

  onProgress?.(0, 1);

  const response = await fetch(`/api/projects/${projectId}/export/pdf`, {
    method: "GET",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "Unknown error");
    throw new Error(body || `PDF export failed (HTTP ${response.status})`);
  }

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${title.replace(/[^a-z0-9_\-\s]/gi, "").trim() || "book"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);

  onProgress?.(1, 1);
}

// ─── v1: Client-side Fabric.js + jsPDF (COMMENTED OUT) ───────────────────────
//
// import jsPDF from "jspdf";
// import { fabric } from "fabric";
//
// const PAGE_W = 750;
// const PAGE_H = 1000;
// const PDF_SCALE = 2;
// const RENDER_W  = PAGE_W * PDF_SCALE; // 1500
// const RENDER_H  = PAGE_H * PDF_SCALE; // 2000
//
// async function renderPageToDataUrl(page: BookPage): Promise<string> {
//   if (page.fabricJson && Object.keys(page.fabricJson).length > 0) {
//     return new Promise<string>((resolve) => {
//       const canvasEl = document.createElement("canvas");
//       canvasEl.width  = RENDER_W;
//       canvasEl.height = RENDER_H;
//       canvasEl.style.cssText = "position:fixed;top:-9999px;left:-9999px;";
//       document.body.appendChild(canvasEl);
//
//       const fc = new fabric.Canvas(canvasEl, {
//         width:               RENDER_W,
//         height:              RENDER_H,
//         enableRetinaScaling: false,
//         renderOnAddRemove:   false,
//         selection:           false,
//       });
//
//       const cleanup = () => {
//         try { fc.dispose(); } catch { /* ignore */ }
//         try { document.body.removeChild(canvasEl); } catch { /* ignore */ }
//       };
//
//       const json =
//         typeof page.fabricJson === "string"
//           ? JSON.parse(page.fabricJson as unknown as string)
//           : page.fabricJson;
//
//       fc.loadFromJSON(json, () => {
//         fc.getObjects().forEach((obj) => {
//           obj.scaleX  = (obj.scaleX  ?? 1) * PDF_SCALE;
//           obj.scaleY  = (obj.scaleY  ?? 1) * PDF_SCALE;
//           obj.left    = (obj.left    ?? 0) * PDF_SCALE;
//           obj.top     = (obj.top     ?? 0) * PDF_SCALE;
//           if ("fontSize" in obj && typeof (obj as fabric.IText).fontSize === "number") {
//             (obj as fabric.IText).set("fontSize", (obj as fabric.IText).fontSize! * PDF_SCALE);
//           }
//           obj.setCoords();
//         });
//         if (fc.backgroundImage && fc.backgroundImage instanceof fabric.Image) {
//           const bg = fc.backgroundImage as fabric.Image;
//           bg.scaleX  = (bg.scaleX  ?? 1) * PDF_SCALE;
//           bg.scaleY  = (bg.scaleY  ?? 1) * PDF_SCALE;
//           bg.left    = (bg.left    ?? 0) * PDF_SCALE;
//           bg.top     = (bg.top     ?? 0) * PDF_SCALE;
//         }
//         fc.renderAll();
//         const dataUrl = fc.toDataURL({ format: "jpeg", quality: 0.95 });
//         cleanup();
//         resolve(dataUrl);
//       });
//     });
//   }
//   if (page.thumbnail) return page.thumbnail;
//   if (page.imageUrl)  return page.imageUrl;
//   return "";
// }
//
// export async function exportBookPdf(
//   pages:    BookPage[],
//   title:    string,
//   options?: ExportOptions,
// ): Promise<void> {
//   const { onProgress } = options ?? {};
//   const pdf = new jsPDF({
//     orientation: "portrait",
//     unit:        "mm",
//     format:      [PAGE_W_MM, PAGE_H_MM],
//     compress:    true,
//   });
//   const total = pages.length;
//   for (let i = 0; i < total; i++) {
//     const page = pages[i];
//     onProgress?.(i + 1, total);
//     if (i > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], "portrait");
//     try {
//       const dataUrl = await renderPageToDataUrl(page);
//       if (dataUrl) {
//         pdf.addImage(dataUrl, "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
//       } else {
//         pdf.setFillColor(255, 253, 245);
//         pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");
//         if (page.text) {
//           pdf.setFont("helvetica", "normal");
//           pdf.setFontSize(11);
//           pdf.setTextColor(30, 30, 30);
//           const lines = pdf.splitTextToSize(page.text, PAGE_W_MM - 30);
//           lines.slice(0, 25).forEach((line: string, j: number) => {
//             pdf.text(line, PAGE_W_MM / 2, 40 + j * 7, { align: "center" });
//           });
//         }
//       }
//     } catch (err) {
//       console.error(`[exportBookPdf] page ${i + 1} failed`, err);
//       pdf.setFillColor(255, 253, 245);
//       pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");
//     }
//   }
//   const safeName = title.replace(/[^a-z0-9_\-\s]/gi, "").trim() || "book";
//   pdf.save(`${safeName}.pdf`);
// }
