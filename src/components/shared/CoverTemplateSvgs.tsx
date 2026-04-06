/**
 * CoverTemplateSvgs — Mini illustrated SVG thumbnails for each of the 10 cover template styles.
 * Each SVG is 80×112 (portrait book proportions, ~5:7).
 * Used inside the KB Cover Design section visual picker.
 */

// ── 1. Classic Children's Adventure ─────────────────────────────────────────
export function ClassicChildrenSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect width="80" height="112" fill="#FFD93D" />
      <rect y="60" width="80" height="52" fill="#81C784" />
      {/* Sun */}
      <circle cx="60" cy="22" r="14" fill="#FF6B35" opacity="0.85" />
      {/* Clouds */}
      <ellipse cx="18" cy="28" rx="14" ry="7" fill="#FFF9C4" opacity="0.8" />
      <ellipse cx="30" cy="24" rx="10" ry="6" fill="#FFF9C4" opacity="0.8" />
      {/* Character — simple round figure */}
      <ellipse cx="40" cy="62" rx="8" ry="8" fill="#F9A825" />
      <rect x="34" y="70" width="12" height="18" rx="4" fill="#4FC3F7" />
      <rect x="30" y="72" width="6" height="12" rx="3" fill="#4FC3F7" />
      <rect x="44" y="72" width="6" height="12" rx="3" fill="#4FC3F7" />
      <rect x="35" y="87" width="5" height="10" rx="2.5" fill="#F9A825" />
      <rect x="40" y="87" width="5" height="10" rx="2.5" fill="#F9A825" />
      {/* Stars */}
      <circle cx="12" cy="15" r="2" fill="#FF6B35" />
      <circle cx="68" cy="40" r="1.5" fill="#FF6B35" />
      <circle cx="55" cy="50" r="1.5" fill="#FFF9C4" />
      {/* Title zone hint */}
      <rect x="8" y="4" width="48" height="8" rx="3" fill="#FF6B35" opacity="0.6" />
      <rect x="12" y="6" width="30" height="4" rx="2" fill="#FFF" opacity="0.7" />
    </svg>
  );
}

// ── 2. Epic Cinematic ────────────────────────────────────────────────────────
export function EpicCinematicSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="epSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D0D2B" />
          <stop offset="60%" stopColor="#2A0D4E" />
          <stop offset="100%" stopColor="#1A0A30" />
        </linearGradient>
        <radialGradient id="epGlow" cx="50%" cy="55%" r="40%">
          <stop offset="0%" stopColor="#7B2D8B" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="80" height="112" fill="url(#epSky)" />
      <rect width="80" height="112" fill="url(#epGlow)" />
      {/* Distant landscape silhouette */}
      <path d="M0 85 L10 70 L20 78 L30 60 L40 72 L50 58 L62 75 L80 65 L80 112 L0 112Z" fill="#0D0D1E" />
      {/* Character silhouette */}
      <ellipse cx="40" cy="65" rx="5" ry="5" fill="#1A0A30" />
      <path d="M36 70 Q38 90 36 100 M44 70 Q42 90 44 100" stroke="#1A0A30" strokeWidth="3" fill="none" />
      <path d="M36 75 L30 82 M44 75 L50 82" stroke="#1A0A30" strokeWidth="2.5" fill="none" />
      {/* Rim light on character */}
      <ellipse cx="40" cy="65" rx="5.5" ry="5.5" fill="none" stroke="#E94560" strokeWidth="1" opacity="0.7" />
      {/* Stars */}
      <circle cx="15" cy="20" r="1" fill="#E8E8FF" opacity="0.8" />
      <circle cx="30" cy="12" r="0.8" fill="#E8E8FF" opacity="0.6" />
      <circle cx="55" cy="18" r="1.2" fill="#E8E8FF" opacity="0.9" />
      <circle cx="68" cy="8" r="0.7" fill="#E8E8FF" opacity="0.7" />
      <circle cx="22" cy="35" r="0.8" fill="#E8E8FF" opacity="0.5" />
      {/* Title zone */}
      <rect x="8" y="6" width="50" height="6" rx="2" fill="#E94560" opacity="0.5" />
      <rect x="10" y="7.5" width="32" height="3" rx="1.5" fill="#E8E8FF" opacity="0.6" />
    </svg>
  );
}

// ── 3. Islamic Heritage ──────────────────────────────────────────────────────
export function IslamicHeritageSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ihBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D3B66" />
          <stop offset="100%" stopColor="#1B6CA8" />
        </linearGradient>
      </defs>
      <rect width="80" height="112" fill="url(#ihBg)" />
      {/* Golden hour glow */}
      <ellipse cx="40" cy="90" rx="50" ry="30" fill="#C9A84C" opacity="0.25" />
      {/* Mosque silhouette */}
      <rect x="30" y="60" width="20" height="35" fill="#0A2744" />
      <path d="M30 60 Q40 45 50 60Z" fill="#0A2744" />
      <rect x="36" y="45" width="8" height="15" fill="#0A2744" />
      <path d="M36 45 Q40 38 44 45Z" fill="#0A2744" />
      <rect x="38.5" y="34" width="3" height="11" fill="#C9A84C" />
      <circle cx="40" cy="33" r="2" fill="#C9A84C" />
      {/* Minarets */}
      <rect x="15" y="68" width="6" height="27" fill="#0A2744" />
      <path d="M15 68 Q18 62 21 68Z" fill="#0A2744" />
      <rect x="59" y="68" width="6" height="27" fill="#0A2744" />
      <path d="M59 68 Q62 62 65 68Z" fill="#0A2744" />
      {/* Crescent moon */}
      <path d="M60 15 A10 10 0 1 1 60 35 A7 7 0 1 0 60 15Z" fill="#C9A84C" />
      {/* Stars */}
      <circle cx="20" cy="20" r="1.5" fill="#C9A84C" />
      <circle cx="35" cy="10" r="1" fill="#C9A84C" />
      <circle cx="15" cy="40" r="1" fill="#C9A84C" opacity="0.7" />
      {/* Geometric border top */}
      <rect x="0" y="0" width="80" height="3" fill="#C9A84C" opacity="0.7" />
      <rect x="0" y="0" width="3" height="112" fill="#C9A84C" opacity="0.4" />
      <rect x="77" y="0" width="3" height="112" fill="#C9A84C" opacity="0.4" />
      <rect x="0" y="109" width="80" height="3" fill="#C9A84C" opacity="0.7" />
      {/* Corner diamonds */}
      <polygon points="6,6 10,3 14,6 10,9" fill="#C9A84C" opacity="0.8" />
      <polygon points="66,6 70,3 74,6 70,9" fill="#C9A84C" opacity="0.8" />
      {/* Title zone */}
      <rect x="8" y="8" width="50" height="6" rx="1" fill="#C9A84C" opacity="0.3" />
      <rect x="12" y="9.5" width="28" height="3" rx="1.5" fill="#F0EBD8" opacity="0.7" />
    </svg>
  );
}

// ── 4. Vintage Ornate ────────────────────────────────────────────────────────
export function VintageOrnateSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="112" fill="#2C1810" />
      {/* Inner warm glow */}
      <ellipse cx="40" cy="60" rx="30" ry="38" fill="#5C2D0A" opacity="0.5" />
      {/* Ornate outer border */}
      <rect x="3" y="3" width="74" height="106" rx="2" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
      <rect x="6" y="6" width="68" height="100" rx="1" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
      {/* Corner ornaments */}
      <path d="M3 3 L14 3 L14 5 L5 5 L5 14 L3 14Z" fill="#C9A84C" />
      <path d="M77 3 L66 3 L66 5 L75 5 L75 14 L77 14Z" fill="#C9A84C" />
      <path d="M3 109 L14 109 L14 107 L5 107 L5 98 L3 98Z" fill="#C9A84C" />
      <path d="M77 109 L66 109 L66 107 L75 107 L75 98 L77 98Z" fill="#C9A84C" />
      {/* Oval medallion */}
      <ellipse cx="40" cy="60" rx="22" ry="30" fill="none" stroke="#C9A84C" strokeWidth="1" />
      <ellipse cx="40" cy="60" rx="19" ry="27" fill="#3D1A0A" />
      {/* Decorative scroll top/bottom */}
      <path d="M20 28 Q40 22 60 28" stroke="#C9A84C" strokeWidth="1" fill="none" />
      <path d="M20 92 Q40 98 60 92" stroke="#C9A84C" strokeWidth="1" fill="none" />
      {/* Central illustration — shield/crest */}
      <path d="M33 50 L40 45 L47 50 L47 65 Q40 72 33 65Z" fill="#C9A84C" opacity="0.7" />
      <path d="M36 53 L40 50 L44 53 L44 63 Q40 68 36 63Z" fill="#2C1810" />
      {/* Title zone */}
      <rect x="12" y="8" width="56" height="12" rx="2" fill="#C9A84C" opacity="0.2" />
      <rect x="15" y="10" width="36" height="4" rx="2" fill="#C9A84C" opacity="0.6" />
      <rect x="20" y="15" width="26" height="3" rx="1.5" fill="#C9A84C" opacity="0.4" />
    </svg>
  );
}

// ── 5. Modern Minimal ────────────────────────────────────────────────────────
export function ModernMinimalSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="112" fill="#F7F7F5" />
      {/* Large geometric circle — main element */}
      <circle cx="42" cy="62" r="28" fill="#F5A623" opacity="0.15" />
      <circle cx="42" cy="62" r="28" fill="none" stroke="#F5A623" strokeWidth="1.5" />
      {/* Abstract brushstroke / arc */}
      <path d="M14 80 Q32 20 66 35" stroke="#1A1A1A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Small decorative circle */}
      <circle cx="14" cy="80" r="5" fill="#1A1A1A" />
      <circle cx="66" cy="35" r="3" fill="#F5A623" />
      {/* Title — bold lines */}
      <rect x="10" y="10" width="40" height="5" rx="1" fill="#1A1A1A" />
      <rect x="10" y="18" width="28" height="3" rx="1" fill="#1A1A1A" opacity="0.5" />
      {/* Author line */}
      <rect x="10" y="100" width="20" height="2.5" rx="1" fill="#1A1A1A" opacity="0.4" />
      {/* Accent dash */}
      <rect x="10" y="26" width="8" height="2" rx="1" fill="#F5A623" />
    </svg>
  );
}

// ── 6. Watercolor Dream ──────────────────────────────────────────────────────
export function WatercolorDreamSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wcBlur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      {/* Soft base */}
      <rect width="80" height="112" fill="#FFF8F0" />
      {/* Watercolor wash blobs */}
      <ellipse cx="20" cy="30" rx="22" ry="18" fill="#F9C784" opacity="0.35" filter="url(#wcBlur)" />
      <ellipse cx="60" cy="50" rx="25" ry="20" fill="#B5D5C5" opacity="0.4" filter="url(#wcBlur)" />
      <ellipse cx="35" cy="80" rx="30" ry="18" fill="#E8A598" opacity="0.3" filter="url(#wcBlur)" />
      <ellipse cx="55" cy="25" rx="18" ry="15" fill="#C3B8E8" opacity="0.3" filter="url(#wcBlur)" />
      {/* Botanical shapes — leaves */}
      <path d="M8 90 Q18 70 28 80 Q18 88 8 90Z" fill="#B5D5C5" opacity="0.7" />
      <path d="M72 85 Q62 65 52 78 Q62 85 72 85Z" fill="#B5D5C5" opacity="0.7" />
      <path d="M5 40 Q15 25 20 38 Q12 43 5 40Z" fill="#81C784" opacity="0.5" />
      <path d="M75 60 Q65 45 60 58 Q68 63 75 60Z" fill="#81C784" opacity="0.5" />
      {/* Flower dots */}
      <circle cx="25" cy="55" r="3" fill="#E8A598" opacity="0.8" />
      <circle cx="55" cy="75" r="2.5" fill="#F9C784" opacity="0.8" />
      <circle cx="40" cy="30" r="2" fill="#C3B8E8" opacity="0.8" />
      {/* Character — soft rounded outline */}
      <ellipse cx="40" cy="60" rx="7" ry="7" fill="#F9A825" opacity="0.6" />
      <rect x="34" y="67" width="12" height="15" rx="6" fill="#E8A598" opacity="0.6" />
      {/* Handwritten title feel */}
      <path d="M12 12 Q22 8 32 12 Q42 16 52 11 Q62 8 68 13" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M14 18 Q28 15 42 18 Q56 21 65 17" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── 7. Night Sky ─────────────────────────────────────────────────────────────
export function NightSkySvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nsBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050918" />
          <stop offset="70%" stopColor="#0B1A4A" />
          <stop offset="100%" stopColor="#1A2456" />
        </linearGradient>
        <radialGradient id="nsGlow" cx="35%" cy="30%" r="30%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="80" height="112" fill="url(#nsBg)" />
      <rect width="80" height="112" fill="url(#nsGlow)" />
      {/* Stars scattered */}
      {[
        [10,8],[22,5],[38,12],[55,7],[68,14],[14,22],[50,18],[64,28],[8,35],[30,30],[72,40],[18,48],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={Math.random() > 0.5 ? 1 : 0.6} fill="#E8E8FF" opacity={0.5 + i * 0.04} />
      ))}
      {/* Crescent moon */}
      <path d="M26 18 A13 13 0 1 1 26 44 A9 9 0 1 0 26 18Z" fill="#C9A84C" />
      {/* Mosque silhouette at horizon */}
      <path d="M0 95 L0 112 L80 112 L80 95 L70 95 L70 85 L65 85 L65 95 L55 95 L55 72 Q50 65 45 72 L45 95 L35 95 L35 85 L30 85 L30 95 L20 95 L20 88 L15 88 L15 95Z" fill="#060D1F" />
      {/* Dome */}
      <path d="M45 72 Q50 62 55 72Z" fill="#060D1F" />
      {/* Minaret top crescent */}
      <circle cx="50" cy="60" r="2" fill="#C9A84C" opacity="0.8" />
      {/* Horizon glow */}
      <rect x="0" y="90" width="80" height="5" fill="#C9A84C" opacity="0.1" />
      {/* Magical particles */}
      <circle cx="35" cy="75" r="1.5" fill="#C9A84C" opacity="0.6" />
      <circle cx="60" cy="68" r="1" fill="#C9A84C" opacity="0.5" />
      {/* Title zone */}
      <rect x="8" y="6" width="44" height="5" rx="1.5" fill="#C9A84C" opacity="0.3" />
    </svg>
  );
}

// ── 8. Storybook Warm ────────────────────────────────────────────────────────
export function StorybookWarmSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="swBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3E0" />
          <stop offset="100%" stopColor="#FFE0B2" />
        </linearGradient>
        <radialGradient id="swGlow" cx="50%" cy="60%" r="40%">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="80" height="112" fill="url(#swBg)" />
      <rect width="80" height="112" fill="url(#swGlow)" />
      {/* Illustrated vine border */}
      <path d="M5 5 Q5 20 8 30 Q6 50 5 70 Q5 90 5 107" stroke="#8B4513" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M75 5 Q75 20 72 30 Q74 50 75 70 Q75 90 75 107" stroke="#8B4513" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
      {/* Leaves on vines */}
      <ellipse cx="9" cy="25" rx="6" ry="3" fill="#81C784" opacity="0.6" transform="rotate(-30 9 25)" />
      <ellipse cx="7" cy="55" rx="5" ry="3" fill="#81C784" opacity="0.6" transform="rotate(20 7 55)" />
      <ellipse cx="71" cy="35" rx="6" ry="3" fill="#81C784" opacity="0.6" transform="rotate(30 71 35)" />
      <ellipse cx="73" cy="65" rx="5" ry="3" fill="#81C784" opacity="0.6" transform="rotate(-20 73 65)" />
      {/* Stars scattered */}
      <path d="M35 8 L36.5 12 L40 12 L37.5 14.5 L38.5 18 L35 16 L31.5 18 L32.5 14.5 L30 12 L33.5 12Z" fill="#F5A623" opacity="0.8" />
      <circle cx="55" cy="12" r="2.5" fill="#F5A623" opacity="0.5" />
      <circle cx="22" cy="15" r="2" fill="#F5A623" opacity="0.4" />
      {/* Cozy scene — house with warm window */}
      <rect x="22" y="55" width="36" height="35" fill="#D4781E" opacity="0.8" />
      <path d="M18 58 L40 40 L62 58Z" fill="#8B4513" />
      <rect x="32" y="68" width="10" height="14" rx="2" fill="#FFD93D" opacity="0.9" />
      <rect x="24" y="62" width="8" height="8" rx="1" fill="#4FC3F7" opacity="0.6" />
      <rect x="48" y="62" width="8" height="8" rx="1" fill="#4FC3F7" opacity="0.6" />
      {/* Glow from window */}
      <ellipse cx="37" cy="80" rx="8" ry="5" fill="#FFD93D" opacity="0.3" />
      {/* Title zone */}
      <rect x="8" y="4" width="48" height="9" rx="2" fill="#D4781E" opacity="0.25" />
      <rect x="12" y="6" width="30" height="4" rx="2" fill="#8B4513" opacity="0.5" />
    </svg>
  );
}

// ── 9. Bold Typography ───────────────────────────────────────────────────────
export function BoldTypographySvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      {/* Color block background */}
      <rect width="80" height="112" fill="#F5F5F0" />
      {/* Large color block — bottom half */}
      <rect y="55" width="80" height="57" fill="#1A1A1A" />
      {/* Red accent diagonal slash */}
      <path d="M30 0 L80 0 L80 112 L50 112Z" fill="#E63946" opacity="0.12" />
      {/* GIANT bold letters suggestion */}
      <rect x="8" y="12" width="55" height="14" rx="2" fill="#1A1A1A" />
      <rect x="8" y="30" width="42" height="14" rx="2" fill="#1A1A1A" />
      <rect x="8" y="48" width="30" height="9" rx="2" fill="#E63946" />
      {/* Character silhouette in color block */}
      <ellipse cx="55" cy="72" rx="8" ry="8" fill="#F5F5F0" opacity="0.9" />
      <rect x="49" y="79" width="12" height="16" rx="3" fill="#F5F5F0" opacity="0.9" />
      {/* Accent lines */}
      <rect x="8" y="98" width="20" height="2.5" rx="1" fill="#F5F5F0" opacity="0.6" />
      <rect x="8" y="104" width="12" height="2" rx="1" fill="#F5F5F0" opacity="0.4" />
      {/* Red dot accent */}
      <circle cx="68" cy="20" r="8" fill="#E63946" />
    </svg>
  );
}

// ── 10. Nature & Adventure ───────────────────────────────────────────────────
export function NatureAdventureSvg() {
  return (
    <svg viewBox="0 0 80 112" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="naBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="45%" stopColor="#B8E4C9" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
      </defs>
      <rect width="80" height="112" fill="url(#naBg)" />
      {/* Sun */}
      <circle cx="62" cy="20" r="10" fill="#F9C784" opacity="0.9" />
      <circle cx="62" cy="20" r="14" fill="#F9C784" opacity="0.2" />
      {/* Background trees */}
      <path d="M60 112 L60 70 L50 70 L65 50 L50 50 L68 28 L86 50 L70 50 L85 70 L70 70 L70 112Z" fill="#1B4332" opacity="0.5" />
      <path d="M0 112 L0 75 L-5 75 L10 55 L-5 55 L12 32 L30 55 L15 55 L30 75 L15 75 L15 112Z" fill="#1B4332" opacity="0.5" />
      {/* Foreground grass layers */}
      <path d="M0 90 Q20 82 40 88 Q60 94 80 86 L80 112 L0 112Z" fill="#2D6A4F" />
      <path d="M0 98 Q20 92 40 96 Q60 100 80 94 L80 112 L0 112Z" fill="#1B4332" />
      {/* Path */}
      <path d="M25 112 Q38 95 40 80 Q42 95 55 112Z" fill="#F9C784" opacity="0.5" />
      {/* Character — explorer feel */}
      <ellipse cx="40" cy="73" rx="5.5" ry="5.5" fill="#F9A825" />
      <rect x="35" y="78" width="10" height="14" rx="3" fill="#52B788" />
      <rect x="31" y="80" width="5" height="10" rx="2.5" fill="#52B788" />
      <rect x="44" y="80" width="5" height="10" rx="2.5" fill="#52B788" />
      {/* Dappled light spots */}
      <circle cx="15" cy="68" r="5" fill="#F9C784" opacity="0.2" />
      <circle cx="65" cy="72" r="4" fill="#F9C784" opacity="0.2" />
      <circle cx="40" cy="55" r="3" fill="#F9C784" opacity="0.15" />
      {/* Title zone */}
      <rect x="8" y="6" width="50" height="7" rx="2" fill="#1B4332" opacity="0.5" />
      <rect x="10" y="8" width="32" height="3.5" rx="1.5" fill="#F9C784" opacity="0.7" />
    </svg>
  );
}

// ── Catalogue map used by the visual picker ───────────────────────────────────
export const COVER_TEMPLATE_SVG_MAP: Record<string, () => JSX.Element> = {
  "ct_classic_children":  ClassicChildrenSvg,
  "ct_epic_cinematic":    EpicCinematicSvg,
  "ct_islamic_heritage":  IslamicHeritageSvg,
  "ct_vintage_ornate":    VintageOrnateSvg,
  "ct_modern_minimal":    ModernMinimalSvg,
  "ct_watercolor_dream":  WatercolorDreamSvg,
  "ct_night_sky":         NightSkySvg,
  "ct_storybook_warm":    StorybookWarmSvg,
  "ct_bold_typography":   BoldTypographySvg,
  "ct_nature_adventure":  NatureAdventureSvg,
};

// ── Real PNG thumbnails — shown instead of SVG when available ─────────────────
export const COVER_TEMPLATE_PNG_MAP: Record<string, string> = {
  "ct_classic_children":  "/cover/ct_classic_children.png",
  "ct_epic_cinematic":    "/cover/ct_epic_cinematic.png",
  "ct_islamic_heritage":  "/cover/ct_islamic_heritage.png",
  "ct_watercolor_dream":  "/cover/ct_watercolor_dream.png",
  "ct_night_sky":         "/cover/ct_night_sky.png",
  "ct_storybook_warm":    "/cover/ct_storybook_warm.png",
  "ct_nature_adventure":  "/cover/ct_nature_adventure.png",
  "ct_bold_typography":   "/cover/ct_bold_typography.png",
  "ct_vintage_ornate":    "/cover/ct_vintage_ornate.png",
};
