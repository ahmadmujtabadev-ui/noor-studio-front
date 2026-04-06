/**
 * exportBookPdf.ts
 * Exports all book pages to a print-ready PDF using jsPDF.
 * Each page is sized to 6" × 9" at 150 dpi (portrait).
 * Images are embedded via their imageUrl (data-URLs or HTTPS URLs).
 * Pages without an image get a styled placeholder.
 */

import jsPDF from "jspdf";
import type { BookPage } from "@/hooks/useBookEditor";

// Book trim size in mm (6" × 9" = 152.4mm × 228.6mm)
const PAGE_W_MM = 152.4;
const PAGE_H_MM = 228.6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Attempt to load an image URL as a base64 data-URL via a canvas round-trip.
 * Falls back to the original URL if cross-origin or canvas fails.
 */
async function toDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  // Already a data URL
  if (url.startsWith("data:")) return url;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload  = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width  = img.naturalWidth  || 800;
    canvas.height = img.naturalHeight || 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return url;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    // Cross-origin — return as-is; jsPDF will try to load it directly
    return url;
  }
}

/**
 * Draw a placeholder rectangle when no image is available.
 * Fills the page with a dark gradient approximated as a solid fill.
 */
function drawPlaceholder(
  pdf: jsPDF,
  page: BookPage,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const isCover = page.type === "front-cover" || page.type === "back-cover";

  // Background
  pdf.setFillColor(isCover ? "#0d1117" : "#FAFAF8");
  pdf.rect(x, y, w, h, "F");

  // Title text
  if (page.title) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(isCover ? 18 : 14);
    pdf.setTextColor(isCover ? 255 : 26, isCover ? 255 : 26, isCover ? 255 : 26);
    const lines = pdf.splitTextToSize(page.title, w - 20);
    const textY = y + h / 2 - (lines.length * 6) / 2;
    lines.forEach((line: string, i: number) => {
      pdf.text(line, x + w / 2, textY + i * 8, { align: "center" });
    });
  }

  // Body text
  if (page.text) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(isCover ? 9 : 8);
    pdf.setTextColor(isCover ? 180 : 60, isCover ? 180 : 60, isCover ? 180 : 60);
    const bodyLines = pdf.splitTextToSize(page.text, w - 24);
    const startY = page.title ? y + h / 2 + 10 : y + 16;
    bodyLines.slice(0, 20).forEach((line: string, i: number) => {
      pdf.text(line, x + w / 2, startY + i * 5, { align: "center" });
    });
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ExportOptions {
  onProgress?: (current: number, total: number) => void;
}

export async function exportBookPdf(
  pages:    BookPage[],
  title:    string,
  options?: ExportOptions,
): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit:        "mm",
    format:      [PAGE_W_MM, PAGE_H_MM],
  });

  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    options?.onProgress?.(i + 1, total);

    if (i > 0) {
      pdf.addPage([PAGE_W_MM, PAGE_H_MM], "portrait");
    }

    // Prefer the fabricJson thumbnail (full edited layout) over the raw imageUrl
    const rawUrl = (page as any).thumbnail || page.imageUrl || "";
    const dataUrl = rawUrl ? await toDataUrl(rawUrl) : null;

    if (dataUrl) {
      try {
        // Detect format
        const fmt = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        pdf.addImage(dataUrl, fmt, 0, 0, PAGE_W_MM, PAGE_H_MM);

        // For text pages, overlay the text so it's selectable in the PDF
        if (page.type === "text-page" && page.text) {
          // Thin semi-transparent white overlay for legibility (skip — image already has text)
        }
      } catch {
        // Image embed failed — fall back to placeholder
        drawPlaceholder(pdf, page, 0, 0, PAGE_W_MM, PAGE_H_MM);
      }
    } else {
      drawPlaceholder(pdf, page, 0, 0, PAGE_W_MM, PAGE_H_MM);
    }

    // Page label in footer (light grey, small)
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(160, 160, 160);
    pdf.text(page.label, PAGE_W_MM / 2, PAGE_H_MM - 3, { align: "center" });
  }

  const safeName = title.replace(/[^a-z0-9_\-\s]/gi, "").trim() || "book";
  pdf.save(`${safeName}.pdf`);
}
