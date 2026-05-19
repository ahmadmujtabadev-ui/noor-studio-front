import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── inject once ─────────────────────────────────────────────────────────── */
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.hp *,.hp *::before,.hp *::after{margin:0;padding:0;box-sizing:border-box}
.hp{
  --green:#0B5C46;--green-deep:#0E4938;--green-soft:#E8F1EC;
  --cream:#FBF7EF;--cream-warm:#F4ECD8;--paper:#FFFFFF;
  --ink:#1B1A17;--ink-soft:#3A382F;--ink-mute:#6E6A5E;
  --line:rgba(27,26,23,.08);--line-strong:rgba(27,26,23,.14);
  --gold:#E8B340;--gold-deep:#C9A24F;--gold-soft:#F4E2A8;--rose:#C97863;
  --mono:'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace;
  --serif:'Source Serif 4','Times New Roman',Georgia,serif;
  --sh-sm:0 2px 6px rgba(7,59,45,.06);
  --sh-md:0 8px 24px -8px rgba(7,59,45,.15);
  --sh-lg:0 24px 60px -16px rgba(7,59,45,.22);
  --sh-cover:0 30px 60px -18px rgba(7,59,45,.35),0 12px 24px -10px rgba(7,59,45,.2),0 1px 0 rgba(255,255,255,.4) inset;
  --sh-portrait:0 40px 100px -28px rgba(7,59,45,.45),0 16px 36px -16px rgba(7,59,45,.22);
  font-family:'Inter',sans-serif;color:var(--ink);background:var(--cream);
  line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.hp-noise{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.32;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode:multiply}

/* ── NAV ── */
.hp-nav{position:sticky;top:0;z-index:50;background:rgba(251,247,239,.85);backdrop-filter:blur(20px) saturate(140%);border-bottom:1px solid var(--line)}
.hp-nav-in{max-width:1380px;margin:0 auto;padding:16px 40px;display:flex;align-items:center;justify-content:space-between}
.hp-logo{display:flex;align-items:center;text-decoration:none}
.hp-logo img{height:52px;width:auto;display:block}
.hp-nav-links{display:flex;gap:36px;list-style:none}
.hp-nav-links a{color:var(--ink-soft);text-decoration:none;font-size:14px;font-weight:500;position:relative;transition:color .2s}
.hp-nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--green);transition:width .25s}
.hp-nav-links a:hover{color:var(--green-deep)}
.hp-nav-links a:hover::after{width:100%}
.hp-nav-cta{display:flex;align-items:center;gap:18px}
.hp-nav-login{color:var(--ink-soft);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
.hp-nav-login:hover{color:var(--green-deep)}

/* ── BUTTONS ── */
.hp-btn{display:inline-flex;align-items:center;gap:8px;background:var(--green-deep);color:var(--cream);padding:11px 22px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid var(--green-deep);cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1)}
.hp-btn:hover{background:var(--ink);transform:translateY(-1px);box-shadow:0 8px 24px -8px rgba(7,59,45,.4)}
.hp-btn svg{transition:transform .25s}
.hp-btn:hover svg{transform:translateX(3px)}
.hp-btn.lg{padding:16px 28px;font-size:15px}
.hp-btn.xl{padding:18px 32px;font-size:16px}
.hp-ghost{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--green-deep);padding:11px 22px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid rgba(7,59,45,.18);cursor:pointer;transition:all .25s}
.hp-ghost:hover{background:rgba(7,59,45,.04);border-color:var(--green-deep)}
.hp-ghost.lg{padding:16px 24px;font-size:15px}
.hp-btn-white{background:var(--gold);color:var(--green-deep);border-color:var(--gold)}
.hp-btn-white:hover{background:var(--gold-soft);border-color:var(--gold-soft);transform:translateY(-1px)}
.hp-ghost-white{color:var(--cream);border-color:rgba(251,247,239,.3)}
.hp-ghost-white:hover{background:rgba(251,247,239,.06);border-color:var(--cream)}
.hp-btn-full{width:100%;justify-content:center}

/* ── HERO ── */
.hp-hero{position:relative;padding:56px 40px 60px;max-width:1380px;margin:0 auto;z-index:2}
.hp-hero-deco{position:absolute;top:-40px;right:-100px;width:620px;height:620px;pointer-events:none;opacity:.045;z-index:0}
.hp-hero-grid{display:grid;grid-template-columns:minmax(440px,.85fr) 1.15fr;gap:60px;align-items:center;position:relative;min-height:680px}
.hp-h1{font-family:var(--serif);font-weight:600;font-size:clamp(52px,6.4vw,96px);line-height:1;letter-spacing:-2.2px;color:var(--green-deep);margin-bottom:28px;animation:hp-fadeUp .9s cubic-bezier(.16,1,.3,1) .05s both}
.hp-h1 em{font-style:italic;font-weight:500}
.hp-headline-soft{display:block;color:var(--ink-mute);font-style:normal;font-weight:400;font-size:.4em;letter-spacing:.4px;margin-top:18px;opacity:1;font-family:var(--mono);text-transform:uppercase}
.hp-sub{font-size:18px;line-height:1.6;color:var(--ink-soft);max-width:480px;margin-bottom:36px;animation:hp-fadeUp 1s cubic-bezier(.16,1,.3,1) .2s both}
.hp-cta-row{display:flex;gap:12px;align-items:center;margin-bottom:36px;flex-wrap:wrap;animation:hp-fadeUp 1s cubic-bezier(.16,1,.3,1) .35s both}
.hp-play-dot{width:22px;height:22px;border-radius:50%;background:var(--green-deep);color:var(--cream);display:grid;place-items:center;font-size:8px}
.hp-proof{display:flex;align-items:center;gap:20px;flex-wrap:wrap;animation:hp-fadeUp 1s cubic-bezier(.16,1,.3,1) .5s both}
.hp-proof-item{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-mute);font-weight:500}
.hp-proof-item strong{color:var(--ink-soft);font-weight:700}
.hp-stars{display:inline-flex;gap:2px;color:var(--gold-deep);align-items:center}
.hp-stars svg{width:13px;height:13px;display:block}
.hp-proof-div{width:1px;height:16px;background:var(--line-strong)}
@keyframes hp-fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

/* ── STAGE ── */
.hp-stage{position:relative;height:720px;animation:hp-stageIn 1.2s cubic-bezier(.16,1,.3,1) .2s both}
@keyframes hp-stageIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.hp-stage-bg{position:absolute;inset:5% 5%;background:radial-gradient(ellipse 65% 50% at 50% 55%,rgba(232,217,180,.6),transparent 70%),radial-gradient(ellipse 45% 40% at 70% 30%,rgba(232,241,236,.7),transparent 65%);filter:blur(40px);z-index:0}
.hp-portrait{position:absolute;border-radius:36px;overflow:hidden;background:#FFF;box-shadow:var(--sh-portrait);transition:transform .6s cubic-bezier(.34,1.56,.64,1);cursor:pointer;z-index:2}
.hp-portrait img{width:100%;height:100%;display:block;object-fit:cover;transition:opacity .32s ease}
.hp-portrait::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 0 0 1px rgba(27,26,23,.04) inset;pointer-events:none}
.hp-p-main{top:50%;left:50%;width:440px;height:440px;transform:translate(-50%,-50%);z-index:5;animation:hp-floatMain 7s ease-in-out infinite}
@keyframes hp-floatMain{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,-53%)}}
.hp-p-sat{border-radius:28px}
.hp-p-tl{top:0%;left:-2%;width:170px;height:170px;animation:hp-floatA 6s ease-in-out infinite}
.hp-p-tr{top:6%;right:-3%;width:160px;height:160px;animation:hp-floatB 7s ease-in-out infinite;animation-delay:-1s}
.hp-p-bl{bottom:-2%;left:6%;width:180px;height:180px;animation:hp-floatB 8s ease-in-out infinite;animation-delay:-2s}
.hp-p-br{bottom:4%;right:-2%;width:165px;height:165px;animation:hp-floatA 6.5s ease-in-out infinite;animation-delay:-3s}
.hp-p-ml{top:42%;left:-5%;width:140px;height:140px;animation:hp-floatA 7.5s ease-in-out infinite;animation-delay:-1.5s;z-index:1}
@keyframes hp-floatA{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-16px) rotate(0deg)}}
@keyframes hp-floatB{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-14px) rotate(0deg)}}
.hp-portrait:hover{scale:1.05;z-index:10;animation-play-state:paused}
.hp-style-tag{position:absolute;top:62%;left:-2%;background:var(--paper);border:1px solid var(--line);padding:12px 18px;border-radius:16px;box-shadow:var(--sh-md);z-index:6;animation:hp-tagFloat 8s ease-in-out infinite;transform:rotate(-3deg)}
@keyframes hp-tagFloat{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(-2deg) translateY(-10px)}}
.hp-style-tag-row{display:flex;align-items:center;gap:8px;margin-bottom:3px}
.hp-style-tag-dot{width:8px;height:8px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 3px rgba(232,179,64,.2)}
.hp-style-tag-label{font-family:var(--mono);font-size:9.5px;color:var(--ink-mute);text-transform:uppercase;letter-spacing:1.6px;font-weight:500}
.hp-style-tag-name{font-family:var(--serif);font-size:17px;color:var(--green-deep);font-weight:600;letter-spacing:-.3px}
.hp-sparkle{position:absolute;color:var(--gold);pointer-events:none;animation:hp-twinkle 3s ease-in-out infinite;font-size:22px;z-index:1}
.hp-sp1{top:12%;left:35%;animation-delay:0s}
.hp-sp2{top:26%;right:18%;animation-delay:-1s;font-size:14px}
.hp-sp3{bottom:24%;left:24%;animation-delay:-2s;font-size:16px}
.hp-sp4{top:48%;right:8%;animation-delay:-.5s;font-size:12px}
@keyframes hp-twinkle{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}

/* ── SECTION HELPERS ── */
.hp-sec{position:relative;z-index:2}
.hp-eyebrow{display:inline-flex;align-items:center;font-family:var(--mono);font-size:10.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:var(--green);margin-bottom:18px;opacity:.75}
.hp-sec-title{font-family:var(--serif);font-weight:600;font-size:clamp(36px,4.4vw,58px);line-height:1.04;letter-spacing:-1.2px;color:var(--green-deep);margin-bottom:18px}
.hp-sec-title em{font-style:italic;font-weight:500}
.hp-sec-sub{font-size:18px;line-height:1.55;color:var(--ink-soft);max-width:600px}
.hp-sec-center{text-align:center;margin-bottom:64px}
.hp-sec-center .hp-sec-sub{margin-left:auto;margin-right:auto}
.hp-sec-center .hp-eyebrow{display:block;text-align:center}

/* ── SPECSTRIP ── */
.hp-specstrip{background:var(--green-deep);color:var(--cream);padding:26px 40px;position:relative;z-index:2}
.hp-specstrip-in{max-width:1380px;margin:0 auto;display:grid;grid-template-columns:minmax(200px,240px) 1fr auto;align-items:center;gap:36px}
.hp-specstrip-label{font-family:var(--serif);font-size:18px;font-weight:500;font-style:italic;letter-spacing:-.2px;color:var(--gold-soft)}
.hp-specstrip-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.hp-specstrip-cell{display:flex;flex-direction:column;gap:4px}
.hp-sk{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:1.4px;text-transform:uppercase;color:rgba(251,247,239,.5)}
.hp-sv{font-family:var(--mono);font-size:13.5px;font-weight:500;letter-spacing:.3px;color:var(--cream)}
.hp-specstrip-cta{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:1.4px;text-transform:uppercase;color:var(--gold);text-decoration:none;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.hp-specstrip-cta:hover{color:var(--gold-soft)}

/* ── STYLES GRID ── */
.hp-styles{background:var(--paper);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:80px 40px;margin-top:30px}
.hp-styles-in{max-width:1380px;margin:0 auto}
.hp-styles-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;gap:32px;flex-wrap:wrap}
.hp-styles-head-l{max-width:600px}
.hp-styles-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
.hp-style-card{text-align:center;cursor:pointer;transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.hp-style-card-frame{aspect-ratio:1;border-radius:24px;overflow:hidden;position:relative;background:var(--cream-warm);box-shadow:var(--sh-md);border:1px solid var(--line)}
.hp-style-card-frame img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
@media(hover:hover){
  .hp-style-card:hover{transform:translateY(-6px)}
  .hp-style-card:hover .hp-style-card-frame img{transform:scale(1.06)}
}
.hp-style-card-label{margin-top:14px;font-family:var(--serif);font-weight:600;font-size:16px;color:var(--green-deep);letter-spacing:-.1px}
.hp-style-card-tag{font-size:11px;color:var(--ink-mute);font-weight:500;margin-top:2px}

/* ── SHELF ── */
.hp-shelf{padding:100px 40px 90px;max-width:1380px;margin:0 auto}
.hp-shelf-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:56px;gap:32px;flex-wrap:wrap}
.hp-shelf-head-l{max-width:680px}
.hp-shelf-filter{display:flex;gap:6px;background:var(--paper);border:1px solid var(--line);padding:5px;border-radius:999px;box-shadow:var(--sh-sm)}
.hp-shelf-filter button{background:transparent;border:0;padding:9px 18px;border-radius:999px;font-size:13px;font-weight:500;color:var(--ink-mute);cursor:pointer;transition:all .2s;font-family:inherit}
.hp-shelf-filter button:hover{color:var(--green-deep)}
.hp-shelf-filter button.active{background:var(--green-deep);color:var(--cream);font-weight:600}
.hp-shelf-layout{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;grid-template-rows:auto auto;gap:32px 28px}
.hp-book{position:relative;cursor:pointer;transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.hp-book:active{transform:translateY(-4px)}
@media(hover:hover){.hp-book:hover{transform:translateY(-10px) rotate(-1deg)}}
.hp-book-cover{aspect-ratio:2/2.7;border-radius:8px 18px 18px 8px;overflow:hidden;position:relative;box-shadow:var(--sh-cover);background:var(--green-deep)}
.hp-book-cover img{width:100%;height:100%;object-fit:cover;display:block}
.hp-book-cover::after{content:'';position:absolute;top:6px;bottom:6px;right:0;width:4px;background:linear-gradient(90deg,rgba(0,0,0,.3),rgba(255,255,255,.05));z-index:3;pointer-events:none}
.hp-book-meta{margin-top:16px;padding:0 4px}
.hp-book-style{font-family:var(--serif);font-weight:600;font-size:17px;color:var(--green-deep);letter-spacing:-.1px;margin-bottom:3px}
.hp-book-tag{font-size:12px;font-weight:500;color:var(--ink-mute)}
.hp-book-swatches{display:flex;gap:5px;margin-top:10px}
.hp-swatch{width:11px;height:11px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.hp-book-hero{grid-column:1;grid-row:1/3;display:flex;flex-direction:column}
.hp-book-hero .hp-book-cover{aspect-ratio:auto;flex:1;min-height:580px}
.hp-book-hero .hp-book-meta{padding:18px 4px 0}
.hp-book-hero .hp-book-style{font-size:22px}
.hp-book-hero .hp-book-tag{font-size:13px}
.hp-book-hero .hp-swatch{width:14px;height:14px}
.hp-book-formats{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.hp-fmt{font-family:var(--mono);font-size:9.5px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;padding:3px 8px;border-radius:4px;background:var(--green-soft);color:var(--green-deep);border:1px solid rgba(11,92,70,.16)}
.hp-fmt.kdp{background:var(--ink);color:var(--gold);border-color:transparent}
.hp-fmt.kindle{background:var(--cream-warm);color:var(--ink-soft);border-color:transparent}
.hp-book-meta-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px;font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--ink-mute)}
.hp-book-meta-row .hp-trim{color:var(--green-deep);font-weight:600}
.hp-shelf-footer{margin-top:80px;padding-top:40px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}
.hp-shelf-footer-text{font-size:14px;color:var(--ink-mute)}
.hp-shelf-footer-text strong{color:var(--green-deep);font-weight:600}

/* ── HOW ── */
.hp-how{background:var(--green-deep);color:var(--cream);padding:100px 40px;position:relative;overflow:hidden}
.hp-how::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='28' fill='none' stroke='rgba(255,255,255,.04)' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='14' fill='none' stroke='rgba(255,255,255,.04)' stroke-width='1'/%3E%3C/svg%3E");pointer-events:none}
.hp-how-in{max-width:1280px;margin:0 auto;position:relative;z-index:1}
.hp-how .hp-sec-title{color:var(--cream)}
.hp-how .hp-sec-title em{color:var(--gold-soft)}
.hp-how .hp-sec-sub{color:rgba(251,247,239,.75)}
.hp-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:64px}
.hp-how-step{position:relative;padding:32px 28px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:24px;backdrop-filter:blur(8px);transition:all .3s}
@media(hover:hover){.hp-how-step:hover{background:rgba(255,255,255,.06);transform:translateY(-4px);border-color:rgba(232,179,64,.3)}}
.hp-step-num{font-family:var(--serif);font-style:italic;font-weight:500;font-size:52px;color:var(--gold);line-height:1;margin-bottom:24px;display:block;opacity:.92}
.hp-how-step h3{font-family:var(--serif);font-weight:600;font-size:24px;letter-spacing:-.3px;margin-bottom:12px}
.hp-how-step p{font-size:15px;color:rgba(251,247,239,.7);line-height:1.6}

/* ── TESTIMONIALS ── */
.hp-testi{padding:100px 40px;max-width:1380px;margin:0 auto}
.hp-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:48px}
.hp-testi-card{background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:32px;position:relative;transition:all .3s}
@media(hover:hover){.hp-testi-card:hover{border-color:var(--green);box-shadow:var(--sh-md);transform:translateY(-4px)}}
.hp-quote-mark{font-family:var(--serif);font-size:64px;line-height:.5;color:var(--gold);opacity:.7;margin-bottom:8px;display:block}
.hp-testi-text{font-family:var(--serif);font-size:19px;line-height:1.5;color:var(--ink);margin-bottom:24px;font-weight:400;letter-spacing:-.1px}
.hp-testi-author{display:flex;align-items:center;gap:14px;padding-top:20px;border-top:1px solid var(--line)}
.hp-avatar{width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--green-soft),var(--cream-warm));color:var(--green-deep);font-family:var(--serif);font-size:18px;font-weight:600;letter-spacing:-.3px;border:1px solid rgba(11,73,56,.08)}
.hp-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.hp-testi-name{font-weight:600;font-size:14px;color:var(--ink)}
.hp-testi-meta{font-size:12px;color:var(--ink-mute);margin-top:1px}

/* ── PRICING ── */
.hp-pricing{padding:100px 40px;background:var(--cream-warm);position:relative}
.hp-pricing-in{max-width:1100px;margin:0 auto}
.hp-pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px}
.hp-price-card{background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:36px 28px;position:relative;transition:all .3s}
.hp-price-card.pop{background:var(--green-deep);color:var(--cream);border-color:var(--green-deep);transform:scale(1.03)}
@media(hover:hover){
  .hp-price-card:hover{transform:translateY(-6px);box-shadow:var(--sh-lg)}
  .hp-price-card.pop:hover{transform:scale(1.03) translateY(-6px)}
}
.hp-price-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--green-deep);font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 14px;border-radius:999px;text-transform:uppercase}
.hp-price-tier{font-family:var(--serif);font-weight:600;font-size:21px;color:var(--green-deep);margin-bottom:8px;letter-spacing:-.2px}
.hp-price-card.pop .hp-price-tier{color:var(--gold-soft)}
.hp-price-desc{font-size:13px;color:var(--ink-mute);margin-bottom:24px}
.hp-price-card.pop .hp-price-desc{color:rgba(251,247,239,.6)}
.hp-price-amt{font-family:var(--serif);font-weight:500;font-size:54px;line-height:1;color:var(--ink);letter-spacing:-1.4px;margin-bottom:28px}
.hp-price-card.pop .hp-price-amt{color:var(--cream)}
.hp-price-amt span{font-size:14px;color:var(--ink-mute);font-weight:500;letter-spacing:0}
.hp-price-card.pop .hp-price-amt span{color:rgba(251,247,239,.5)}
.hp-price-features{list-style:none;margin-bottom:28px}
.hp-price-features li{font-size:14px;padding:8px 0;color:var(--ink-soft);display:flex;gap:10px;align-items:flex-start}
.hp-price-card.pop .hp-price-features li{color:rgba(251,247,239,.85)}
.hp-price-features svg{flex-shrink:0;margin-top:4px;color:var(--green)}
.hp-price-card.pop .hp-price-features svg{color:var(--gold)}
.hp-price-card.pop .hp-btn-full{background:var(--gold);color:var(--green-deep);border-color:var(--gold)}
.hp-price-card.pop .hp-btn-full:hover{background:var(--gold-soft);border-color:var(--gold-soft)}
.hp-price-note{text-align:center;margin-top:28px;font-size:13px;color:var(--ink-mute)}

/* ── FAQ ── */
.hp-faq{padding:100px 40px;max-width:780px;margin:0 auto}
.hp-faq-list{margin-top:32px}
.hp-faq-item{border-bottom:1px solid var(--line)}
.hp-faq-q{width:100%;background:transparent;border:0;padding:22px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;text-align:left;font-family:var(--serif);font-weight:500;font-size:19px;color:var(--green-deep);letter-spacing:-.2px;transition:color .2s}
.hp-faq-q:hover{color:var(--rose)}
.hp-faq-icon{font-size:22px;color:var(--gold-deep);transition:transform .3s;flex-shrink:0;margin-left:24px;font-weight:300}
.hp-faq-item.open .hp-faq-icon{transform:rotate(45deg);color:var(--rose)}
.hp-faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease}
.hp-faq-a p{font-size:15px;color:var(--ink-soft);line-height:1.65;padding-bottom:24px;max-width:680px}
.hp-faq-item.open .hp-faq-a{max-height:240px}

/* ── FINAL ── */
.hp-final{padding:120px 40px;background:var(--green-deep);color:var(--cream);text-align:center;position:relative;overflow:hidden}
.hp-final::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 8 L72 40 L40 72 L8 40 Z' fill='none' stroke='rgba(255,255,255,.04)' stroke-width='1'/%3E%3C/svg%3E")}
.hp-final-in{max-width:760px;margin:0 auto;position:relative;z-index:1}
.hp-final-spark{color:var(--gold);font-size:32px;margin-bottom:24px;display:block}
.hp-final h2{font-family:var(--serif);font-weight:600;font-size:clamp(40px,5vw,64px);line-height:1.04;letter-spacing:-1.2px;margin-bottom:20px}
.hp-final h2 em{font-style:italic;font-weight:500;color:var(--gold-soft)}
.hp-final p{font-size:18px;color:rgba(251,247,239,.75);margin-bottom:36px;max-width:520px;margin-left:auto;margin-right:auto}
.hp-final-btns{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}

/* ── FOOTER ── */
.hp-footer{background:var(--cream);border-top:1px solid var(--line);padding:60px 40px 32px}
.hp-footer-in{max-width:1380px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;gap:48px}
.hp-footer-brand img{height:32px}
.hp-footer-brand p{margin-top:14px;font-size:13px;color:var(--ink-mute);line-height:1.6;max-width:240px}
.hp-footer-col h4{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:var(--green-deep);margin-bottom:16px}
.hp-footer-col a{display:block;text-decoration:none;color:var(--ink-soft);font-size:13px;margin-bottom:10px;transition:color .2s}
.hp-footer-col a:hover{color:var(--rose)}
.hp-footer-bot{max-width:1380px;margin:48px auto 0;padding-top:24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:12px;color:var(--ink-mute);flex-wrap:wrap;gap:12px}

/* ── MOBILE NAV ── */
.hp-hamburger{display:none;flex-direction:column;gap:5px;background:transparent;border:0;cursor:pointer;padding:6px;border-radius:8px}
.hp-hamburger span{display:block;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:all .3s cubic-bezier(.4,0,.2,1)}
.hp-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hp-hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.hp-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.hp-mobile-menu{display:none;position:fixed;inset:0;top:65px;background:rgba(251,247,239,.97);backdrop-filter:blur(20px);z-index:49;padding:24px;flex-direction:column;gap:6px}
.hp-mobile-menu.open{display:flex}
.hp-mobile-menu a{font-size:20px;font-weight:600;color:var(--green-deep);text-decoration:none;padding:14px 0;border-bottom:1px solid var(--line);display:block;transition:color .2s}
.hp-mobile-menu a:hover{color:var(--rose)}
.hp-mobile-menu .hp-btn{margin-top:16px;justify-content:center;font-size:15px;padding:14px 28px}

/* ── RESPONSIVE ── */
@media(max-width:1100px){
  .hp-styles-grid{grid-template-columns:repeat(3,1fr)}
  .hp-shelf-layout{grid-template-columns:1fr 1fr 1fr}
  .hp-book-hero{grid-column:1/4;grid-row:1;flex-direction:row;align-items:flex-start;gap:24px}
  .hp-book-hero .hp-book-cover{flex:none;width:46%;min-height:auto;aspect-ratio:2/2.7}
  .hp-book-hero .hp-book-meta{padding:4px 0 0}
  .hp-how-grid,.hp-testi-grid,.hp-pricing-grid{grid-template-columns:1fr;max-width:520px;margin-left:auto;margin-right:auto}
  .hp-footer-in{grid-template-columns:1fr 1fr 1fr;gap:32px}
  .hp-specstrip-in{grid-template-columns:1fr;gap:20px}
  .hp-specstrip-grid{grid-template-columns:repeat(2,1fr);gap:16px}
}
@media(max-width:900px){
  .hp-hero-grid{grid-template-columns:1fr;gap:40px;min-height:0}
  .hp-stage{height:560px;max-width:560px;margin:0 auto}
  .hp-p-main{width:320px;height:320px}
  .hp-nav-links{display:none}
  .hp-hamburger{display:flex}
  .hp-h1{font-size:clamp(42px,9vw,64px)}
  .hp-hero{padding:32px 24px 32px}
  .hp-shelf,.hp-styles,.hp-how,.hp-testi,.hp-pricing,.hp-faq,.hp-final{padding-left:24px;padding-right:24px}
  .hp-nav-in{padding:14px 24px}
  .hp-shelf-head,.hp-styles-head{flex-direction:column;align-items:flex-start}
  .hp-styles-grid{grid-template-columns:repeat(2,1fr)}
  .hp-footer-in{grid-template-columns:1fr 1fr;gap:32px}
}
@media(max-width:560px){
  .hp-styles-grid,.hp-shelf-layout{grid-template-columns:1fr 1fr}
  .hp-book-hero{grid-column:1/3;grid-row:1;flex-direction:column}
  .hp-book-hero .hp-book-cover{width:100%;aspect-ratio:2/2.7;flex:none}
  .hp-p-sat{width:90px !important;height:90px !important}
  .hp-style-tag{top:auto;bottom:6%}
  .hp-nav-cta .hp-btn{display:none}
  .hp-shelf-filter{flex-wrap:wrap;border-radius:16px}
  .hp-how,.hp-testi,.hp-pricing,.hp-faq,.hp-final,.hp-shelf{padding-left:16px;padding-right:16px}
  .hp-testi-grid,.hp-pricing-grid{max-width:100%}
  .hp-pricing-grid{grid-template-columns:1fr}
  .hp-footer-in{grid-template-columns:1fr 1fr;gap:24px}
}
`;

const ROTATE_SET = [
  { src: '/assets/img-02.jpg', style: '3D Cinematic' },
  { src: '/assets/img-07.jpg', style: 'Heroic 3D' },
  { src: '/assets/img-05.jpg', style: 'Professional 3D' },
  { src: '/assets/img-15.jpg', style: 'Picture Book' },
  { src: '/assets/img-03.jpg', style: 'Soft Storybook' },
];

const BOOKS = [
  { id: 1, cover: '/assets/img-08.png', title: 'Islamic Heritage', tag: 'Chapter book for ages 8 to 14', trim: '6×9″ · 168 pp', bisac: 'JNF013030', swatches: ['#0E4A3E','#C9A24F','#3A4858','#8B5A2E'], formats: ['kdp','hardcover','paperback','kindle'], cat: 'chapter', hero: true },
  { id: 2, cover: '/assets/img-09.png', title: 'Classic Adventure', tag: 'Picture book for ages 3 to 6', trim: '8.5×8.5″ · 32 pp', bisac: 'JNF051000', swatches: ['#F4A91C','#3C9CD8','#7BC04A','#E84A4A'], formats: ['paperback','kindle'], cat: 'picture' },
  { id: 3, cover: '/assets/img-10.png', title: 'Epic Cinematic', tag: 'Middle grade for ages 8 to 14', trim: '6×9″ · 224 pp', bisac: 'JUV001000', swatches: ['#1A1830','#4A2860','#8B4A60','#C9A24F'], formats: ['hardcover','paperback'], cat: 'middle' },
  { id: 4, cover: '/assets/img-11.png', title: 'Vintage Ornate', tag: 'Chapter book for ages 6 to 10', trim: '5.5×8.5″ · 96 pp', bisac: 'JUV019000', swatches: ['#E8C547','#1B1814','#A87A2E','#F4ECD8'], formats: ['hardcover','paperback'], cat: 'chapter' },
  { id: 5, cover: '/assets/img-12.png', title: 'Watercolor Dream', tag: 'Picture book for ages 3 to 7', trim: '8×10″ · 32 pp', bisac: 'JUV017000', swatches: ['#E8B5C8','#C9D8A4','#F4DCC8','#A8B8D8'], formats: ['paperback','kindle'], cat: 'picture' },
  { id: 6, cover: '/assets/img-13.png', title: 'Night Sky', tag: 'Picture book for ages 4 to 8', trim: '8.5×8.5″ · 40 pp', bisac: 'JUV029010', swatches: ['#1A2848','#4A4070','#C9A24F','#F4ECD8'], formats: ['hardcover','kindle'], cat: 'picture' },
  { id: 7, cover: '/assets/img-14.png', title: 'Storybook Warm', tag: 'Chapter book for ages 6 to 10', trim: '6×9″ · 80 pp', bisac: 'JUV051000', swatches: ['#5C2818','#C9A24F','#E8B570','#3A2418'], formats: ['kdp','paperback'], cat: 'chapter' },
];

const FAQS = [
  { q: 'How does character consistency actually work?', a: 'You design a character once with a defined face, body, palette, and style. NoorStudio locks those traits and applies them to every illustration. Same eyes, same hair, same outfit, page after page.' },
  { q: 'Do you only support Islamic content?', a: 'No. NoorStudio is a universal children\'s-book platform. Universal Wholesome is our flagship template. We also offer explicitly Islamic-Forward templates for families who want them, alongside adventure, nature, dua, and more.' },
  { q: 'Can I sell the books I make?', a: 'Yes. Author and Studio plans include a full commercial license. Publish to Amazon KDP, sell from your own site, or distribute through bookstores. Royalties are yours.' },
  { q: 'What ages and formats are supported?', a: 'Picture books (ages 3–7), early readers (5–8), chapter books (7–10), and middle grade (8–14). Export as KDP-ready PDF, standard PDF, or EPUB. Hardcover print-on-demand through our partner.' },
  { q: 'Is the Islamic content reviewed?', a: 'Yes. Our Islamic templates follow guidelines built with input from educators and scholars, covering authentic references, faithful framing, and culturally respectful visuals.' },
];

const CHECK_SVG = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ARROW_SVG = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const [heroStyle, setHeroStyle] = useState(ROTATE_SET[0].style);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainImgRef = useRef<HTMLImageElement>(null);

  // CSS inject
  useEffect(() => {
    const id = 'hp-css';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = PAGE_CSS;
      document.head.appendChild(style);
    }
    return () => { /* keep in DOM for HMR */ };
  }, []);

  // Hero portrait rotation
  useEffect(() => {
    const t = setInterval(() => {
      setHeroFading(true);
      setTimeout(() => {
        setHeroIdx((i) => {
          const next = (i + 1) % ROTATE_SET.length;
          setHeroStyle(ROTATE_SET[next].style);
          return next;
        });
        setHeroFading(false);
      }, 320);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Filter books
  const filterMap: Record<string, string> = { 'Picture book': 'picture', 'Chapter book': 'chapter', 'Middle grade': 'middle' };
  const visibleBooks = activeFilter === 'All' ? BOOKS : BOOKS.filter((b) => b.cat === filterMap[activeFilter]);

  return (
    <div className="hp">
      <div className="hp-noise" aria-hidden="true" />

      {/* ── NAV ── */}
      <nav className="hp-nav">
        <div className="hp-nav-in">
          <Link to="/" className="hp-logo">
            <img src="/assets/img-01.png" alt="NoorStudio" />
          </Link>
          <ul className="hp-nav-links">
            <li><a href="#library">Library</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#templates">Templates</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <div className="hp-nav-cta">
            <Link to="/auth" className="hp-nav-login">Log in</Link>
            <Link to="/auth" className="hp-btn">
              Start creating {ARROW_SVG}
            </Link>
            <button
              className={`hp-hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`hp-mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#library" onClick={() => setMenuOpen(false)}>Library</a>
        <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#templates" onClick={() => setMenuOpen(false)}>Templates</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <Link to="/auth" className="hp-btn" onClick={() => setMenuOpen(false)}>
          Start creating {ARROW_SVG}
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <svg className="hp-hero-deco" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="22" fill="none" stroke="#0E4938" strokeWidth=".8"/>
              <circle cx="30" cy="30" r="11" fill="none" stroke="#0E4938" strokeWidth=".5"/>
              <path d="M30 8 L30 52 M8 30 L52 30" stroke="#0E4938" strokeWidth=".4"/>
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#geo)"/>
        </svg>

        <div className="hp-hero-grid">
          <div>
            <h1 className="hp-h1">
              Children's books<br />
              worth <em>keeping.</em>
              <span className="hp-headline-soft">Characters that never change</span>
            </h1>
            <p className="hp-sub">
              Design the character, choose a style, write the story. Your hero appears on every page exactly as you made them. Print-ready for Amazon KDP, IngramSpark, or your own shelf.
            </p>
            <div className="hp-cta-row">
              <Link to="/auth" className="hp-btn xl">
                Start your first book
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="#how" className="hp-ghost lg">
                <span className="hp-play-dot">▶</span>See how it works
              </a>
            </div>
            <div className="hp-proof">
              <div className="hp-proof-item">
                <span className="hp-stars">
                  {[0,1,2,3,4].map((i) => (
                    <svg key={i} viewBox="0 0 14 14" fill="currentColor">
                      <path d="M7 1l1.8 3.9 4.2.5-3.1 2.9.8 4.2L7 10.4l-3.7 2.1.8-4.2L1 5.4l4.2-.5L7 1z"/>
                    </svg>
                  ))}
                </span>
                <span><strong>4.9</strong> from <strong>3,200</strong>+ creators</span>
              </div>
              <div className="hp-proof-div" />
              <div className="hp-proof-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11V3a1 1 0 011-1h7l2 2v7a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M4 6h6M4 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                KDP-ready PDF exports
              </div>
              <div className="hp-proof-div" />
              <div className="hp-proof-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L8.5 5l3.5.4-2.7 2.5.8 3.6L7 9.7l-3.1 1.8.8-3.6L2 5.4 5.5 5z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg>
                Ten cover styles
              </div>
            </div>
          </div>

          <div className="hp-stage">
            <div className="hp-stage-bg" />
            <span className="hp-sparkle hp-sp1">✦</span>
            <span className="hp-sparkle hp-sp2">✧</span>
            <span className="hp-sparkle hp-sp3">✦</span>
            <span className="hp-sparkle hp-sp4">✧</span>

            <div className="hp-portrait hp-p-main">
              <img
                ref={mainImgRef}
                src={ROTATE_SET[heroIdx].src}
                alt="Featured character"
                style={{ opacity: heroFading ? 0 : 1 }}
              />
            </div>
            <div className="hp-portrait hp-p-sat hp-p-tl"><img src="/assets/img-03.jpg" alt="" /></div>
            <div className="hp-portrait hp-p-sat hp-p-tr"><img src="/assets/img-04.jpg" alt="" /></div>
            <div className="hp-portrait hp-p-sat hp-p-ml"><img src="/assets/img-05.jpg" alt="" /></div>
            <div className="hp-portrait hp-p-sat hp-p-bl"><img src="/assets/img-06.jpg" alt="" /></div>
            <div className="hp-portrait hp-p-sat hp-p-br"><img src="/assets/img-07.jpg" alt="" /></div>

            <div className="hp-style-tag">
              <div className="hp-style-tag-row">
                <span className="hp-style-tag-dot" />
                <span className="hp-style-tag-label">Style</span>
              </div>
              <div className="hp-style-tag-name">{heroStyle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPEC STRIP ── */}
      <div className="hp-specstrip">
        <div className="hp-specstrip-in">
          <div className="hp-specstrip-label">Print-ready, by default</div>
          <div className="hp-specstrip-grid">
            {[
              { k: 'Trim sizes', v: '6×9″ · 8.5×8.5″ · A5' },
              { k: 'Bleed', v: '0.125″ on all sides' },
              { k: 'Color', v: 'CMYK · 300 DPI' },
              { k: 'Export', v: 'PDF/X-1a · EPUB 3' },
            ].map((c) => (
              <div key={c.k} className="hp-specstrip-cell">
                <div className="hp-sk">{c.k}</div>
                <div className="hp-sv">{c.v}</div>
              </div>
            ))}
          </div>
          <a href="#" className="hp-specstrip-cta">
            Full spec sheet
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7m0 0L6.5 3M9 5.5L6.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>

      {/* ── STYLES SECTION ── */}
      <section className="hp-styles hp-sec" id="templates">
        <div className="hp-styles-in">
          <div className="hp-styles-head">
            <div className="hp-styles-head-l">
              <div className="hp-eyebrow">The cast</div>
              <h2 className="hp-sec-title">A platform for <em>every kind of story.</em></h2>
              <p className="hp-sec-sub">Pixar-grade 3D, soft storybook, watercolour, manga, classic illustration. Build the character once, render them in the style your story needs.</p>
            </div>
            <Link to="/auth" className="hp-ghost lg">Browse the studio →</Link>
          </div>
          <div className="hp-styles-grid">
            {[
              { img: '/assets/img-02.jpg', label: '3D Cinematic', tag: 'Pixar-grade rendering' },
              { img: '/assets/img-07.jpg', label: 'Heroic 3D', tag: 'Bold, action-ready' },
              { img: '/assets/img-05.jpg', label: 'Professional 3D', tag: 'For grown-up roles' },
              { img: '/assets/img-06.jpg', label: 'Soft Storybook', tag: 'Warm, hand-drawn feel' },
              { img: '/assets/img-04.jpg', label: 'Cute Creature', tag: 'For your sidekicks' },
            ].map((s) => (
              <div key={s.label} className="hp-style-card">
                <div className="hp-style-card-frame"><img src={s.img} alt={s.label} /></div>
                <div className="hp-style-card-label">{s.label}</div>
                <div className="hp-style-card-tag">{s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHELF ── */}
      <section className="hp-shelf hp-sec" id="library">
        <div className="hp-shelf-head">
          <div className="hp-shelf-head-l">
            <div className="hp-eyebrow">The library</div>
            <h2 className="hp-sec-title">Ten cover styles. <em>One platform.</em></h2>
            <p className="hp-sec-sub">Every story finds its visual voice. Pick a cover style, generate your art, and your characters stay consistent across every page.</p>
          </div>
          <div className="hp-shelf-filter">
            {['All', 'Picture book', 'Chapter book', 'Middle grade'].map((f) => (
              <button key={f} className={activeFilter === f ? 'active' : ''} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="hp-shelf-layout">
          {visibleBooks.map((b) => (
            <div key={b.id} className={`hp-book${b.hero ? ' hp-book-hero' : ''}`}>
              <div className="hp-book-cover"><img src={b.cover} alt={b.title} /></div>
              <div className="hp-book-meta">
                <div className="hp-book-style">{b.title}</div>
                <div className="hp-book-tag">{b.tag}</div>
                <div className="hp-book-meta-row">
                  <span className="hp-trim">{b.trim}</span>
                  <span>BISAC {b.bisac}</span>
                </div>
                <div className="hp-book-swatches">
                  {b.swatches.map((c) => <span key={c} className="hp-swatch" style={{ background: c }} />)}
                </div>
                <div className="hp-book-formats">
                  {b.formats.map((f) => <span key={f} className={`hp-fmt${f === 'kdp' ? ' kdp' : f === 'kindle' ? ' kindle' : ''}`}>{f === 'kdp' ? 'KDP-ready' : f === 'kindle' ? 'Kindle' : f.charAt(0).toUpperCase() + f.slice(1)}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hp-shelf-footer">
          <p className="hp-shelf-footer-text">Also available: <strong>Bold Typography, Nature & Adventure, Modern Minimal</strong>. More on the way.</p>
          <Link to="/auth" className="hp-ghost lg">Browse all styles →</Link>
        </div>
      </section>

      {/* ── HOW ── */}
      <section className="hp-how hp-sec" id="how">
        <div className="hp-how-in">
          <div className="hp-sec-center">
            <h2 className="hp-sec-title">Three steps, <em>one finished book.</em></h2>
            <p className="hp-sec-sub">From a character idea to a print-ready file you can publish to Amazon KDP. No design skills, no illustration commissions, no waiting weeks.</p>
          </div>
          <div className="hp-how-grid">
            {[
              { n: '01', h: 'Create the cast', p: 'Describe your character or pick from the studio. Choose age, personality, traits, and a visual style. Your cast is saved and reused everywhere.' },
              { n: '02', h: 'Write the story', p: 'Pick a template or start blank. Universal warmth, adventure, prophetic narrative, daily dua. The studio assists with structure; you keep the voice.' },
              { n: '03', h: 'Publish anywhere', p: 'Export a KDP-ready PDF with proper bleed, margins, and CMYK. Or download EPUB for digital, or order a printed hardcover through our partner.' },
            ].map((s) => (
              <div key={s.n} className="hp-how-step">
                <span className="hp-step-num">{s.n}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="hp-testi hp-sec">
        <div className="hp-sec-center">
          <h2 className="hp-sec-title">Made by parents, <em>kept by children.</em></h2>
        </div>
        <div className="hp-testi-grid">
          {[
            { text: "My daughter has read her own book every night for three weeks. She thinks I drew her, and I'm not telling her otherwise.", name: 'Sara A.', meta: 'Mother of two · Dubai', img: '/assets/img-03.jpg', init: 'S' },
            { text: "I run a Sunday school. We made eight books across three age groups in a weekend. The children pointed at the prophet stories for a month.", name: 'Yusuf K.', meta: 'Educator · Birmingham', img: '/assets/img-05.jpg', init: 'Y' },
            { text: "I had a story in my head for years. I published it on Amazon in nine days. First royalties came in the second week.", name: 'Aisha M.', meta: 'Indie author · Toronto', img: '/assets/img-15.jpg', init: 'A' },
          ].map((t) => (
            <div key={t.name} className="hp-testi-card">
              <span className="hp-quote-mark">"</span>
              <p className="hp-testi-text">{t.text}</p>
              <div className="hp-testi-author">
                <div className="hp-avatar">
                  <img src={t.img} alt={t.name} />
                </div>
                <div>
                  <div className="hp-testi-name">{t.name}</div>
                  <div className="hp-testi-meta">{t.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="hp-pricing hp-sec" id="pricing">
        <div className="hp-pricing-in">
          <div className="hp-sec-center">
            <h2 className="hp-sec-title">Start free. <em>Publish when ready.</em></h2>
            <p className="hp-sec-sub">Every plan includes character consistency, all cover styles, and full export. You keep 100% of your royalties, always.</p>
          </div>
          <div className="hp-pricing-grid">
            <div className="hp-price-card">
              <div className="hp-price-tier">Creator</div>
              <div className="hp-price-desc">For families and first-time creators</div>
              <div className="hp-price-amt">$29<span>/month</span></div>
              <ul className="hp-price-features">
                {['5 books per month','All cover styles','KDP-ready PDF export','Personal use license'].map((f) => <li key={f}>{CHECK_SVG}{f}</li>)}
              </ul>
              <Link to="/auth" className="hp-ghost hp-btn-full lg">Start free</Link>
            </div>

            <div className="hp-price-card pop">
              <div className="hp-price-badge">Most popular</div>
              <div className="hp-price-tier">Author</div>
              <div className="hp-price-desc">For serious indie authors</div>
              <div className="hp-price-amt">$79<span>/month</span></div>
              <ul className="hp-price-features">
                {['Unlimited books','Unlimited characters','KDP-ready exports','Full commercial license','Priority support'].map((f) => <li key={f}>{CHECK_SVG}{f}</li>)}
              </ul>
              <Link to="/auth" className="hp-btn hp-btn-full lg">Start 7-day trial</Link>
            </div>

            <div className="hp-price-card">
              <div className="hp-price-tier">Studio</div>
              <div className="hp-price-desc">For publishers, schools, teams</div>
              <div className="hp-price-amt">$199<span>/month</span></div>
              <ul className="hp-price-features">
                {['Everything in Author','Team collaboration','Bulk export tools','API access','Dedicated support'].map((f) => <li key={f}>{CHECK_SVG}{f}</li>)}
              </ul>
              <a href="mailto:hello@noorstudio.com" className="hp-ghost hp-btn-full lg">Contact sales</a>
            </div>
          </div>
          <p className="hp-price-note">All plans include a 7-day free trial. You keep 100% of your royalties, always.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hp-faq hp-sec">
        <div className="hp-sec-center">
          <h2 className="hp-sec-title">Asked &amp; <em>answered.</em></h2>
        </div>
        <div className="hp-faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`hp-faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="hp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span className="hp-faq-icon">+</span>
              </button>
              <div className="hp-faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="hp-final hp-sec">
        <div className="hp-final-in">
          <span className="hp-final-spark">✦</span>
          <h2>Your child's <em>favourite book</em><br />doesn't exist yet.</h2>
          <p>Make it. Free to start, ready to publish, kept forever.</p>
          <div className="hp-final-btns">
            <Link to="/auth" className="hp-btn xl hp-btn-white">Start your first book</Link>
            <Link to="/examples" className="hp-ghost lg hp-ghost-white">See examples</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-footer-in">
          <div className="hp-footer-brand">
            <img src="/assets/img-01.png" alt="NoorStudio" />
            <p>A children's-book studio. Consistent characters, every cover style, ready for print.</p>
          </div>
          <div className="hp-footer-col">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#templates">Templates</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Changelog</a>
          </div>
          <div className="hp-footer-col">
            <h4>Resources</h4>
            <a href="#">How-to guides</a>
            <a href="#">Publishing</a>
            <a href="#">Help center</a>
            <a href="#">Blog</a>
          </div>
          <div className="hp-footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
          <div className="hp-footer-col">
            <h4>Legal</h4>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="hp-footer-bot">
          <span>© 2026 NoorStudio</span>
          <span>Built for storytellers</span>
        </div>
      </footer>
    </div>
  );
}
