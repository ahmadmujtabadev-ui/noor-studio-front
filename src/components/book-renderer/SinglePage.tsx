/**
 * SinglePage.tsx
 * Renders one BookPage into its correct publication layout.
 * All image frames / borders removed — illustrations render clean.
 * Font settings are read from page.fabricJson when available.
 */

import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookPage } from "@/hooks/useBookEditor";
import { useBookTextStyleStore, DEFAULT_STYLE } from "@/lib/store/bookTextStyleStore";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const TEAL   = "#1B6B5A";
const GOLD   = "#F5A623";
const CREAM  = "#FFFDF5";
const DARK   = "#0d1117";

// ─── Text style type (populated from bookTextStyleStore) ─────────────────────

interface TextStyle {
  fontFamily: string;
  color: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Truncate a string for running headers — avoids multi-line overflow */
function truncate(s: string, max = 30): string {
  return s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
}

/** Clean image — no borders, no frames, no decorations */
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
        style={{ background: `linear-gradient(135deg, ${placeholderBg}bb, ${placeholderBg}33)`, ...style }}
      >
        <BookOpen className="w-14 h-14 text-white/20" />
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

function DropCap({ char, color = TEAL, font }: { char: string; color?: string; font?: string }) {
  return (
    <span
      className="float-left font-bold leading-none mr-2"
      style={{
        fontFamily: font ?? "'Georgia', serif",
        fontSize: "clamp(3rem, 6.5vw, 4.2rem)",
        lineHeight: 0.8,
        paddingTop: "0.06em",
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
      <span className="text-[10px] italic" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>
        {n}
      </span>
    </div>
  );
}

/** Islamic 8-pointed star — corner ornament */
function IslamicStar({ size = 28, color = TEAL, opacity = 0.10 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill={color} style={{ opacity }}>
      <path d="M20 2 L22.5 12 L32 8 L26 16 L38 18 L28 22 L34 32 L24 26 L20 38 L16 26 L6 32 L12 22 L2 18 L14 16 L8 8 L17.5 12 Z" />
    </svg>
  );
}

/** Elegant gold divider with Islamic star in centre */
function GoldDivider({ starSize = 12 }: { starSize?: number }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD}70, transparent)` }} />
      <IslamicStar size={starSize} color={GOLD} opacity={0.75} />
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD}70, transparent)` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PICTURE-BOOK SPREAD LAYOUTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * full_bleed
 * Image fills entire page. White rounded card overlaid at bottom with text.
 */
function FullBleedLayout({ page, pageNum, ts }: { page: BookPage; pageNum: number; ts: TextStyle }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <BookImage src={page.imageUrl} alt={page.label} className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {page.text && (
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div
            className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-2xl mx-auto"
            style={{ maxWidth: "92%" }}
          >
            <p
              className="leading-relaxed text-center"
              style={{
                fontFamily: ts.fontFamily,
                color: ts.color,
                fontSize: "clamp(0.9rem, 2.3vw, 1.22rem)",
                lineHeight: 1.65,
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
 * image_left_text_right  (Image + Text)
 * Left 56%: full-bleed illustration, zero padding/border.
 * Right 44%: warm cream, drop-cap text, centred vertically.
 * Thin gold rule separates the two halves.
 */
function ImageLeftTextRightLayout({ page, pageNum, ts }: { page: BookPage; pageNum: number; ts: TextStyle }) {
  const firstChar = page.text?.charAt(0) ?? "";
  const rest      = page.text?.slice(1) ?? "";

  return (
    <div className="relative w-full h-full flex" style={{ backgroundColor: CREAM }}>

      {/* ── LEFT — full-bleed image ── */}
      <div className="relative overflow-hidden" style={{ width: "56%" }}>
        <BookImage
          src={page.imageUrl}
          alt={page.label}
          className="absolute inset-0 w-full h-full"
          placeholderBg={TEAL}
        />
      </div>

      {/* ── Thin vertical gold rule ── */}
      <div className="shrink-0 w-px self-stretch" style={{ background: `${GOLD}35` }} />

      {/* ── RIGHT — text panel ── */}
      <div
        className="relative flex flex-col items-start justify-center px-7 py-10"
        style={{ flex: 1, background: CREAM }}
      >
        {/* Corner ornaments (text side only) */}
        <div className="absolute top-4 right-4 pointer-events-none"><IslamicStar size={22} color={TEAL} opacity={0.09} /></div>
        <div className="absolute bottom-4 right-4 pointer-events-none"><IslamicStar size={18} color={GOLD} opacity={0.10} /></div>

        {page.text ? (
          <p
            className="text-left leading-[1.8]"
            style={{
              fontFamily: ts.fontFamily,
              color: ts.color,
              fontSize: "clamp(0.9rem, 2.1vw, 1.15rem)",
            }}
          >
            {firstChar && <DropCap char={firstChar} color={TEAL} font={ts.fontFamily} />}
            {rest}
          </p>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <BookOpen className="w-10 h-10" style={{ color: TEAL }} />
          </div>
        )}

        <PageNum n={pageNum} align="right" />
      </div>
    </div>
  );
}

/**
 * image_top_text_bottom  (Stack)
 * Top 62%: image fills full width.
 * Bottom 38%: warm cream band, centred text.
 */
function ImageTopTextBottomLayout({ page, pageNum, ts }: { page: BookPage; pageNum: number; ts: TextStyle }) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: CREAM }}>

      {/* Image zone */}
      <div className="relative overflow-hidden" style={{ height: "62%" }}>
        <BookImage src={page.imageUrl} alt={page.label} className="w-full h-full" placeholderBg={TEAL} />
        {/* Soft bottom fade into text area */}
        <div
          className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${CREAM})` }}
        />
      </div>

      {/* Gold divider */}
      <div className="shrink-0 px-8 py-1">
        <GoldDivider />
      </div>

      {/* Text band */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-7 py-3 relative"
        style={{ backgroundColor: CREAM }}
      >
        {page.text && (
          <p
            className="text-center leading-relaxed"
            style={{
              fontFamily: ts.fontFamily,
              color: ts.color,
              fontSize: "clamp(0.88rem, 2.2vw, 1.18rem)",
              lineHeight: 1.7,
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
 * Professional picture-book vignette layout:
 * — Warm ivory background
 * — Full-width illustration (top 66%) with soft radial vignette fade at all edges
 * — Elegant gold divider
 * — Centred text below, serif or custom font from editor
 * — Very subtle Islamic corner ornaments
 * No circles. No borders. No frames.
 */
function VignetteLayout({ page, pageNum, ts }: { page: BookPage; pageNum: number; ts: TextStyle }) {

  const bgColor = "#FFFBF0";

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>

      {/* ── Background warmth gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, #FFFDF5 0%, #FFF3D6 100%)",
        }}
      />

      {/* ── Corner ornaments — very subtle ── */}
      <div className="absolute top-4 left-4 pointer-events-none"><IslamicStar size={26} color={TEAL} opacity={0.07} /></div>
      <div className="absolute top-4 right-4 pointer-events-none"><IslamicStar size={26} color={TEAL} opacity={0.07} /></div>
      <div className="absolute bottom-4 left-4 pointer-events-none"><IslamicStar size={22} color={GOLD} opacity={0.09} /></div>
      <div className="absolute bottom-4 right-4 pointer-events-none"><IslamicStar size={22} color={GOLD} opacity={0.09} /></div>

      {/* ── Outer dashed border — very faint ── */}
      <div
        className="absolute inset-[14px] rounded-2xl pointer-events-none"
        style={{ border: `1px dashed ${TEAL}14` }}
      />

      {/* ── Illustration zone (top 64%) ── */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "64%", padding: "18px 18px 0" }}
      >
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          {page.imageUrl ? (
            <>
              {/* The illustration — NO borders, NO frames */}
              <img
                src={page.imageUrl}
                alt={page.label}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />

              {/* Vignette effect — radial fade from edges into background colour */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(
                      ellipse 90% 85% at 50% 45%,
                      transparent 50%,
                      ${bgColor}CC 85%,
                      ${bgColor} 100%
                    )
                  `,
                }}
              />
              {/* Bottom edge fade — smooth blend into divider */}
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "40%",
                  background: `linear-gradient(to bottom, transparent 0%, ${bgColor}99 70%, ${bgColor} 100%)`,
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}0A)` }}
            >
              <BookOpen className="w-16 h-16" style={{ color: `${TEAL}40` }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Gold divider at 64% mark ── */}
      <div
        className="absolute left-8 right-8 flex items-center"
        style={{ top: "calc(64% - 2px)" }}
      >
        <GoldDivider starSize={14} />
      </div>

      {/* ── Text zone ── */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center px-10 pb-8"
        style={{ top: "64%" }}
      >
        {page.text && (
          <p
            className="text-center"
            style={{
              fontFamily: ts.fontFamily,
              color: ts.color,
              fontSize: "clamp(0.92rem, 2.3vw, 1.22rem)",
              lineHeight: 1.75,
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

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER-BOOK TEXT-PAGE LAYOUTS
// ─────────────────────────────────────────────────────────────────────────────

function TwoColumnLayout({
  page, bookTitle, pageNum, ts,
}: { page: BookPage; bookTitle: string; pageNum: number; ts: TextStyle }) {
  const isEven = pageNum % 2 === 0;
  const text   = page.text ?? "";
  const firstChar = text.charAt(0);
  const rest      = text.slice(1);

  // Word-boundary column split for balanced columns
  const words     = rest.split(/\s+/);
  const halfWords = Math.ceil(words.length / 2);
  const leftText  = words.slice(0, halfWords).join(" ");
  const rightText = words.slice(halfWords).join(" ");

  const bodyStyle: React.CSSProperties = {
    fontFamily: ts.fontFamily !== "'Baloo 2', 'Comic Sans MS', cursive"
      ? ts.fontFamily
      : "'Georgia', 'Times New Roman', serif",
    fontSize:   "clamp(0.72rem, 1.3vw, 0.88rem)",
    lineHeight: 1.9,
    color:      ts.color,
    textAlign:  "justify",
  };

  // Truncated labels for running header — prevents multi-line overflow
  const leftLabel  = isEven ? truncate(bookTitle) : truncate(page.subTitle || bookTitle);
  const rightLabel = isEven ? truncate(page.subTitle || bookTitle) : truncate(bookTitle);

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      {/* Running header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-3 shrink-0 border-b" style={{ borderColor: `${TEAL}14` }}>
        <span className="text-[9px] uppercase tracking-[0.22em] truncate max-w-[42%]" style={{ color: `${TEAL}55`, fontFamily: "'Georgia', serif" }}>
          {leftLabel}
        </span>
        <div className="flex-1 mx-3 h-px" style={{ background: `${TEAL}12` }} />
        <span className="text-[9px] uppercase tracking-[0.22em] truncate max-w-[42%]" style={{ color: `${TEAL}55`, fontFamily: "'Georgia', serif" }}>
          {rightLabel}
        </span>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex gap-5 px-8 py-5 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <p style={bodyStyle}>
            {firstChar && <DropCap char={firstChar} color={TEAL} font={ts.fontFamily} />}
            {leftText}
          </p>
        </div>
        <div className="w-px shrink-0" style={{ background: `${TEAL}10` }} />
        <div className="flex-1 overflow-hidden">
          <p style={bodyStyle}>{rightText}</p>
        </div>
      </div>

      <div className={cn("flex items-center px-8 pb-5 shrink-0", isEven ? "justify-start" : "justify-end")}>
        <span className="text-[10px] italic" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>{pageNum}</span>
      </div>
      <div className="absolute" style={{ [isEven ? "left" : "right"]: "2rem", bottom: "2.5rem" }}>
        <IslamicStar size={30} color={TEAL} opacity={0.08} />
      </div>
    </div>
  );
}

function TextInlineImageLayout({
  page, bookTitle, pageNum, ts,
}: { page: BookPage; bookTitle: string; pageNum: number; ts: TextStyle }) {
  const isEven        = pageNum % 2 === 0;
  const text          = page.text ?? "";
  const firstChar     = text.charAt(0);
  const rest          = text.slice(1);
  const hasImage      = !!page.imageUrl;
  const hasBottomImg  = !!page.secondImageUrl;

  const bodyFont = ts.fontFamily !== "'Baloo 2', 'Comic Sans MS', cursive"
    ? ts.fontFamily
    : "'Georgia', 'Times New Roman', serif";

  const bodyStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontSize:   "clamp(0.73rem, 1.3vw, 0.88rem)",
    lineHeight: 1.9,
    color:      ts.color,
    textAlign:  "justify",
  };

  const leftLabel  = isEven ? truncate(bookTitle) : truncate(page.subTitle || bookTitle);
  const rightLabel = isEven ? truncate(page.subTitle || bookTitle) : truncate(bookTitle);

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>

      {/* ── Running header ── */}
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b shrink-0" style={{ borderColor: `${TEAL}14` }}>
        <span className="text-[9px] uppercase tracking-[0.22em] truncate max-w-[42%]" style={{ color: `${TEAL}55`, fontFamily: "'Georgia', serif" }}>
          {leftLabel}
        </span>
        <div className="flex-1 mx-3 h-px" style={{ background: `${TEAL}12` }} />
        <span className="text-[9px] uppercase tracking-[0.22em] truncate max-w-[42%]" style={{ color: `${TEAL}55`, fontFamily: "'Georgia', serif" }}>
          {rightLabel}
        </span>
      </div>

      {/* ── Text zone — uses CSS float so text wraps around image naturally ── */}
      <div
        className="overflow-hidden"
        style={{
          padding: "1.25rem 2rem 1.5rem",
          flexShrink: 0,
          // Hard-clamp at 53% — leaves room for gradient overlap + no bleed
          ...(hasBottomImg ? { height: "53%" } : { flex: 1 }),
        }}
      >
        {/* Float the inline image right — text flows around it on left AND below */}
        {hasImage && (
          <img
            src={page.imageUrl}
            alt={page.label}
            className="rounded-lg object-cover"
            style={{
              float:         "right",
              width:         "38%",
              aspectRatio:   "2 / 3",
              marginLeft:    "1rem",
              marginBottom:  "0.5rem",
              display:       "block",
            }}
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <p style={bodyStyle}>
          {firstChar && <DropCap char={firstChar} color={TEAL} font={bodyFont} />}
          {rest}
        </p>
      </div>

      {/* ── Bottom illustration zone — second moment, full bleed ── */}
      {hasBottomImg ? (
        <div className="flex-1 relative overflow-hidden">
          {/* Tall cream-to-transparent gradient — covers any text bleed from the zone above */}
          <div
            className="absolute inset-x-0 top-0 z-10 pointer-events-none"
            style={{ height: "42%", background: `linear-gradient(to bottom, ${CREAM} 0%, ${CREAM}CC 35%, transparent 100%)` }}
          />
          <img
            src={page.secondImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      ) : (
        /* No bottom image — just page number row */
        <div className={cn("flex items-center px-8 pb-5 shrink-0", isEven ? "justify-start" : "justify-end")}>
          <span className="text-[10px] italic" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>{pageNum}</span>
        </div>
      )}

      {/* Page number — overlaid when bottom image is present */}
      {hasBottomImg && (
        <div className={cn("absolute bottom-3 px-8 z-20", isEven ? "left-0" : "right-0")}>
          <span className="text-[10px] italic text-white/60" style={{ fontFamily: "'Georgia', serif" }}>{pageNum}</span>
        </div>
      )}

      {/* Corner ornament — only when no bottom image */}
      {!hasBottomImg && (
        <div className="absolute" style={{ [isEven ? "left" : "right"]: "1.75rem", bottom: "2.25rem" }}>
          <IslamicStar size={26} color={TEAL} opacity={0.08} />
        </div>
      )}
    </div>
  );
}

function DecorativeFullTextLayout({
  page, bookTitle, pageNum, ts,
}: { page: BookPage; bookTitle: string; pageNum: number; ts: TextStyle }) {
  const [arabic, english] = (page.text ?? "").includes(" — ")
    ? (page.text ?? "").split(" — ", 2)
    : ["", page.text ?? ""];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: CREAM }}>
      <div className="absolute inset-5 rounded-2xl pointer-events-none" style={{ border: `1px dashed ${TEAL}22` }} />
      <div className="absolute top-3 left-3"><IslamicStar size={30} color={TEAL} opacity={0.18} /></div>
      <div className="absolute top-3 right-3"><IslamicStar size={30} color={TEAL} opacity={0.18} /></div>
      <div className="absolute bottom-3 left-3"><IslamicStar size={28} color={GOLD} opacity={0.18} /></div>
      <div className="absolute bottom-3 right-3"><IslamicStar size={28} color={GOLD} opacity={0.18} /></div>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-6">
        <span className="text-[9px] uppercase tracking-[0.2em] truncate max-w-[45%]" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>{truncate(bookTitle)}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] truncate max-w-[45%]" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>{truncate(page.subTitle || "")}</span>
      </div>

      <div className="relative mx-10 rounded-xl overflow-hidden shadow-sm" style={{ borderLeft: `4px solid ${GOLD}`, backgroundColor: `${GOLD}07` }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, ${GOLD}70, transparent)` }} />
        <div className="px-7 py-6">
          {arabic && (
            <p dir="rtl" className="text-right mb-4 leading-[2]" style={{
              fontFamily: "'Amiri', 'Scheherazade New', 'Times New Roman', serif",
              fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)", color: ts.color,
            }}>{arabic}</p>
          )}
          {arabic && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: `${GOLD}40` }} />
              <IslamicStar size={14} color={GOLD} opacity={0.7} />
              <div className="flex-1 h-px" style={{ background: `${GOLD}40` }} />
            </div>
          )}
          {english && (
            <p className="text-center italic leading-[1.8]" style={{
              fontFamily: ts.fontFamily !== "'Baloo 2', 'Comic Sans MS', cursive" ? ts.fontFamily : "'Georgia', serif",
              fontSize: "clamp(0.78rem, 1.5vw, 0.95rem)", color: ts.color,
            }}>"{english}"</p>
          )}
        </div>
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STANDALONE PAGE TYPES
// ─────────────────────────────────────────────────────────────────────────────

function FrontCoverLayout({ page, ts }: { page: BookPage; ts: TextStyle }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <BookImage src={page.imageUrl} alt="Cover" className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-10 text-center">
        {page.title && (
          <h1 className="text-white font-bold leading-tight drop-shadow-2xl"
            style={{ fontFamily: ts.fontFamily, fontSize: "clamp(1.6rem, 5vw, 3.2rem)", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
            {page.title}
          </h1>
        )}
        {page.text && (
          <p className="text-white/75 mt-3 drop-shadow" style={{ fontFamily: ts.fontFamily, fontSize: "clamp(0.8rem, 2vw, 1.1rem)" }}>
            {page.text}
          </p>
        )}
      </div>
      <div className="absolute top-6 right-6 pointer-events-none">
        <IslamicStar size={44} color="white" opacity={0.22} />
      </div>
    </div>
  );
}

function ChapterOpenerLayout({ page, ts }: { page: BookPage; ts: TextStyle }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: "55%" }}>
        <BookImage src={page.imageUrl} alt={page.label} className="w-full h-full" placeholderBg="#0F4A3E" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117]" />
      </div>
      <div className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center text-center px-10 pb-10" style={{ top: "50%" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-10" style={{ background: `${GOLD}50` }} />
          <IslamicStar size={16} color={GOLD} opacity={0.7} />
          <div className="h-px w-10" style={{ background: `${GOLD}50` }} />
        </div>
        {page.subTitle && (
          <p className="uppercase tracking-[0.25em] text-xs font-semibold mb-3" style={{ color: `${GOLD}90`, fontFamily: ts.fontFamily }}>
            {page.subTitle}
          </p>
        )}
        {page.title && (
          <h2 className="text-white font-bold leading-tight"
            style={{ fontFamily: ts.fontFamily, fontSize: "clamp(1.2rem, 3.5vw, 2rem)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
            {page.title}
          </h2>
        )}
      </div>
    </div>
  );
}

function ChapterMomentLayout({ page, pageNum, ts }: { page: BookPage; pageNum: number; ts: TextStyle }) {
  // Only show a caption when it is short (momentTitle, not illustration prompt)
  const caption = page.text && page.text.length < 120 ? page.text : "";
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <BookImage src={page.imageUrl} alt={page.label} className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      {caption ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
            <p className="text-white/85 text-center italic text-sm leading-relaxed" style={{ fontFamily: ts.fontFamily }}>{caption}</p>
          </div>
        </>
      ) : (
        /* No overlay when no caption — pure full-bleed illustration */
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      )}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <span className="text-white/20 text-[10px]">{pageNum || ""}</span>
      </div>
    </div>
  );
}

function BackCoverLayout({ page, ts }: { page: BookPage; ts: TextStyle }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: DARK }}>
      <BookImage src={page.imageUrl} alt="Back Cover" className="absolute inset-0 w-full h-full" placeholderBg="#0F4A3E" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
      {page.text && (
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="w-6 h-0.5 mb-4" style={{ background: GOLD }} />
            <p className="text-white/85 leading-relaxed text-sm" style={{ fontFamily: ts.fontFamily }}>{page.text}</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 right-6 opacity-20">
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
  page:             BookPage;
  bookTitle?:       string;
  pageNum?:         number;
  isBlank?:         boolean;
  className?:       string;
  preferredLayout?: string;
  projectId?:       string;
  /**
   * For image_left_text_right spread layout:
   * "image" → this page renders ONLY the full-bleed illustration
   * "text"  → this page renders ONLY the text (cream bg, drop-cap)
   */
  spreadSide?: "image" | "text";
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT SPREAD HELPERS (for image_left_text_right)
// ─────────────────────────────────────────────────────────────────────────────

/** Full-page image — no text, no overlays, pure illustration */
function ImageOnlyPage({ page }: { page: BookPage }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: "#0d1117" }}>
      {page.imageUrl ? (
        <img
          src={page.imageUrl}
          alt={page.label}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${TEAL}cc, ${TEAL}44)` }}>
          <BookOpen className="w-16 h-16 text-white/20" />
        </div>
      )}
    </div>
  );
}

/** Full-page text — cream bg, large centred text with drop-cap */
function TextOnlyPage({ page, pageNum, ts }: { page: BookPage; pageNum: number; ts: TextStyle }) {
  const firstChar = page.text?.charAt(0) ?? "";
  const rest      = page.text?.slice(1) ?? "";

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: CREAM }}>
      {/* Subtle corner ornaments */}
      <div className="absolute top-5 right-5 pointer-events-none"><IslamicStar size={22} color={TEAL} opacity={0.07} /></div>
      <div className="absolute bottom-5 left-5 pointer-events-none"><IslamicStar size={18} color={GOLD} opacity={0.09} /></div>

      {/* Centred text block */}
      <div className="flex-1 flex items-center justify-center px-10 py-12">
        {page.text ? (
          <p
            className="leading-[1.85] text-left"
            style={{
              fontFamily: ts.fontFamily,
              color: ts.color,
              fontSize: "clamp(1.05rem, 2.6vw, 1.45rem)",
            }}
          >
            {firstChar && <DropCap char={firstChar} color={TEAL} font={ts.fontFamily} />}
            {rest}
          </p>
        ) : (
          <div className="opacity-15 flex items-center justify-center w-full h-full">
            <BookOpen className="w-12 h-12" style={{ color: TEAL }} />
          </div>
        )}
      </div>

      {/* Thin gold bottom rule + page number */}
      <div className="px-10 pb-6 shrink-0">
        <div className="mb-3"><GoldDivider /></div>
        {pageNum > 0 && (
          <p className="text-center text-[10px] italic" style={{ color: `${TEAL}50`, fontFamily: "'Georgia', serif" }}>
            {pageNum}
          </p>
        )}
      </div>
    </div>
  );
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
  projectId,
  spreadSide,
}: SinglePageProps) {
  // ── Text style from persisted store (set by canvas editor) ──────────────────
  const stored = useBookTextStyleStore((s) =>
    projectId ? s.getStyle(projectId) : DEFAULT_STYLE,
  );
  const ts: TextStyle = {
    fontFamily: stored.fontFamily ? `'${stored.fontFamily}', sans-serif` : "'Baloo 2', cursive",
    color:      stored.textColor || "#1a1a1a",
  };
  if (isBlank) {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{ background: "linear-gradient(to right, #F5F3EF, #FAF8F4)", borderLeft: "1px solid rgba(0,0,0,0.05)" }}
      />
    );
  }

  // ── Split-spread mode: image_left_text_right ───────────────────────────────
  if (spreadSide === "image") {
    return <div className={cn("w-full h-full", className)}><ImageOnlyPage page={page} /></div>;
  }
  if (spreadSide === "text") {
    return <div className={cn("w-full h-full", className)}><TextOnlyPage page={page} pageNum={pageNum} ts={ts} /></div>;
  }

  const layout = (() => {
    switch (page.type) {
      case "front-cover":    return <FrontCoverLayout page={page} ts={ts} />;
      case "chapter-opener": return <ChapterOpenerLayout page={page} ts={ts} />;
      case "chapter-moment": return <ChapterMomentLayout page={page} pageNum={pageNum} ts={ts} />;
      case "back-cover":     return <BackCoverLayout page={page} ts={ts} />;

      case "spread": {
        const lt = (preferredLayout && PICTURE_LAYOUTS.has(preferredLayout)
          ? preferredLayout : page.layoutType) ?? "full_bleed";
        if (lt === "image_left_text_right") return <ImageLeftTextRightLayout page={page} pageNum={pageNum} ts={ts} />;
        if (lt === "image_top_text_bottom") return <ImageTopTextBottomLayout page={page} pageNum={pageNum} ts={ts} />;
        if (lt === "vignette")              return <VignetteLayout page={page} pageNum={pageNum} ts={ts} />;
        return <FullBleedLayout page={page} pageNum={pageNum} ts={ts} />;
      }

      case "text-page": {
        const lt = (preferredLayout && CHAPTER_LAYOUTS.has(preferredLayout)
          ? preferredLayout : page.layoutType) ?? "two_column";
        if (lt === "text_inline_image")    return <TextInlineImageLayout page={page} bookTitle={bookTitle} pageNum={pageNum} ts={ts} />;
        if (lt === "decorative_full_text") return <DecorativeFullTextLayout page={page} bookTitle={bookTitle} pageNum={pageNum} ts={ts} />;
        return <TwoColumnLayout page={page} bookTitle={bookTitle} pageNum={pageNum} ts={ts} />;
      }

      default: return <FullBleedLayout page={page} pageNum={pageNum} ts={ts} />;
    }
  })();

  return <div className={cn("w-full h-full", className)}>{layout}</div>;
}
