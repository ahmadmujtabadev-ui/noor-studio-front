import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProjects } from "@/hooks/useProjects";
import { characterTemplatesApi, type CharacterTemplate } from "@/lib/api/characterTemplates.api";
import type { Project } from "@/lib/api/types";

/* ─── CSS injected once ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --teal:#1B6B5A;--teal-d:#0F4A3E;--teal-l:#E8F5F1;--teal-xd:#063D2F;
  --gold:#F5A623;--gold-l:#FFF8EB;--gold-h:#E09510;
  --coral:#E8725C;--coral-l:#FFF0ED;
  --slate:#2D3748;--slate-l:#718096;--slate-xl:#A0AEC0;
  --cream:#FAFAF8;--white:#FFF;--border:#E8ECE9;
  --sh-sm:0 1px 3px rgba(27,107,90,.05);
  --sh-md:0 4px 20px rgba(27,107,90,.07);
  --sh-lg:0 16px 48px rgba(27,107,90,.09);
  --sh-xl:0 32px 64px rgba(27,107,90,.12);
  --r:12px;--rlg:20px;--rxl:32px;--mx:1180px;
}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;color:var(--slate);background:var(--cream);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* Reveal animations */
.ns-rv{opacity:0;transform:translateY(36px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
.ns-rv.vis{opacity:1;transform:translateY(0)}
.ns-d1{transition-delay:.1s}.ns-d2{transition-delay:.2s}.ns-d3{transition-delay:.25s}.ns-d4{transition-delay:.35s}

/* ─── NAV ─── */
.ns-nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.94);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.04);transition:box-shadow .3s}
.ns-nav.scrolled{box-shadow:var(--sh-md)}
.ns-ni{max-width:var(--mx);margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:68px}
.ns-logo{font-family:'Outfit';font-weight:800;font-size:22px;color:var(--teal);text-decoration:none;display:flex;align-items:center;gap:8px}
.ns-nk{display:flex;align-items:center;gap:28px;list-style:none}
.ns-nk a{text-decoration:none;color:var(--slate-l);font-weight:500;font-size:14px;transition:color .2s}
.ns-nk a:hover{color:var(--teal)}
.ns-bp{display:inline-flex;align-items:center;gap:8px;background:var(--coral);color:var(--white);font-weight:700;font-size:14px;padding:10px 24px;border-radius:10px;border:none;cursor:pointer;text-decoration:none;transition:all .2s}
.ns-bp:hover{background:#D4614D;transform:translateY(-1px)}
.ns-bplg{padding:14px 32px;font-size:16px;border-radius:12px}
.ns-bs{display:inline-flex;align-items:center;gap:8px;background:var(--white);color:var(--slate);font-weight:600;font-size:14px;padding:10px 24px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;text-decoration:none;transition:all .2s}
.ns-bs:hover{border-color:var(--teal);color:var(--teal)}
.ns-mt{display:none;background:0;border:0;cursor:pointer;padding:8px}
.ns-mt span{display:block;width:22px;height:2px;background:var(--teal);margin:5px 0;border-radius:2px}
.ns-mm{display:none;position:fixed;top:68px;left:0;right:0;background:var(--white);padding:20px 28px;box-shadow:var(--sh-lg);z-index:99}
.ns-mm.open{display:block}
.ns-mm a{display:block;padding:12px 0;color:var(--slate);text-decoration:none;font-weight:500;border-bottom:1px solid var(--border)}

/* ─── SECTION HELPERS ─── */
.ns-sec-label{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--teal);background:var(--teal-l);padding:5px 14px;border-radius:100px;margin-bottom:16px}
.ns-sec-title{font-family:'Outfit';font-weight:800;font-size:clamp(30px,4.2vw,52px);color:var(--teal-xd);line-height:1.12;letter-spacing:-.5px}
.ns-sec-sub{font-size:17px;color:var(--slate-l);line-height:1.7;max-width:580px;margin-top:14px}
.ns-sec-center{text-align:center}.ns-sec-center .ns-sec-sub{margin-left:auto;margin-right:auto}

/* ─── HERO ─── */
.ns-hero{padding:60px 28px 0;position:relative;overflow:hidden;background:linear-gradient(180deg,var(--white) 0%,var(--teal-l) 100%)}
.ns-hero-geo{position:absolute;top:0;right:0;width:600px;height:600px;opacity:.04;pointer-events:none}
.ns-hero-in{max-width:var(--mx);margin:0 auto;text-align:center;position:relative;z-index:1}
.ns-hero h1{font-family:'Outfit';font-weight:800;font-size:clamp(40px,6.5vw,76px);color:var(--teal-xd);line-height:1.07;letter-spacing:-2px;margin-bottom:20px;max-width:820px;margin-left:auto;margin-right:auto}
.ns-hero h1 span{color:var(--coral)}
.ns-hero-sub{font-size:19px;color:var(--slate-l);line-height:1.7;max-width:580px;margin:0 auto 36px}
.ns-hero-actions{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-bottom:56px}
.ns-hero-showcase{max-width:1000px;margin:0 auto;position:relative}
.ns-hero-chars{display:flex;justify-content:center;gap:14px;margin-bottom:24px}
.ns-hero-chars .char{width:96px;height:96px;border-radius:20px;overflow:hidden;border:3px solid var(--white);box-shadow:var(--sh-lg);background:var(--teal-l);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--teal);transition:transform .3s;cursor:default}
.ns-hero-chars .char:hover{transform:translateY(-5px) scale(1.08)}
.ns-hero-chars .char img{width:100%;height:100%;object-fit:cover}
.ns-chars-label,.ns-books-label{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--slate-xl);margin-bottom:12px}
.ns-hero-books{display:flex;justify-content:center;gap:12px;padding-bottom:24px;overflow-x:auto;scrollbar-width:none}
.ns-hero-books::-webkit-scrollbar{display:none}
.ns-hb{flex:0 0 auto;width:150px;height:210px;border-radius:var(--r);overflow:hidden;box-shadow:var(--sh-xl);background:var(--teal);transition:transform .3s;position:relative;cursor:pointer}
.ns-hb:hover{transform:translateY(-8px) scale(1.04)}
.ns-hb img{width:100%;height:100%;object-fit:cover}
.ns-hb::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.5) 100%);pointer-events:none}
.ns-hb-title{position:absolute;bottom:10px;left:8px;right:8px;z-index:2;font-size:10px;font-weight:700;color:var(--white);line-height:1.3}
.ns-hero-dots{display:flex;justify-content:flex-end;gap:6px;max-width:900px;margin:0 auto 12px;padding-right:8px}
.ns-hero-dot{width:8px;height:8px;border-radius:50%}
.ns-hero-dot:nth-child(1){background:var(--teal)}
.ns-hero-dot:nth-child(2){background:var(--coral)}
.ns-hero-dot:nth-child(3){background:var(--gold)}

/* ─── STATS ─── */
.ns-stats{padding:32px 28px;background:var(--white);border-bottom:1px solid var(--border)}
.ns-stats-in{max-width:var(--mx);margin:0 auto;display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap}
.ns-stat{text-align:center}
.ns-stat-num{font-family:'Outfit';font-weight:800;font-size:38px;color:var(--teal-xd)}
.ns-stat-label{font-size:12px;color:var(--slate-l);font-weight:500}

/* ─── THREE STEPS ─── */
.ns-steps-sec{padding:80px 28px;background:var(--cream)}
.ns-steps-in{max-width:var(--mx);margin:0 auto}
.ns-steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.ns-step-card{background:var(--white);border:1px solid var(--border);border-radius:var(--rlg);padding:32px 24px;transition:transform .3s,box-shadow .3s}
.ns-step-card:hover{transform:translateY(-4px);box-shadow:var(--sh-md)}
.ns-step-icon{width:44px;height:44px;border-radius:12px;background:var(--teal-l);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.ns-step-card:nth-child(2) .ns-step-icon{background:var(--coral-l)}
.ns-step-card:nth-child(3) .ns-step-icon{background:var(--gold-l)}
.ns-step-card h3{font-family:'Outfit';font-weight:700;font-size:18px;color:var(--teal-xd);margin-bottom:8px}
.ns-step-card p{font-size:14px;color:var(--slate-l);line-height:1.6}

/* ─── SHOWCASE ─── */
.ns-showcase{padding:80px 28px;background:var(--white)}
.ns-showcase-in{max-width:var(--mx);margin:0 auto}
.ns-char-row-label{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--teal);margin-bottom:16px;margin-top:40px}
.ns-char-row{display:flex;gap:20px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none}
.ns-char-row::-webkit-scrollbar{display:none}
.ns-char-item{flex:0 0 auto;text-align:center;width:120px}
.ns-char-avatar{width:108px;height:108px;border-radius:22px;overflow:hidden;margin:0 auto 10px;box-shadow:var(--sh-md);background:linear-gradient(135deg,var(--teal-l),var(--gold-l));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:var(--teal);transition:transform .3s;cursor:default}
.ns-char-avatar img{width:100%;height:100%;object-fit:cover}
.ns-char-avatar:hover{transform:scale(1.08) translateY(-3px)}
.ns-char-name{font-weight:700;font-size:13px;color:var(--slate)}
.ns-char-age{font-size:11px;color:var(--slate-l)}
.ns-books-row{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px;scrollbar-width:none}
.ns-books-row::-webkit-scrollbar{display:none}
.ns-book-item{flex:0 0 auto;width:170px;cursor:pointer;transition:transform .3s}
.ns-book-item:hover{transform:translateY(-8px)}
.ns-book-img{width:170px;height:230px;border-radius:var(--rlg);overflow:hidden;box-shadow:var(--sh-lg);position:relative;background:linear-gradient(135deg,var(--teal) 0%,var(--teal-d) 100%)}
.ns-book-img img{width:100%;height:100%;object-fit:cover}
.ns-book-img::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.4) 100%)}
.ns-book-info{margin-top:8px}
.ns-book-title{font-weight:700;font-size:12px;color:var(--slate);line-height:1.3}
.ns-book-meta{font-size:11px;color:var(--slate-l);margin-top:2px}
.ns-consistency{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.ns-con-box{background:var(--cream);border:1px solid var(--border);border-radius:var(--rlg);padding:24px}
.ns-con-label{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;display:flex;align-items:center;gap:6px;margin-bottom:16px}
.ns-con-label.bad{color:var(--coral)}
.ns-con-label.good{color:var(--teal)}
.ns-con-faces{display:flex;gap:8px}
.ns-con-face{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px}
.ns-con-box:first-child .ns-con-face{background:rgba(232,114,92,.1)}
.ns-con-box:last-child .ns-con-face{background:var(--teal-l)}

/* ─── STRUCTURES ─── */
.ns-structures{padding:80px 28px;background:var(--cream)}
.ns-struct-in{max-width:var(--mx);margin:0 auto}
.ns-struct-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:40px}
.ns-struct-card{background:var(--white);border:1px solid var(--border);border-radius:var(--rlg);padding:24px 20px;transition:transform .3s,box-shadow .3s}
.ns-struct-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.ns-struct-icon{font-size:28px;margin-bottom:12px}
.ns-struct-card h3{font-family:'Outfit';font-weight:700;font-size:15px;color:var(--teal-xd);margin-bottom:6px}
.ns-struct-card p{font-size:13px;color:var(--slate-l);line-height:1.5;margin-bottom:12px}
.ns-struct-tag{display:inline-block;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;background:var(--teal-l);color:var(--teal);cursor:pointer}

/* ─── VALUES ─── */
.ns-values{padding:80px 28px;background:var(--teal);color:var(--white);position:relative;overflow:hidden}
.ns-values::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(255,255,255,.04)' stroke-width='1'/%3E%3C/svg%3E") repeat;pointer-events:none}
.ns-values-in{max-width:var(--mx);margin:0 auto;position:relative;z-index:1}
.ns-values .ns-sec-label{background:rgba(255,255,255,.12);color:var(--white)}
.ns-values .ns-sec-title{color:var(--white)}
.ns-values .ns-sec-sub{color:rgba(255,255,255,.75)}
.ns-values-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:40px}
.ns-val-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:var(--rlg);padding:24px 20px;backdrop-filter:blur(8px);transition:transform .3s,background .3s}
.ns-val-card:hover{transform:translateY(-3px);background:rgba(255,255,255,.14)}
.ns-val-icon{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
.ns-val-card h3{font-family:'Outfit';font-weight:700;font-size:15px;margin-bottom:6px}
.ns-val-card p{font-size:13px;line-height:1.5;opacity:.75}

/* ─── PRICING ─── */
.ns-pricing{padding:80px 28px;background:var(--cream)}
.ns-pricing-in{max-width:var(--mx);margin:0 auto}
.ns-pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px;max-width:900px;margin-left:auto;margin-right:auto}
.ns-price-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--rlg);padding:32px 24px;text-align:center;transition:transform .3s,box-shadow .3s;position:relative}
.ns-price-card:hover{transform:translateY(-4px);box-shadow:var(--sh-lg)}
.ns-price-card.pop{border-color:var(--teal);box-shadow:var(--sh-lg)}
.ns-price-card.pop::before{content:'MOST POPULAR';position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--teal);color:var(--white);font-size:10px;font-weight:800;letter-spacing:1px;padding:4px 14px;border-radius:100px}
.ns-price-name{font-family:'Outfit';font-weight:700;font-size:16px;color:var(--slate-l);margin-bottom:8px}
.ns-price-amt{font-family:'Outfit';font-weight:800;font-size:42px;color:var(--teal-xd);line-height:1}
.ns-price-amt span{font-size:14px;font-weight:500;color:var(--slate-l)}
.ns-price-desc{font-size:13px;color:var(--slate-l);margin:12px 0 20px}
.ns-price-features{list-style:none;text-align:left;margin-bottom:24px}
.ns-price-features li{font-size:13px;color:var(--slate);padding:6px 0;display:flex;align-items:flex-start;gap:8px;border-bottom:1px solid var(--border)}
.ns-price-features li:last-child{border:0}
.ns-price-features li::before{content:'✓';color:var(--teal);font-weight:700;flex-shrink:0}
.ns-bp-full{width:100%;justify-content:center}
.ns-bp-outline{background:var(--white);color:var(--teal);border:1.5px solid var(--teal)}
.ns-bp-outline:hover{background:var(--teal-l);transform:none}
.ns-price-note{text-align:center;margin-top:20px;font-size:13px;color:var(--slate-l)}

/* ─── FAQ ─── */
.ns-faq{padding:80px 28px;background:var(--white)}
.ns-faq-in{max-width:700px;margin:0 auto}
.ns-faq-item{border-bottom:1px solid var(--border);overflow:hidden}
.ns-faq-q{padding:18px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px;color:var(--slate);transition:color .2s;background:none;border:none;width:100%;text-align:left}
.ns-faq-q:hover{color:var(--teal)}
.ns-faq-icon{font-size:22px;font-weight:300;color:var(--slate-l);transition:transform .3s;flex-shrink:0}
.ns-faq-icon.open{transform:rotate(45deg)}
.ns-faq-a{overflow:hidden;transition:max-height .4s ease,padding .4s ease}
.ns-faq-a p{font-size:14px;color:var(--slate-l);line-height:1.65;padding-bottom:16px}

/* ─── FINAL CTA ─── */
.ns-final{padding:80px 28px;background:var(--teal);color:var(--white);text-align:center;position:relative;overflow:hidden}
.ns-final::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='rgba(255,255,255,.03)' stroke-width='1'/%3E%3C/svg%3E") repeat;pointer-events:none}
.ns-final-in{max-width:600px;margin:0 auto;position:relative;z-index:1}
.ns-final-icon{font-size:40px;margin-bottom:16px}
.ns-final h2{font-family:'Outfit';font-weight:800;font-size:clamp(24px,3.5vw,36px);margin-bottom:12px}
.ns-final p{font-size:16px;opacity:.8;margin-bottom:28px}
.ns-final-btns{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.ns-bs-white{background:transparent;color:var(--white);border:1.5px solid rgba(255,255,255,.4)}
.ns-bs-white:hover{background:rgba(255,255,255,.1);border-color:var(--white);color:var(--white)}

/* ─── FOOTER ─── */
.ns-footer{background:var(--white);border-top:1px solid var(--border);padding:48px 28px 24px}
.ns-footer-in{max-width:var(--mx);margin:0 auto;display:flex;justify-content:space-between;gap:40px;flex-wrap:wrap}
.ns-footer-brand{max-width:240px}
.ns-flogo{font-family:'Outfit';font-weight:800;font-size:20px;color:var(--teal);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.ns-footer-brand p{font-size:13px;color:var(--slate-l);line-height:1.5;margin-bottom:12px}
.ns-footer-socials{display:flex;gap:8px}
.ns-footer-socials a{width:32px;height:32px;border-radius:8px;background:var(--teal-l);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:background .2s;font-size:13px}
.ns-footer-socials a:hover{background:var(--teal);color:var(--white)}
.ns-footer-links{display:flex;gap:48px}
.ns-footer-col h4{font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--teal);margin-bottom:12px}
.ns-footer-col a{display:block;text-decoration:none;color:var(--slate-l);font-size:13px;margin-bottom:8px;transition:color .2s}
.ns-footer-col a:hover{color:var(--coral)}
.ns-footer-btm{max-width:var(--mx);margin:24px auto 0;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;font-size:12px;color:var(--slate-xl);flex-wrap:wrap;gap:8px}

/* ─── RESPONSIVE ─── */
@media(max-width:1024px){
  .ns-steps-grid{grid-template-columns:1fr}
  .ns-struct-grid,.ns-values-grid{grid-template-columns:1fr 1fr}
  .ns-pricing-grid{grid-template-columns:1fr;max-width:380px}
  .ns-consistency{grid-template-columns:1fr}
}
@media(max-width:768px){
  .ns-nk{display:none}.ns-mt{display:block}
  .ns-hero{padding:32px 20px 0}
  .ns-steps-sec,.ns-showcase,.ns-structures,.ns-values,.ns-pricing,.ns-faq,.ns-final{padding:60px 20px}
  .ns-struct-grid,.ns-values-grid{grid-template-columns:1fr}
  .ns-stats-in{gap:24px}
  .ns-footer-in{flex-direction:column}
  .ns-footer-links{gap:32px;flex-wrap:wrap}
  .ns-footer-btm{flex-direction:column;text-align:center}
}
`;

/* ─── Fallback static data (shown when not logged in / no data yet) ─── */
const FALLBACK_CHARS = [
  { name: "Ahmed",  age: "Age 6",  initials: "A", color: "#1B6B5A" },
  { name: "Fatima", age: "Age 8",  initials: "F", color: "#E8725C" },
  { name: "Yusuf",  age: "Age 5",  initials: "Y", color: "#F5A623" },
  { name: "Amira",  age: "Age 7",  initials: "Am", color: "#1B6B5A" },
  { name: "Khalid", age: "Age 10", initials: "K", color: "#0F4A3E" },
  { name: "Mariam", age: "Age 4",  initials: "M", color: "#E8725C" },
];

const FALLBACK_BOOKS = [
  { title: "Ahmed's Ramadan Journey",   meta: "Ages 4-6 · 24 pages", color: "#1B6B5A" },
  { title: "The Honest Friend",         meta: "Ages 6-8 · 32 pages", color: "#0F4A3E" },
  { title: "Learning to Pray",          meta: "Ages 4-6 · 20 pages", color: "#E8725C" },
  { title: "Khalid & the Golden Rule",  meta: "Ages 8-10 · 40 pages", color: "#F5A623" },
  { title: "Prophet Yusuf's Story",     meta: "Ages 6-8 · 28 pages", color: "#1B6B5A" },
  { title: "My Eid Celebration",        meta: "Ages 2-4 · 16 pages", color: "#E8725C" },
];

/* (real data loaded inside the component via hooks) */

const structures = [
  { icon: "🌙", title: "Middle-Grade Adventure", desc: "Hero's journey with Islamic moral framework. Ages 8-12." },
  { icon: "📖", title: "Classic Islamic Story", desc: "Prophet stories and companion narratives. Ages 4-8." },
  { icon: "🤲", title: "Dua & Ibadah Guide", desc: "Daily routines with Arabic text and transliteration. Ages 2-6." },
  { icon: "🎭", title: "Character Snapshot", desc: "Short akhlaq stories around a single moral lesson. Ages 4-8." },
];

const values = [
  { icon: "🕌", title: "Scholarly Framework", desc: "Content guidelines reviewed by Islamic educators and scholars." },
  { icon: "📚", title: "Authentic Sources", desc: "Quranic ayat, authentic hadith, and verified seerah references." },
  { icon: "👨‍👩‍👧‍👦", title: "Family-First Design", desc: "Safe, wholesome content. No faces for prophets. Gender-appropriate art." },
  { icon: "🌍", title: "Diverse Ummah", desc: "Characters reflecting the full diversity of the global Muslim community." },
];

const pricing = [
  {
    name: "Creator", price: "$29", desc: "For families getting started",
    features: ["5 books per month", "10 character designs", "Standard export (PDF)", "Email support"],
    popular: false,
  },
  {
    name: "Author", price: "$79", desc: "For serious creators",
    features: ["Unlimited books", "Unlimited characters", "KDP-ready export", "Priority support", "Commercial license"],
    popular: true,
  },
  {
    name: "Studio", price: "$199", desc: "For publishers & schools",
    features: ["Everything in Author", "Team collaboration", "Bulk export tools", "API access", "Dedicated support"],
    popular: false,
  },
];

const faqs = [
  { q: "How does character consistency work?", a: "NoorStudio uses a proprietary AI model that locks in your character's visual features — face shape, skin tone, hair, clothing — and maintains them across every illustration in your book." },
  { q: "What age groups do you support?", a: "We support ages 2-14 with templates optimized for toddlers (2-4), early readers (4-6), young readers (6-8), chapter books (8-10), and middle grade (10-14)." },
  { q: "What export formats are available?", a: "Export as KDP-ready PDF (with proper bleed, margins, and CMYK), standard PDF, EPUB, or order printed hardcovers directly through our print partner." },
  { q: "Can I sell the books I create?", a: "Yes! Author and Studio plans include a commercial license. You can publish on Amazon KDP, sell on your own website, or distribute through bookstores." },
  { q: "How is the Islamic content reviewed?", a: "Our content framework is built with input from Islamic educators and scholars. The AI follows guidelines for accurate Quranic references, authentic hadith, and culturally respectful illustrations." },
];

/* ─── Logo SVG ─── */
function LogoSvg() {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={28} height={28}>
      <circle cx="16" cy="16" r="14" fill="#1B6B5A" />
      <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 2.5c1.5 0 2.7.6 3.6 1.5L16 16v-5.5z" fill="#fff" />
    </svg>
  );
}

/* ─── Main Component ─── */
/* ─── Helpers ─── */
function getProjectCoverUrl(p: Project): string {
  const c = p.artifacts?.cover;
  if (!c) return "";
  if (c.frontUrl) return c.frontUrl;
  const variants = (c as any).frontVariants ?? [];
  return variants[0]?.imageUrl || c.imageUrl || "";
}

const PALETTE = ["#1B6B5A", "#0F4A3E", "#E8725C", "#F5A623", "#063D2F", "#E8725C"];

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const styleInjected = useRef(false);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: templatesRaw } = useQuery({
    queryKey: ["character-templates-public"],
    queryFn:  () => characterTemplatesApi.list(),
    staleTime: 10 * 60 * 1000,
  });
  const { data: projectsRaw } = useProjects({ limit: 12 });

  const templateChars: CharacterTemplate[] = useMemo(() => {
    const list = (templatesRaw as any) ?? [];
    return Array.isArray(list) ? list.slice(0, 8) : [];
  }, [templatesRaw]);

  const realProjects: Project[] = useMemo(() => {
    const list = (projectsRaw as any)?.projects ?? (projectsRaw as any) ?? [];
    return Array.isArray(list) ? list.slice(0, 8) : [];
  }, [projectsRaw]);

  /* Inject CSS once */
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  /* Scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((x) => { if (x.isIntersecting) x.target.classList.add("vis"); }),
      { threshold: 0.06, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".ns-rv").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* Nav scroll */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Smooth scroll helper */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth" }); }
    setMobileOpen(false);
  };

  return (
    <>
      {/* ─── NAV ─── */}
      <nav className={`ns-nav${scrolled ? " scrolled" : ""}`}>
        <div className="ns-ni">
          <a href="#" className="ns-logo"><LogoSvg /> NoorStudio</a>
          <ul className="ns-nk">
            {[["showcase", "Library"], ["features", "Features"], ["pricing", "Pricing"], ["values", "About"], ["faq", "FAQ"]].map(([id, label]) => (
              <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>{label}</a></li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/auth" style={{ textDecoration: "none", color: "var(--slate-l)", fontSize: 14, fontWeight: 500 }} onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Log in</a>
            <a href="/auth" className="ns-bp" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Start Creating</a>
          </div>
          <button className="ns-mt" aria-label="Menu" onClick={() => setMobileOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <div className={`ns-mm${mobileOpen ? " open" : ""}`}>
        {[["showcase", "Library"], ["features", "Features"], ["pricing", "Pricing"], ["values", "About"], ["faq", "FAQ"]].map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>{label}</a>
        ))}
        <a href="/auth" style={{ color: "var(--coral)", fontWeight: 700 }} onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Start Creating →</a>
      </div>

      {/* ─── HERO ─── */}
      <section className="ns-hero">
        <svg className="ns-hero-geo" viewBox="0 0 400 400">
          <defs><pattern id="geo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="#1B6B5A" strokeWidth=".5" /></pattern></defs>
          <rect width="400" height="400" fill="url(#geo)" />
        </svg>
        <div className="ns-hero-in">
          <div className="ns-sec-label ns-rv">✨ AI-Powered Islamic Book Creator</div>
          <h1 className="ns-rv ns-d1">Beautiful Islamic books, <span>consistent</span> characters — built by AI.</h1>
          <p className="ns-hero-sub ns-rv ns-d2">Design cinema-quality characters, generate age-appropriate Islamic stories, and publish KDP-ready books — all with AI. Every character stays consistent across every single page.</p>
          <div className="ns-hero-actions ns-rv ns-d3">
            <a href="/auth" className="ns-bp ns-bplg" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Start Creating</a>
            <a href="#showcase" className="ns-bs" onClick={(e) => { e.preventDefault(); scrollTo("showcase"); }}>View Examples</a>
          </div>

          <div className="ns-hero-showcase ns-rv ns-d3">
            <div className="ns-hero-dots">
              <div className="ns-hero-dot" /><div className="ns-hero-dot" /><div className="ns-hero-dot" />
            </div>
            <div className="ns-chars-label">
              {templateChars.length > 0 ? "Featured Characters" : "Featured Characters"}
            </div>
            <div className="ns-hero-chars">
              {(templateChars.length > 0 ? templateChars : FALLBACK_CHARS).map((c: any, i: number) => {
                const name    = c.name ?? "Character";
                const imgUrl  = c.thumbnailUrl ?? c.imageUrl ?? "";
                const initial = name.charAt(0).toUpperCase();
                const bg      = PALETTE[i % PALETTE.length];
                return (
                  <div key={name + i} className="char" title={name + (c.ageRange ? ` · ${c.ageRange}` : "")}>
                    {imgUrl
                      ? <img src={imgUrl} alt={name} loading="lazy" />
                      : <span style={{ fontSize: 28, fontWeight: 800, color: bg, fontFamily: "'Outfit', sans-serif" }}>{initial}</span>
                    }
                  </div>
                );
              })}
            </div>
            <div className="ns-books-label" style={{ marginTop: 24 }}>
              {realProjects.length > 0 ? "Your Books" : "Example Books"}
            </div>
            <div className="ns-hero-books">
              {(realProjects.length > 0 ? realProjects : FALLBACK_BOOKS).map((item: any, i: number) => {
                const title  = item.title ?? "Untitled";
                const imgUrl = item.artifacts ? getProjectCoverUrl(item as Project) : "";
                const bg     = PALETTE[i % PALETTE.length];
                return (
                  <div key={title + i} className="ns-hb" style={!imgUrl ? { background: bg } : {}}>
                    {imgUrl
                      ? <img src={imgUrl} alt={title} loading="lazy" />
                      : <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"8px", textAlign:"center", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", lineHeight:1.3 }}>{title}</span>
                    }
                    <div className="ns-hb-title">{title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <div className="ns-stats">
        <div className="ns-stats-in ns-rv">
          {[["12,500+", "Books Created"], ["3,200+", "Active Creators"], ["50,000+", "Characters Generated"]].map(([num, label]) => (
            <div key={label} className="ns-stat">
              <div className="ns-stat-num">{num}</div>
              <div className="ns-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── THREE STEPS ─── */}
      <section className="ns-steps-sec" id="features">
        <div className="ns-steps-in">
          <div className="ns-sec-center ns-rv">
            <div className="ns-sec-label">How it works</div>
            <div className="ns-sec-title">Three steps to published</div>
            <div className="ns-sec-sub">From character creation to a published KDP-ready book in minutes, not months.</div>
          </div>
          <div className="ns-steps-grid">
            {[
              { icon: "🎨", title: "Create Characters", desc: "Design unique, beautifully-rendered characters with consistent features. Define their look, age, personality, and cultural details — they'll stay the same on every page.", delay: "ns-d1" },
              { icon: "📖", title: "Build Your Book", desc: "Choose from proven Islamic story structures or write your own. AI generates age-appropriate text with Quranic references, hadith, and moral lessons.", delay: "ns-d2" },
              { icon: "🚀", title: "Export & Publish", desc: "Download KDP-ready PDFs with proper bleed, margins, and CMYK profiles. Publish on Amazon, order hardcovers, or share digitally.", delay: "ns-d3" },
            ].map((s) => (
              <div key={s.title} className={`ns-step-card ns-rv ${s.delay}`}>
                <div className="ns-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHOWCASE ─── */}
      <section className="ns-showcase" id="showcase">
        <div className="ns-showcase-in">
          <div className="ns-sec-center ns-rv">
            <div className="ns-sec-label">Showcase</div>
            <div className="ns-sec-title">Beautiful books, consistent characters</div>
            <div className="ns-sec-sub">Every character maintains their unique look across every page and every book. No more mismatched AI art.</div>
          </div>

          <div className="ns-char-row-label ns-rv">
            Featured Characters
          </div>
          <div className="ns-char-row ns-rv">
            {(templateChars.length > 0 ? templateChars : FALLBACK_CHARS).map((c: any, i: number) => {
              const name   = c.name ?? "Character";
              const age    = c.ageRange ?? c.age ?? "";
              const imgUrl = c.thumbnailUrl ?? c.imageUrl ?? "";
              const bg     = PALETTE[i % PALETTE.length];
              return (
                <div key={name + i} className="ns-char-item">
                  <div className="ns-char-avatar" style={!imgUrl ? { background: `linear-gradient(135deg, ${bg}22, ${bg}11)`, border: `2px solid ${bg}30` } : {}}>
                    {imgUrl
                      ? <img src={imgUrl} alt={name} loading="lazy" />
                      : <span style={{ color: bg, fontSize: 32, fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>{name.charAt(0)}</span>
                    }
                  </div>
                  <div className="ns-char-name">{name}</div>
                  <div className="ns-char-age">{age}</div>
                </div>
              );
            })}
          </div>

          <div className="ns-char-row-label ns-rv" style={{ marginTop: 40 }}>
            {realProjects.length > 0 ? "Your Books" : "Example Books"}
          </div>
          <div className="ns-books-row ns-rv">
            {(realProjects.length > 0 ? realProjects : FALLBACK_BOOKS).map((item: any, i: number) => {
              const title  = item.title ?? "Untitled";
              const meta   = item.meta ?? (item.ageRange ? `Ages ${item.ageRange}` : "");
              const imgUrl = item.artifacts ? getProjectCoverUrl(item as Project) : "";
              const bg     = PALETTE[i % PALETTE.length];
              return (
                <div key={title + i} className="ns-book-item">
                  <div className="ns-book-img" style={!imgUrl ? { background: `linear-gradient(160deg, ${bg} 0%, ${bg}cc 100%)` } : {}}>
                    {imgUrl
                      ? <img src={imgUrl} alt={title} loading="lazy" />
                      : <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px", textAlign:"center", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)", lineHeight:1.4 }}>{title}</span>
                    }
                  </div>
                  <div className="ns-book-info">
                    <div className="ns-book-title">{title}</div>
                    <div className="ns-book-meta">{meta}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ns-consistency ns-rv">
            <div className="ns-con-box">
              <div className="ns-con-label bad">❌ Without NoorStudio</div>
              <div className="ns-con-faces">
                {["😕", "🙁", "😐", "😣"].map((e) => <div key={e} className="ns-con-face">{e}</div>)}
              </div>
              <p style={{ fontSize: 13, color: "var(--slate-l)", marginTop: 12 }}>Characters change style, proportions, and features on every page. Readers can't follow the story.</p>
            </div>
            <div className="ns-con-box">
              <div className="ns-con-label good">✓ With NoorStudio</div>
              <div className="ns-con-faces">
                {["😊", "😊", "😊", "😊"].map((e, i) => <div key={i} className="ns-con-face">{e}</div>)}
              </div>
              <p style={{ fontSize: 13, color: "var(--slate-l)", marginTop: 12 }}>Same character, every page. Consistent features, expressions, and style throughout your entire book.</p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }} className="ns-rv">
            <a href="/auth" className="ns-bp ns-bplg" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Start Creating</a>
          </div>
        </div>
      </section>

      {/* ─── STORY STRUCTURES ─── */}
      <section className="ns-structures">
        <div className="ns-struct-in">
          <div className="ns-sec-center ns-rv">
            <div className="ns-sec-label">Templates</div>
            <div className="ns-sec-title">Start with proven story structures</div>
            <div className="ns-sec-sub">Frameworks built by educators and Islamic scholars. Adapted for every age group.</div>
          </div>
          <div className="ns-struct-grid">
            {structures.map((s, i) => (
              <div key={s.title} className={`ns-struct-card ns-rv ns-d${i + 1}`}>
                <div className="ns-struct-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="ns-struct-tag">Use Template</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ISLAMIC VALUES ─── */}
      <section className="ns-values" id="values">
        <div className="ns-values-in">
          <div className="ns-sec-center ns-rv">
            <div className="ns-sec-label">Core Principles</div>
            <div className="ns-sec-title">Built with Islamic values in mind</div>
            <div className="ns-sec-sub">Every feature is designed with respect for Islamic traditions, scholarly review, and age-appropriate content.</div>
          </div>
          <div className="ns-values-grid">
            {values.map((v, i) => (
              <div key={v.title} className={`ns-val-card ns-rv ns-d${i + 1}`}>
                <div className="ns-val-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="ns-pricing" id="pricing">
        <div className="ns-pricing-in">
          <div className="ns-sec-center ns-rv">
            <div className="ns-sec-label">Pricing</div>
            <div className="ns-sec-title">Simple, transparent pricing</div>
            <div className="ns-sec-sub">Start free. Upgrade when you're ready to publish.</div>
          </div>
          <div className="ns-pricing-grid">
            {pricing.map((p, i) => (
              <div key={p.name} className={`ns-price-card${p.popular ? " pop" : ""} ns-rv ns-d${i + 1}`}>
                <div className="ns-price-name">{p.name}</div>
                <div className="ns-price-amt">{p.price}<span>/mo</span></div>
                <div className="ns-price-desc">{p.desc}</div>
                <ul className="ns-price-features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a
                  href="/auth"
                  className={`ns-bp ns-bp-full${!p.popular ? " ns-bp-outline" : ""}`}
                  onClick={(e) => { e.preventDefault(); navigate("/auth"); }}
                >
                  {p.popular ? "Start Free Trial" : p.name === "Studio" ? "Contact Sales" : "Get Started"}
                </a>
              </div>
            ))}
          </div>
          <div className="ns-price-note ns-rv">All plans include a 7-day free trial. No credit card required to start.</div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="ns-faq" id="faq">
        <div className="ns-faq-in">
          <div className="ns-sec-center ns-rv" style={{ marginBottom: 40 }}>
            <div className="ns-sec-label">FAQ</div>
            <div className="ns-sec-title">Frequently asked questions</div>
          </div>
          {faqs.map((f, i) => (
            <div key={i} className="ns-faq-item ns-rv">
              <button className="ns-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span className={`ns-faq-icon${openFaq === i ? " open" : ""}`}>+</span>
              </button>
              <div className="ns-faq-a" style={{ maxHeight: openFaq === i ? 200 : 0 }}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="ns-final" id="signup">
        <div className="ns-final-in ns-rv">
          <div className="ns-final-icon">✨</div>
          <h2>Ready to create your first character?</h2>
          <p>Join thousands of Muslim families creating beautiful Islamic books for their children.</p>
          <div className="ns-final-btns">
            <a href="/auth" className="ns-bp ns-bplg" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>Start Creating</a>
            <a href="#showcase" className="ns-bs ns-bs-white" onClick={(e) => { e.preventDefault(); scrollTo("showcase"); }}>Browse Examples</a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ns-footer">
        <div className="ns-footer-in">
          <div className="ns-footer-brand">
            <div className="ns-flogo"><LogoSvg /> NoorStudio</div>
            <p>AI-powered Islamic children's book creator. Consistent characters. Beautiful stories.</p>
            <div className="ns-footer-socials">
              <a href="#" title="Twitter">𝕏</a>
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="YouTube">▶</a>
              <a href="#" title="Discord">💬</a>
            </div>
          </div>
          <div className="ns-footer-links">
            <div className="ns-footer-col">
              <h4>Product</h4>
              {["Features", "Pricing", "Templates", "Changelog"].map((l) => <a key={l} href="#">{l}</a>)}
            </div>
            <div className="ns-footer-col">
              <h4>Resources</h4>
              {["Blog", "Tutorials", "Help Center"].map((l) => <a key={l} href="#">{l}</a>)}
            </div>
            <div className="ns-footer-col">
              <h4>Company</h4>
              {["About", "Contact", "Careers"].map((l) => <a key={l} href="#">{l}</a>)}
            </div>
            <div className="ns-footer-col">
              <h4>Legal</h4>
              {["Terms", "Privacy", "Cookies"].map((l) => <a key={l} href="#">{l}</a>)}
            </div>
          </div>
        </div>
        <div className="ns-footer-btm">
          <span>© 2026 NoorStudio. All rights reserved.</span>
          <span>Made with ♥ for the Muslim Ummah</span>
        </div>
      </footer>
    </>
  );
}