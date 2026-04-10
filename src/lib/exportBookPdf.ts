/**
 * exportBookPdf.ts
 *
 * Renders each BookPage via Fabric.js canvas (same engine as the editor)
 * at 2× resolution, then assembles a jsPDF document.
 *
 * Priority per page:
 *   1. fabricJson → off-screen Fabric canvas at 2× scale (best quality)
 *   2. thumbnail  → saved JPEG data URL from editor (fast fallback)
 *   3. imageUrl   → original uploaded image
 *   4. blank page with text overlay
 */

import jsPDF from "jspdf";
import { fabric } from "fabric";
import type { BookPage } from "@/hooks/useBookEditor";

// Canvas logical size (matches FabricPageCanvas PAGE_W / PAGE_H)
const PAGE_W = 750;
const PAGE_H = 1000;

// Render at 2× for crisp PDF output
const PDF_SCALE = 2;
const RENDER_W  = PAGE_W * PDF_SCALE; // 1500
const RENDER_H  = PAGE_H * PDF_SCALE; // 2000

// PDF page dimensions (6" × 8" to match 3:4 aspect ratio)
const PAGE_W_MM = 152.4;
const PAGE_H_MM = 203.2;

// ─── Render one page to a JPEG data URL ──────────────────────────────────────

async function renderPageToDataUrl(page: BookPage): Promise<string> {
  // ── Option 1: fabricJson (best quality) ──────────────────────────────────
  if (page.fabricJson && Object.keys(page.fabricJson).length > 0) {
    return new Promise<string>((resolve) => {
      const canvasEl = document.createElement("canvas");
      canvasEl.width  = RENDER_W;
      canvasEl.height = RENDER_H;
      canvasEl.style.cssText = "position:fixed;top:-9999px;left:-9999px;";
      document.body.appendChild(canvasEl);

      const fc = new fabric.Canvas(canvasEl, {
        width:               RENDER_W,
        height:              RENDER_H,
        enableRetinaScaling: false,
        renderOnAddRemove:   false,
        selection:           false,
      });

      const cleanup = () => {
        try { fc.dispose(); } catch { /* ignore */ }
        try { document.body.removeChild(canvasEl); } catch { /* ignore */ }
      };

      const json =
        typeof page.fabricJson === "string"
          ? JSON.parse(page.fabricJson as unknown as string)
          : page.fabricJson;

      fc.loadFromJSON(json, () => {
        // Scale all objects from logical (750×1000) to render (1500×2000)
        fc.getObjects().forEach((obj) => {
          obj.scaleX  = (obj.scaleX  ?? 1) * PDF_SCALE;
          obj.scaleY  = (obj.scaleY  ?? 1) * PDF_SCALE;
          obj.left    = (obj.left    ?? 0) * PDF_SCALE;
          obj.top     = (obj.top     ?? 0) * PDF_SCALE;
          if ("fontSize" in obj && typeof (obj as fabric.IText).fontSize === "number") {
            (obj as fabric.IText).set("fontSize", (obj as fabric.IText).fontSize! * PDF_SCALE);
          }
          obj.setCoords();
        });

        // Scale background image if present
        if (fc.backgroundImage && fc.backgroundImage instanceof fabric.Image) {
          const bg = fc.backgroundImage as fabric.Image;
          bg.scaleX  = (bg.scaleX  ?? 1) * PDF_SCALE;
          bg.scaleY  = (bg.scaleY  ?? 1) * PDF_SCALE;
          bg.left    = (bg.left    ?? 0) * PDF_SCALE;
          bg.top     = (bg.top     ?? 0) * PDF_SCALE;
        }

        fc.renderAll();

        const dataUrl = fc.toDataURL({ format: "jpeg", quality: 0.95 });
        cleanup();
        resolve(dataUrl);
      });
    });
  }

  // ── Option 2: saved thumbnail ─────────────────────────────────────────────
  if (page.thumbnail) return page.thumbnail;

  // ── Option 3: original image ──────────────────────────────────────────────
  if (page.imageUrl)  return page.imageUrl;

  return "";
}

// ─── Main export function ─────────────────────────────────────────────────────

export interface ExportOptions {
  onProgress?: (current: number, total: number) => void;
}

export async function exportBookPdf(
  pages:    BookPage[],
  title:    string,
  options?: ExportOptions,
): Promise<void> {
  const { onProgress } = options ?? {};

  const pdf = new jsPDF({
    orientation: "portrait",
    unit:        "mm",
    format:      [PAGE_W_MM, PAGE_H_MM],
    compress:    true,
  });

  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    onProgress?.(i + 1, total);

    if (i > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], "portrait");

    try {
      const dataUrl = await renderPageToDataUrl(page);
      if (dataUrl) {
        pdf.addImage(dataUrl, "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
      } else {
        // Blank page with text fallback
        pdf.setFillColor(255, 253, 245);
        pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");
        if (page.text) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          pdf.setTextColor(30, 30, 30);
          const lines = pdf.splitTextToSize(page.text, PAGE_W_MM - 30);
          lines.slice(0, 25).forEach((line: string, j: number) => {
            pdf.text(line, PAGE_W_MM / 2, 40 + j * 7, { align: "center" });
          });
        }
      }
    } catch (err) {
      console.error(`[exportBookPdf] page ${i + 1} failed`, err);
      pdf.setFillColor(255, 253, 245);
      pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");
    }
  }

  const safeName = title.replace(/[^a-z0-9_\-\s]/gi, "").trim() || "book";
  pdf.save(`${safeName}.pdf`);
}
