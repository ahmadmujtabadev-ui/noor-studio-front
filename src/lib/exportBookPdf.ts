/**
 * exportBookPdf.ts
 *
 * Pixel-perfect PDF export: renders each BookPage using the same
 * SinglePage React component that the live preview shows, captures it
 * with html2canvas, then assembles a jsPDF document.
 *
 * Result: the PDF looks IDENTICAL to the on-screen preview.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import React from "react";
import { SinglePage } from "@/components/book-renderer/SinglePage";
import type { BookPage } from "@/hooks/useBookEditor";

// Trim size: 6" × 9" in mm and in pixels (at ~150 dpi for render quality)
const PAGE_W_MM  = 152.4;
const PAGE_H_MM  = 228.6;
const RENDER_W   = 900;   // px — 6" × 150dpi
const RENDER_H   = 1350;  // px — 9" × 150dpi

// ─── Render one page to canvas ────────────────────────────────────────────────

async function renderPageToCanvas(
  page:            BookPage,
  bookTitle:       string,
  pageNum:         number,
  preferredLayout: string,
): Promise<HTMLCanvasElement> {
  // Create a fixed off-screen container
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: -${RENDER_H + 200}px;
    left: -${RENDER_W + 200}px;
    width: ${RENDER_W}px;
    height: ${RENDER_H}px;
    overflow: hidden;
    background: #FFFDF5;
  `;
  document.body.appendChild(container);

  // Mount the React component
  const root = createRoot(container);
  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(SinglePage, {
        page,
        bookTitle,
        pageNum,
        preferredLayout,
        className: "w-full h-full",
      }),
    );
    // Allow React to paint + images to load
    setTimeout(resolve, 900);
  });

  // Capture
  const canvas = await html2canvas(container, {
    scale:            2,          // 2× for crispness
    useCORS:          true,
    allowTaint:       true,
    backgroundColor:  "#FFFDF5",
    logging:          false,
    width:            RENDER_W,
    height:           RENDER_H,
    windowWidth:      RENDER_W,
    windowHeight:     RENDER_H,
  });

  // Clean up
  root.unmount();
  document.body.removeChild(container);

  return canvas;
}

// ─── Main export function ─────────────────────────────────────────────────────

export interface ExportOptions {
  preferredLayout?: string;
  onProgress?: (current: number, total: number) => void;
}

export async function exportBookPdf(
  pages:    BookPage[],
  title:    string,
  options?: ExportOptions,
): Promise<void> {
  const { preferredLayout = "full_bleed", onProgress } = options ?? {};

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
      const canvas  = await renderPageToCanvas(page, title, i + 1, preferredLayout);
      const imgData = canvas.toDataURL("image/jpeg", 0.94);
      pdf.addImage(imgData, "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
    } catch (err) {
      console.error(`[exportBookPdf] page ${i + 1} failed`, err);
      // Fallback: blank cream page
      pdf.setFillColor(255, 253, 245);
      pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");
      if (page.text) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(30, 30, 30);
        const lines = pdf.splitTextToSize(page.text, PAGE_W_MM - 30);
        lines.slice(0, 25).forEach((line: string, j: number) => {
          pdf.text(line, PAGE_W_MM / 2, 40 + j * 7, { align: "center" });
        });
      }
    }
  }

  const safeName = title.replace(/[^a-z0-9_\-\s]/gi, "").trim() || "book";
  pdf.save(`${safeName}.pdf`);
}
