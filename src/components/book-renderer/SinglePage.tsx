/**
 * SinglePage.tsx
 * Renders one BookPage into its correct publication layout.
 *
 * Picture-book spread sub-layouts (type = "spread"):
 *   full_bleed            — image 100% bg, white card overlay
 *   image_left_text_right — left half image | right half text + dropcap
 *   image_top_text_bottom — top 62% image, bottom band text
 *   vignette              — circular image, text aside, Islamic corner ornaments
 *
 * Chapter-book text-page sub-layouts (type = "text-page"):
 *   two_column            — two equal columns, running header, outer page nums
 *   text_inline_image     — single column + image floated right 38%
 *   decorative_full_text  — ornamental border + Arabic / hadith pull-quote
 *
 * Standalone page types (no sub-layout):
 *   front-cover | chapter-opener | chapter-moment | back-cover
 */

import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookPage } from "@/hooks/useBookEditor";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const TEAL   = "#1B6B5A";
const GOLD   = "#F5A623";
const CREAM  = "#FAFAF8";
const DARK   = "#0d1117";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function BookImage({
  src, alt = "", className = "", style, placeholderBg = TEAL,
}: {
  src: string; alt?: string; className?: string;
  style?: React.CSSProperties; placeholderBg?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ background: `linear-gradient(135deg, ${placeholderBg}cc, ${placeholderBg}44)`, ...style }}
      >
        <BookOpen className="w-12 h-12 text-white/20" />
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt}
      className={cn("object-cover", className)}
      style={style}
      draggable={false}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}

function DropCap({ char, color = TEAL }: { char: string; color?: string }) {
  return (
    <span
      className="float-left font-bold leading-none mr-1.5"
      style={{
        fontFamily: "'Georgia', serif",
        fontSize: "clamp(2.8rem, 6vw, 3.8rem)",
        lineHeight: 0.82,
        paddingTop: "0.08em",
        color,
      }}
    >
      {char}
    </span>
  );
}

function PageNum({ n, align = "center" }: { n: number; align?: "left" | "center" | "right" }) {
  if (!n) return null;
  return (
    <div className={cn(
      "absolute bottom-3 left-0 right-0 pointer-events-none",
      align === "center" ? "text-center" : align === "left" ? "pl-10 text-left" : "pr-10 text-right",
    )}>
      <span className="text-[10px] italic text-[#1B6B5A]/40" style={{ fontFamily: "'Georgia', serif" }}>
        {n}
      </span>
    </div>
  );
}

/** Islamic 8-pointed star SVG (decorative corner ornament) */
function IslamicStar({ size = 28, color = TEAL, opacity = 0.12 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill={color} style={{ opacity }}>
      <path d="M20 2 L22.5 12 L32 8 L26 16 L38 18 L28 22 L34 32 L24 26 L20 38 L16 26 L6 32 L12 22 L2 18 L14 16 L8 8 L17.5 12 Z" />
    </svg>
  );
}

/** Crescent moon SVG */
function IslamicCrescent({ size = 32, color = TEAL, opacity = 0.12 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill={color} style={{ opacity }}>
      <path d="M24 4C13 4 4 13 4 24s9 20 20 20a20 20 0 0 0 0-40zm0 36a16 16 0 1 1 0-32 12 12 0 0 0 0 32z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PICTURE-BOOK SPREAD LAYOUTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * full_bleed
 * Image 100% background. White rounded card at bottom with bold text.
 */
function FullBleedLayout({ page, pageNum }: { page: BookPage; pageNum: number }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <BookImage src={page.imageUrl} alt={page.label} className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />

      {/* Gradient veil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Text card */}
      {page.text && (
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div
            className="bg-white/93 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl mx-auto"
            style={{ maxWidth: "88%" }}
          >
            <p
              className="text-[#1a1a1a] leading-relaxed text-center"
              style={{
                fontFamily: "'Baloo 2', 'Comic Sans MS', cursive",
                fontSize: "clamp(0.88rem, 2.2vw, 1.2rem)",
                lineHeight: 1.6,
              }}
            >
              {page.text}
            </p>
          </div>
        </div>
      )}

      <PageNum n={pageNum} />
    </div>
  );
}

/**
 * image_left_text_right
 * Left half: full-bleed image. Right half: cream bg, dropcap text.
 */
function ImageLeftTextRightLayout({ page, pageNum }: { page: BookPage; pageNum: number }) {
  const firstChar = page.text?.charAt(0) ?? "";
  const rest      = page.text?.slice(1) ?? "";

  return (
    <div className="relative w-full h-full flex" style={{ backgroundColor: CREAM }}>
      {/* Left half — image */}
      <div className="relative w-1/2 h-full overflow-hidden">
        <BookImage src={page.imageUrl} alt={page.label} className="absolute inset-0 w-full h-full" placeholderBg={TEAL} />
        {/* Right-edge shadow to blend into text side */}
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-black/15 pointer-events-none" />
      </div>

      {/* Right half — text */}
      <div className="relative w-1/2 h-full flex flex-col items-center justify-center px-6 py-8">
        {/* Islamic corner ornament */}
        <div className="absolute top-4 right-4"><IslamicStar size={24} /></div>
        <div className="absolute bottom-4 right-4"><IslamicCrescent size={24} /></div>

        {page.text && (
          <p
            className="text-[#1a1a1a] leading-[1.75] text-left"
            style={{
              fontFamily: "'Baloo 2', 'Comic Sans MS', cursive",
              fontSize: "clamp(0.88rem, 2vw, 1.1rem)",
            }}
          >
            {firstChar && <DropCap char={firstChar} />}
            {rest}
          </p>
        )}

        <PageNum n={pageNum} align="right" />
      </div>
    </div>
  );
}

/**
 * image_top_text_bottom
 * Top 62% = image. Bottom band = accent color, centered text.
 */
function ImageTopTextBottomLayout({ page, pageNum }: { page: BookPage; pageNum: number }) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Image zone */}
      <div className="relative overflow-hidden" style={{ height: "62%" }}>
        <BookImage src={page.imageUrl} alt={page.label} className="w-full h-full" placeholderBg={TEAL} />
        {/* Soft bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F5A62320] to-transparent" />
      </div>

      {/* Text band */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-4 relative"
        style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}11)`, backgroundColor: "#FFF9EE" }}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, transparent, ${GOLD}60, transparent)` }} />

        {page.text && (
          <p
            className="text-[#2a1a00] text-center leading-relaxed"
            style={{
              fontFamily: "'Baloo 2', 'Comic Sans MS', cursive",
              fontSize: "clamp(0.85rem, 2.2vw, 1.15rem)",
              lineHeight: 1.65,
            }}
          >
            {page.text}
          </p>
        )}

        <PageNum n={pageNum} />
      </div>
    </div>
  );
}

/**
 * vignette
 * Cream page. Circular clipped image centered-left.
 * Text to the right. Islamic star + crescent corners.
 */
function VignetteLayout({ page, pageNum }: { page: BookPage; pageNum: number }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: CREAM }}>
      {/* Corner ornaments */}
      <div className="absolute top-3 left-3"><IslamicStar size={30} color={TEAL} opacity={0.1} /></div>
      <div className="absolute top-3 right-3"><IslamicCrescent size={30} color={TEAL} opacity={0.1} /></div>
      <div className="absolute bottom-3 left-3"><IslamicCrescent size={28} color={GOLD} opacity={0.12} /></div>
      <div className="absolute bottom-3 right-3"><IslamicStar size={28} color={GOLD} opacity={0.12} /></div>

      {/* Dashed border frame */}
      <div
        className="absolute inset-4 rounded-2xl pointer-events-none"
        style={{ border: `1.5px dashed ${TEAL}22` }}
      />

      {/* Content: circular image + text */}
      <div className="absolute inset-0 flex items-center justify-center gap-5 px-8">
        {/* Circular image */}
        {page.imageUrl && (
          <div
            className="shrink-0 overflow-hidden rounded-full shadow-lg"
            style={{
              width: "clamp(90px, 35%, 160px)",
              aspectRatio: "1",
              border: `3px solid ${GOLD}60`,
            }}
          >
            <img src={page.imageUrl} alt={page.label} className="w-full h-full object-cover" draggable={false} />
          </div>
        )}

        {/* Text */}
        {page.text && (
          <p
            className="flex-1 text-[#1a1a1a] leading-relaxed"
            style={{
              fontFamily: "'Baloo 2', 'Comic Sans MS', cursive",
              fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
              lineHeight: 1.7,
            }}
          >
            {page.text}
          </p>
        )}
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER-BOOK TEXT-PAGE LAYOUTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * two_column
 * Two equal columns, 24px gutter. Running header. Page number outer corner.
 */
function TwoColumnLayout({
  page, bookTitle, pageNum,
}: { page: BookPage; bookTitle: string; pageNum: number }) {
  const isEven   = pageNum % 2 === 0;
  const firstChar = page.text?.charAt(0) ?? "";
  const rest      = page.text?.slice(1) ?? "";
  const halfLen   = Math.ceil((page.text?.length ?? 0) / 2);
  const colLeft   = page.text?.slice(0, halfLen) ?? "";
  const colRight  = page.text?.slice(halfLen) ?? "";

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      {/* Running header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-3 border-b" style={{ borderColor: `${TEAL}18` }}>
        <span className="text-[9px] uppercase tracking-[0.22em]" style={{ color: `${TEAL}60`, fontFamily: "'Georgia', serif" }}>
          {isEven ? bookTitle : (page.subTitle || bookTitle)}
        </span>
        <div className="flex-1 mx-3 h-px" style={{ background: `${TEAL}15` }} />
        <span className="text-[9px] uppercase tracking-[0.22em]" style={{ color: `${TEAL}60`, fontFamily: "'Georgia', serif" }}>
          {isEven ? (page.subTitle || bookTitle) : bookTitle}
        </span>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex gap-5 px-8 py-5 overflow-hidden">
        {/* Column 1 */}
        <div className="flex-1 overflow-hidden">
          <p
            className="text-[#1a1a1a] leading-[1.9] text-justify hyphens-auto"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "clamp(0.72rem, 1.3vw, 0.88rem)" }}
          >
            {firstChar && <DropCap char={firstChar} />}
            {rest.slice(0, Math.ceil(rest.length / 2))}
          </p>
        </div>

        {/* Gutter divider */}
        <div className="w-px shrink-0" style={{ background: `${TEAL}12` }} />

        {/* Column 2 */}
        <div className="flex-1 overflow-hidden">
          <p
            className="text-[#1a1a1a] leading-[1.9] text-justify hyphens-auto"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "clamp(0.72rem, 1.3vw, 0.88rem)" }}
          >
            {rest.slice(Math.ceil(rest.length / 2))}
          </p>
        </div>
      </div>

      {/* Footer with outer-corner page num */}
      <div className={cn("flex items-center px-8 pb-5", isEven ? "justify-start" : "justify-end")}>
        <span className="text-[10px] italic" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>{pageNum}</span>
      </div>

      {/* Decorative corner star */}
      <div className="absolute" style={{ [isEven ? "left" : "right"]: "2rem", bottom: "2.5rem" }}>
        <IslamicStar size={32} />
      </div>
    </div>
  );
}

/**
 * text_inline_image
 * Chapter illustration embedded inline within the prose.
 * Layout:
 *   ┌────────────────────────────────────────┐
 *   │  Running header                        │
 *   ├────────────────────────────────────────┤
 *   │  [A]Drop-cap opening text starts here  │
 *   │    and continues for a while…          │
 *   │  ┌──────────────┐  More prose wraps    │
 *   │  │  ILLUSTRATION│  alongside the       │
 *   │  │   IMAGE      │  chapter image on    │
 *   │  │  (38% wide)  │  the right side.     │
 *   │  └──────────────┘                      │
 *   │  [caption italic]                      │
 *   │  Remaining prose continues full-width. │
 *   ├────────────────────────────────────────┤
 *   │  Page number                           │
 *   └────────────────────────────────────────┘
 */
function TextInlineImageLayout({
  page, bookTitle, pageNum,
}: { page: BookPage; bookTitle: string; pageNum: number }) {
  const isEven    = pageNum % 2 === 0;
  const text      = page.text ?? "";
  const firstChar = text.charAt(0);
  const rest      = text.slice(1);

  // Split rest into "alongside image" (first 58%) and "below image" portions
  const words     = rest.split(" ");
  const splitIdx  = Math.max(1, Math.floor(words.length * 0.58));
  const topText   = words.slice(0, splitIdx).join(" ");
  const botText   = words.slice(splitIdx).join(" ");

  const bodyFont: React.CSSProperties = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize:   "clamp(0.73rem, 1.3vw, 0.88rem)",
    lineHeight: 1.9,
    color:      "#1a1a1a",
  };

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>

      {/* Running header */}
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b shrink-0"
        style={{ borderColor: `${TEAL}18` }}>
        <span className="text-[9px] uppercase tracking-[0.22em]"
          style={{ color: `${TEAL}60`, fontFamily: "'Georgia', serif" }}>
          {isEven ? bookTitle : (page.subTitle || bookTitle)}
        </span>
        <div className="flex-1 mx-3 h-px" style={{ background: `${TEAL}15` }} />
        <span className="text-[9px] uppercase tracking-[0.22em]"
          style={{ color: `${TEAL}60`, fontFamily: "'Georgia', serif" }}>
          {isEven ? (page.subTitle || bookTitle) : bookTitle}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 py-5 flex flex-col gap-2 overflow-hidden">

        {/* Zone 1: image row — left text + right image side by side */}
        <div className="flex gap-4 items-start">
          {/* Left: text with dropcap */}
          <p className="flex-1 text-justify hyphens-auto" style={bodyFont}>
            {firstChar && <DropCap char={firstChar} />}
            {topText}
          </p>

          {/* Right: chapter illustration */}
          {page.imageUrl && (
            <div className="shrink-0" style={{ width: "38%" }}>
              <div className="rounded-xl overflow-hidden shadow-md"
                style={{ border: `1px solid ${TEAL}18` }}>
                <img
                  src={page.imageUrl}
                  alt={page.label}
                  className="w-full object-cover block"
                  style={{ aspectRatio: "3 / 4", maxHeight: "55%" }}
                  draggable={false}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {/* Caption */}
              {page.subTitle && (
                <p className="mt-1.5 text-center italic"
                  style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(0.6rem, 1vw, 0.75rem)", color: `${TEAL}90` }}>
                  {page.subTitle}
                </p>
              )}
              {/* Decorative teal line below caption */}
              <div className="mt-2 mx-auto h-px w-12" style={{ background: `${TEAL}40` }} />
            </div>
          )}
        </div>

        {/* Zone 2: remaining text spans full width below image */}
        {botText && (
          <p className="text-justify hyphens-auto" style={bodyFont}>
            {botText}
          </p>
        )}
      </div>

      {/* Footer with outer-corner page number */}
      <div className={cn("flex items-center px-8 pb-5 shrink-0", isEven ? "justify-start" : "justify-end")}>
        <span className="text-[10px] italic" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>
          {pageNum}
        </span>
      </div>

      {/* Decorative corner star */}
      <div className="absolute" style={{ [isEven ? "left" : "right"]: "1.75rem", bottom: "2.25rem" }}>
        <IslamicStar size={28} />
      </div>
    </div>
  );
}

/**
 * decorative_full_text
 * Ornamental dashed border. Arabic text RTL + English hadith / ayah.
 * Gold accent blockquote. For Islamic educational callouts.
 */
function DecorativeFullTextLayout({
  page, bookTitle, pageNum,
}: { page: BookPage; bookTitle: string; pageNum: number }) {
  // Try to split text at a "—" separator: Arabic portion before, English after
  const [arabic, english] = (page.text ?? "").includes(" — ")
    ? (page.text ?? "").split(" — ", 2)
    : ["", page.text ?? ""];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: CREAM }}>
      {/* Dashed ornamental border */}
      <div
        className="absolute inset-4 rounded-2xl pointer-events-none"
        style={{ border: `1.5px dashed ${TEAL}30` }}
      />
      {/* Corner ornaments */}
      <div className="absolute top-3 left-3"><IslamicStar size={32} color={TEAL} opacity={0.2} /></div>
      <div className="absolute top-3 right-3"><IslamicStar size={32} color={TEAL} opacity={0.2} /></div>
      <div className="absolute bottom-3 left-3"><IslamicStar size={32} color={GOLD} opacity={0.2} /></div>
      <div className="absolute bottom-3 right-3"><IslamicStar size={32} color={GOLD} opacity={0.2} /></div>

      {/* Running header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-6 pb-2">
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>
          {bookTitle}
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>
          {page.subTitle || ""}
        </span>
      </div>

      {/* Pull-quote card */}
      <div
        className="relative mx-10 rounded-xl overflow-hidden shadow-sm"
        style={{ borderLeft: `4px solid ${GOLD}`, backgroundColor: `${GOLD}08` }}
      >
        {/* Gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, ${GOLD}80, transparent)` }} />

        <div className="px-7 py-6">
          {/* Arabic / hadith text — RTL */}
          {arabic && (
            <p
              dir="rtl"
              className="text-right mb-4 leading-[2]"
              style={{
                fontFamily: "'Amiri', 'Scheherazade New', 'Times New Roman', serif",
                fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                color: "#1a1a1a",
              }}
            >
              {arabic}
            </p>
          )}

          {/* Divider */}
          {arabic && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: `${GOLD}40` }} />
              <IslamicStar size={14} color={GOLD} opacity={0.7} />
              <div className="flex-1 h-px" style={{ background: `${GOLD}40` }} />
            </div>
          )}

          {/* English translation */}
          {english && (
            <p
              className="text-center italic leading-[1.8]"
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(0.78rem, 1.5vw, 0.95rem)",
                color: "#333",
              }}
            >
              "{english}"
            </p>
          )}
        </div>
      </div>

      {/* Page number */}
      <PageNum n={pageNum} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STANDALONE PAGE TYPES (no sub-layout variants)
// ─────────────────────────────────────────────────────────────────────────────

function FrontCoverLayout({ page }: { page: BookPage }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <BookImage src={page.imageUrl} alt="Cover" className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-10 text-center">
        {page.title && (
          <h1
            className="text-white font-bold leading-tight drop-shadow-2xl"
            style={{
              fontFamily: "'Baloo 2', 'Georgia', serif",
              fontSize: "clamp(1.6rem, 5vw, 3.2rem)",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            {page.title}
          </h1>
        )}
        {page.text && (
          <p className="text-white/75 mt-3 drop-shadow"
            style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: "clamp(0.8rem, 2vw, 1.1rem)" }}>
            {page.text}
          </p>
        )}
      </div>

      {/* Decorative crescent */}
      <IslamicCrescent size={48} color="white" opacity={0.25} />
      <div className="absolute top-6 right-6 pointer-events-none">
        <IslamicCrescent size={48} color="white" opacity={0.25} />
      </div>
    </div>
  );
}

function ChapterOpenerLayout({ page }: { page: BookPage }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      {/* Top 55% image zone */}
      <div className="absolute top-0 left-0 right-0" style={{ height: "55%" }}>
        <BookImage src={page.imageUrl} alt={page.label} className="w-full h-full" placeholderBg="#0F4A3E" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117]" />
      </div>

      {/* Bottom text zone */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center text-center px-10 pb-10"
        style={{ top: "50%" }}
      >
        {/* Gold divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-10" style={{ background: `${GOLD}50` }} />
          <IslamicStar size={16} color={GOLD} opacity={0.7} />
          <div className="h-px w-10" style={{ background: `${GOLD}50` }} />
        </div>

        {page.subTitle && (
          <p className="uppercase tracking-[0.25em] text-xs font-semibold mb-3"
            style={{ color: `${GOLD}90`, fontFamily: "'Baloo 2', sans-serif" }}>
            {page.subTitle}
          </p>
        )}

        {page.title && (
          <h2
            className="text-white font-bold leading-tight"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(1.2rem, 3.5vw, 2rem)",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {page.title}
          </h2>
        )}
      </div>
    </div>
  );
}

function ChapterMomentLayout({ page, pageNum }: { page: BookPage; pageNum: number }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <BookImage src={page.imageUrl} alt={page.label} className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {page.text && (
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-6">
          <p className="text-white/80 text-center italic text-sm"
            style={{ fontFamily: "'Georgia', serif" }}>
            {page.text}
          </p>
        </div>
      )}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <span className="text-white/25 text-[10px]">{pageNum || ""}</span>
      </div>
    </div>
  );
}

function BackCoverLayout({ page }: { page: BookPage }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <BookImage src={page.imageUrl} alt="Back Cover" className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {page.text && (
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="w-6 h-0.5 mb-4" style={{ background: GOLD }} />
            <p className="text-white/85 leading-relaxed text-sm" style={{ fontFamily: "'Georgia', serif" }}>
              {page.text}
            </p>
          </div>
        </div>
      )}

      {/* ISBN bar placeholder */}
      <div className="absolute bottom-4 right-6 opacity-25">
        <div className="w-20 h-10 border border-white/40 rounded flex items-center justify-center">
          <span className="text-white text-[8px] font-mono">ISBN</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export interface SinglePageProps {
  page:              BookPage;
  bookTitle?:        string;
  pageNum?:          number;
  /** True → render a blank cream placeholder (spine separator) */
  isBlank?:          boolean;
  className?:        string;
  /**
   * Override auto-detected layoutType with the user's chosen preference.
   * Picture-book layouts: full_bleed | image_left_text_right | image_top_text_bottom | vignette
   * Chapter-book layouts: two_column | text_inline_image | decorative_full_text
   * Only applied to the matching page type (picture vs chapter).
   */
  preferredLayout?:  string;
}

const PICTURE_LAYOUTS = new Set(["full_bleed", "image_left_text_right", "image_top_text_bottom", "vignette"]);
const CHAPTER_LAYOUTS = new Set(["two_column", "text_inline_image", "decorative_full_text"]);

export function SinglePage({
  page,
  bookTitle        = "",
  pageNum          = 0,
  isBlank          = false,
  className        = "",
  preferredLayout,
}: SinglePageProps) {
  if (isBlank) {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{
          background: "linear-gradient(to right, #F5F3EF, #FAF8F4)",
          borderLeft: "1px solid rgba(0,0,0,0.06)",
        }}
      />
    );
  }

  const layout = (() => {
    switch (page.type) {
      // ── Fixed layouts ──────────────────────────────────────────────────────
      case "front-cover":
        return <FrontCoverLayout page={page} />;

      case "chapter-opener":
        return <ChapterOpenerLayout page={page} />;

      case "chapter-moment":
        return <ChapterMomentLayout page={page} pageNum={pageNum} />;

      case "back-cover":
        return <BackCoverLayout page={page} />;

      // ── Picture-book spreads — sub-layout dispatch ─────────────────────────
      case "spread": {
        // User preference wins if it's a valid picture-book layout
        const lt = (preferredLayout && PICTURE_LAYOUTS.has(preferredLayout)
          ? preferredLayout
          : page.layoutType) ?? "full_bleed";
        if (lt === "image_left_text_right")
          return <ImageLeftTextRightLayout page={page} pageNum={pageNum} />;
        if (lt === "image_top_text_bottom")
          return <ImageTopTextBottomLayout page={page} pageNum={pageNum} />;
        if (lt === "vignette")
          return <VignetteLayout page={page} pageNum={pageNum} />;
        return <FullBleedLayout page={page} pageNum={pageNum} />;
      }

      // ── Chapter-book text pages — sub-layout dispatch ──────────────────────
      case "text-page": {
        // User preference wins if it's a valid chapter-book layout
        const lt = (preferredLayout && CHAPTER_LAYOUTS.has(preferredLayout)
          ? preferredLayout
          : page.layoutType) ?? "two_column";
        if (lt === "text_inline_image")
          return <TextInlineImageLayout page={page} bookTitle={bookTitle} pageNum={pageNum} />;
        if (lt === "decorative_full_text")
          return <DecorativeFullTextLayout page={page} bookTitle={bookTitle} pageNum={pageNum} />;
        return <TwoColumnLayout page={page} bookTitle={bookTitle} pageNum={pageNum} />;
      }

      default:
        return <FullBleedLayout page={page} pageNum={pageNum} />;
    }
  })();

  return <div className={cn("w-full h-full", className)}>{layout}</div>;
}
