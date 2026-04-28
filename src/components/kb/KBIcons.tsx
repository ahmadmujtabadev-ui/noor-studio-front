/**
 * KBIcons — redesigned large, colorful, kid-friendly illustrated SVG icons.
 * All use an 80×80 viewBox. Every icon tells a small visual story so
 * children aged 4–12 immediately understand the concept without reading text.
 *
 * WHAT CHANGED:
 *  - Sabr       → patient turtle sitting beside a blooming flower
 *  - Shukr      → happy child arms-raised under a beaming sun
 *  - Sadaqah    → child handing a golden coin to another child
 *  - Honesty    → child choosing the bright/correct path at a fork
 *  - Kindness   → child wrapping arm around a sad friend (now smiling)
 *  - Tawakkul   → child releasing a dove to a starry sky
 *  - Salah      → child in sujood on a colourful prayer mat
 *  - Respect    → small child giving salaam to a grandparent
 *  - Forgiveness→ two children making up with a mended heart
 *  - Bismillah  → open glowing Quran with golden light rays
 *  - Taharah    → child happily washing hands with soap bubbles
 *  - Courage    → child in a cape standing beside a small lion cub
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Simple child face used in multiple icons */
function ChildFace({
  cx, cy, r = 9,
  skinFill = "#FBBF24",
  eyeFill = "#1C1917",
  smileD,
}: {
  cx: number; cy: number; r?: number;
  skinFill?: string; eyeFill?: string; smileD?: string;
}) {
  const el = r * 0.22;
  const ey = cy - r * 0.15;
  const ex = r * 0.32;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={skinFill} />
      {/* eyes */}
      <circle cx={cx - ex} cy={ey} r={el} fill={eyeFill} />
      <circle cx={cx + ex} cy={ey} r={el} fill={eyeFill} />
      {/* eye shine */}
      <circle cx={cx - ex + el * 0.4} cy={ey - el * 0.4} r={el * 0.45} fill="white" />
      <circle cx={cx + ex + el * 0.4} cy={ey - el * 0.4} r={el * 0.45} fill="white" />
      {/* smile */}
      {smileD ? (
        <path d={smileD} stroke={eyeFill} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : (
        <path
          d={`M${cx - ex + 1} ${cy + r * 0.28} Q${cx} ${cy + r * 0.58} ${cx + ex - 1} ${cy + r * 0.28}`}
          stroke={eyeFill} strokeWidth="1.6" fill="none" strokeLinecap="round"
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAMIC VALUES ICONS
// ─────────────────────────────────────────────────────────────────────────────

/** Sabr — patient turtle sitting beside a blooming flower */
export function IconSabr() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F5F3FF" />
      {/* ground */}
      <ellipse cx="42" cy="70" rx="30" ry="5" fill="#DDD6FE" opacity="0.45" />
      {/* FLOWER */}
      <line x1="14" y1="44" x2="14" y2="68" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 58 Q20 54 22 59" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.2" />
      {/* petals */}
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse
          key={i}
          cx={14 + Math.cos((a - 90) * Math.PI / 180) * 5.5}
          cy={40 + Math.sin((a - 90) * Math.PI / 180) * 5.5}
          rx="3.5" ry="2.5"
          transform={`rotate(${a}, ${14 + Math.cos((a - 90) * Math.PI / 180) * 5.5}, ${40 + Math.sin((a - 90) * Math.PI / 180) * 5.5})`}
          fill="#FDE68A"
        />
      ))}
      <circle cx="14" cy="40" r="4" fill="#F59E0B" />
      {/* TURTLE SHELL */}
      <ellipse cx="46" cy="57" rx="19" ry="13" fill="#7C3AED" />
      <ellipse cx="46" cy="54" rx="14" ry="10" fill="#A78BFA" />
      <ellipse cx="46" cy="52" rx="8.5" ry="6.5" fill="#C4B5FD" />
      {/* shell lines */}
      <path d="M38 52 L46 45 L54 52" stroke="#5B21B6" strokeWidth="1.3" fill="none" />
      <path d="M36 57 L46 54 L56 57" stroke="#5B21B6" strokeWidth="1.3" fill="none" />
      <line x1="46" y1="45" x2="46" y2="55" stroke="#5B21B6" strokeWidth="1.3" />
      {/* TURTLE LEGS */}
      <ellipse cx="30" cy="65" rx="5.5" ry="3.5" fill="#6EE7B7" />
      <ellipse cx="56" cy="65" rx="5.5" ry="3.5" fill="#6EE7B7" />
      <ellipse cx="28" cy="53" rx="4.5" ry="3" fill="#6EE7B7" />
      {/* tail */}
      <path d="M27 59 Q20 60 23 54" stroke="#6EE7B7" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* TURTLE HEAD */}
      <circle cx="62" cy="53" r="9.5" fill="#6EE7B7" />
      <circle cx="59.5" cy="50.5" r="2.1" fill="#064E3B" />
      <circle cx="65.5" cy="50.5" r="2.1" fill="#064E3B" />
      <circle cx="60" cy="50" r="0.8" fill="white" />
      <circle cx="66" cy="50" r="0.8" fill="white" />
      {/* gentle smile */}
      <path d="M58 55 Q62 59.5 66 55" stroke="#064E3B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* sparkles */}
      <circle cx="70" cy="18" r="3" fill="#C4B5FD" />
      <circle cx="64" cy="12" r="2" fill="#A78BFA" opacity="0.6" />
    </svg>
  );
}

/** Shukr — joyful child, arms raised, glowing sun, hearts */
export function IconShukr() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFFBEB" />
      {/* SUN */}
      <circle cx="40" cy="14" r="9" fill="#FCD34D" />
      {/* sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line
          key={i}
          x1={40 + Math.cos(a * Math.PI / 180) * 12}
          y1={14 + Math.sin(a * Math.PI / 180) * 12}
          x2={40 + Math.cos(a * Math.PI / 180) * 16}
          y2={14 + Math.sin(a * Math.PI / 180) * 16}
          stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      {/* CHILD BODY */}
      <rect x="33" y="42" width="14" height="18" rx="5" fill="#FB923C" />
      {/* arms raised */}
      <path d="M33 48 Q22 38 18 30" stroke="#FB923C" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M47 48 Q58 38 62 30" stroke="#FB923C" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* hands */}
      <circle cx="18" cy="28" r="5" fill="#FBBF24" />
      <circle cx="62" cy="28" r="5" fill="#FBBF24" />
      {/* legs */}
      <rect x="33" y="58" width="6" height="14" rx="3" fill="#C2410C" />
      <rect x="41" y="58" width="6" height="14" rx="3" fill="#C2410C" />
      {/* shoes */}
      <ellipse cx="36" cy="72" rx="5" ry="3" fill="#1C1917" />
      <ellipse cx="44" cy="72" rx="5" ry="3" fill="#1C1917" />
      {/* HEAD */}
      <ChildFace cx={40} cy={35} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      {/* hair */}
      <path d="M31 33 Q32 26 40 26 Q48 26 49 33" fill="#92400E" />
      {/* floating hearts */}
      <path d="M18 18 C17 15 13 15 13 18 C13 20 15.5 22 18 24.5 C20.5 22 23 20 23 18 C23 15 19 15 18 18Z" fill="#F43F5E" />
      <path d="M62 18 C61 16 58 16 58 18.5 C58 20 59.5 21.5 62 23.5 C64.5 21.5 66 20 66 18.5 C66 16 63 16 62 18Z" fill="#F43F5E" />
      {/* sparkles */}
      <circle cx="8" cy="40" r="2.5" fill="#FDE68A" />
      <circle cx="72" cy="44" r="2" fill="#FDE68A" />
    </svg>
  );
}

/** Sadaqah — child handing a golden coin to another smaller child */
export function IconSadaqah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF1F2" />
      {/* ground */}
      <ellipse cx="40" cy="74" rx="32" ry="5" fill="#FECDD3" opacity="0.4" />
      {/* ── GIVER child (left, taller) ── */}
      <rect x="8" y="38" width="13" height="20" rx="5" fill="#F43F5E" />
      {/* giver arm reaching right */}
      <path d="M21 45 Q32 43 38 44" stroke="#F43F5E" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* giver legs */}
      <rect x="8" y="56" width="5.5" height="14" rx="2.5" fill="#BE123C" />
      <rect x="15" y="56" width="5.5" height="14" rx="2.5" fill="#BE123C" />
      <ChildFace cx={14} cy={31} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      {/* giver hair */}
      <path d="M5 29 Q6 22 14 22 Q22 22 23 29" fill="#92400E" />
      {/* COIN */}
      <circle cx="40" cy="44" r="7" fill="#FCD34D" />
      <circle cx="40" cy="44" r="5.5" fill="#F59E0B" />
      <text x="40" y="47" textAnchor="middle" fontSize="6" fill="#78350F" fontWeight="bold">★</text>
      {/* ── RECEIVER child (right, smaller) ── */}
      <rect x="52" y="44" width="11" height="18" rx="4.5" fill="#FDA4AF" />
      {/* receiver arm reaching left */}
      <path d="M52 50 Q46 48 42 48" stroke="#FDA4AF" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* receiver legs */}
      <rect x="52" y="60" width="4.5" height="12" rx="2" fill="#BE123C" />
      <rect x="58" y="60" width="4.5" height="12" rx="2" fill="#BE123C" />
      <ChildFace cx={57} cy={38} r={7.5} skinFill="#FBBF24" eyeFill="#1C1917" />
      {/* receiver hair / scarf */}
      <path d="M49 36 Q50 30 57 30 Q64 30 65 36" fill="#92400E" />
      {/* floating hearts */}
      <path d="M30 20 C29 17 25 17 25 20 C25 22 27.5 24 30 26 C32.5 24 35 22 35 20 C35 17 31 17 30 20Z" fill="#F43F5E" opacity="0.7" />
      <path d="M52 18 C51 16 48 16 48 18.5 C48 20 49.5 21.5 52 23.5 C54.5 21.5 56 20 56 18.5 C56 16 53 16 52 18Z" fill="#F43F5E" opacity="0.7" />
      <circle cx="68" cy="28" r="3" fill="#FECDD3" />
    </svg>
  );
}

/** Honesty — child choosing the shining right path at a fork in the road */
export function IconHonesty() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0FDF4" />
      {/* road fork */}
      <path d="M40 72 L40 50 L20 28" stroke="#BBF7D0" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M40 50 L60 28" stroke="#FCA5A5" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* LEFT path — bright, green, checkmark sign */}
      <rect x="6" y="12" width="24" height="18" rx="5" fill="#22C55E" />
      <path d="M11 21 L16 26 L25 15" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* RIGHT path — red X sign */}
      <rect x="50" y="12" width="24" height="18" rx="5" fill="#F87171" />
      <path d="M55 17 L69 25 M69 17 L55 25" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* CHILD standing at fork, facing left */}
      <rect x="33" y="48" width="14" height="16" rx="5" fill="#16A34A" />
      <path d="M33 54 Q26 52 22 54" stroke="#16A34A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M47 54 Q54 52 58 50" stroke="#16A34A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="33" y="62" width="5.5" height="12" rx="2.5" fill="#15803D" />
      <rect x="41" y="62" width="5.5" height="12" rx="2.5" fill="#15803D" />
      <ChildFace cx={40} cy={41} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      {/* hair */}
      <path d="M31 39 Q32 32 40 32 Q48 32 49 39" fill="#92400E" />
      {/* star sparkle above correct path */}
      <path d="M18 8 L19 11 L22 11 L20 13 L21 16 L18 14 L15 16 L16 13 L14 11 L17 11Z" fill="#FCD34D" />
      <circle cx="68" cy="8" r="3" fill="#BBF7D0" />
    </svg>
  );
}

/** Kindness — child wrapping arm around a sad friend who is now smiling */
export function IconKindness() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF7ED" />
      {/* ground */}
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#FED7AA" opacity="0.4" />
      {/* ── KIND child (left) ── */}
      <rect x="10" y="40" width="14" height="20" rx="5" fill="#F97316" />
      {/* arm around friend */}
      <path d="M24 44 Q36 38 44 42" stroke="#F97316" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <rect x="10" y="58" width="5.5" height="14" rx="2.5" fill="#EA580C" />
      <rect x="18" y="58" width="5.5" height="14" rx="2.5" fill="#EA580C" />
      <ChildFace cx={17} cy={33} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M8 31 Q9 24 17 24 Q25 24 26 31" fill="#92400E" />
      {/* ── FRIEND child (right, smaller, now smiling) ── */}
      <rect x="42" y="44" width="13" height="18" rx="5" fill="#FDBA74" />
      <rect x="42" y="60" width="5" height="12" rx="2.5" fill="#EA580C" />
      <rect x="50" y="60" width="5" height="12" rx="2.5" fill="#EA580C" />
      <ChildFace cx={48} cy={37} r={8} skinFill="#FBBF24" eyeFill="#1C1917" />
      {/* friend scarf/headband */}
      <rect x="40" y="30" width="16" height="5" rx="2.5" fill="#FB923C" />
      {/* HEARTS floating between them */}
      <path d="M34 26 C33 23 29 23 29 26 C29 28 31.5 30 34 32 C36.5 30 39 28 39 26 C39 23 35 23 34 26Z" fill="#F43F5E" />
      <path d="M58 22 C57 20 54 20 54 22.5 C54 24 55.5 25.5 58 27.5 C60.5 25.5 62 24 62 22.5 C62 20 59 20 58 22Z" fill="#F43F5E" opacity="0.7" />
      {/* sparkle */}
      <circle cx="68" cy="38" r="2.5" fill="#FDBA74" />
      <circle cx="10" cy="18" r="3" fill="#FED7AA" />
    </svg>
  );
}

/** Tawakkul — child releasing a white dove to a starry night sky */
export function IconTawakkul() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#EFF6FF" />
      {/* night sky panel */}
      <rect x="4" y="4" width="72" height="44" rx="14" fill="#DBEAFE" opacity="0.55" />
      {/* stars */}
      {[[15,12],[30,8],[50,10],[65,14],[70,26],[8,28]].map(([sx,sy],i) => (
        <path key={i} d={`M${sx} ${sy} L${sx+1.5} ${sy+4} L${sx+5} ${sy+4} L${sx+2} ${sy+6.5} L${sx+3} ${sy+10} L${sx} ${sy+8} L${sx-3} ${sy+10} L${sx-2} ${sy+6.5} L${sx-5} ${sy+4} L${sx-1.5} ${sy+4}Z`}
          fill="#93C5FD" opacity="0.7" transform={`scale(0.55) translate(${sx*0.8},${sy*0.8})`} />
      ))}
      <circle cx="14" cy="12" r="3.5" fill="#BFDBFE" opacity="0.8" />
      <circle cx="64" cy="10" r="3" fill="#BFDBFE" opacity="0.7" />
      <circle cx="50" cy="16" r="2" fill="#60A5FA" opacity="0.6" />
      <circle cx="28" cy="8" r="2.5" fill="#BFDBFE" />
      {/* MOON */}
      <circle cx="58" cy="16" r="9" fill="#FDE68A" />
      <circle cx="62" cy="13" r="7" fill="#DBEAFE" />
      {/* DOVE */}
      <path d="M34 22 Q38 14 46 14 Q52 14 54 20 Q50 16 46 18 Q42 16 38 22Z" fill="white" stroke="#93C5FD" strokeWidth="1" />
      <path d="M46 18 Q52 10 60 14 Q56 14 54 20Z" fill="white" stroke="#93C5FD" strokeWidth="1" />
      <circle cx="54" cy="19" r="2" fill="white" stroke="#93C5FD" strokeWidth="0.8" />
      <circle cx="55.2" cy="18.5" r="0.7" fill="#1E40AF" />
      {/* string from dove to hand */}
      <path d="M36 24 Q32 32 30 40" stroke="#93C5FD" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2 2" />
      {/* CHILD body */}
      <rect x="29" y="50" width="14" height="18" rx="5" fill="#3B82F6" />
      {/* arm up releasing */}
      <path d="M29 55 Q22 48 28 40" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M43 56 Q50 54 54 56" stroke="#3B82F6" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="29" y="66" width="5.5" height="12" rx="2.5" fill="#1D4ED8" />
      <rect x="37" y="66" width="5.5" height="12" rx="2.5" fill="#1D4ED8" />
      <ChildFace cx={36} cy={43} r={9} skinFill="#FBBF24" eyeFill="#1C1917"
        smileD="M30 46.5 Q36 51 42 46.5" />
      <path d="M27 41 Q28 34 36 34 Q44 34 45 41" fill="#92400E" />
    </svg>
  );
}

/** Salah — child in sujood on a vibrant geometric prayer mat */
export function IconSalah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0FDF4" />
      {/* PRAYER MAT */}
      <rect x="6" y="44" width="68" height="32" rx="6" fill="#059669" />
      {/* mat inner field */}
      <rect x="10" y="48" width="60" height="24" rx="4" fill="#10B981" />
      {/* mihrab arch */}
      <path d="M24 72 L24 54 Q40 44 56 54 L56 72Z" fill="#34D399" opacity="0.55" />
      <path d="M24 54 Q40 46 56 54" stroke="#065F46" strokeWidth="2" fill="none" />
      {/* geometric mat details */}
      <line x1="10" y1="56" x2="70" y2="56" stroke="#065F46" strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="64" x2="70" y2="64" stroke="#065F46" strokeWidth="1" opacity="0.4" />
      {/* mat border pattern dots */}
      {[14,22,30,38,46,54,62].map((x, i) => (
        <circle key={i} cx={x} cy={51} r="1.2" fill="#A7F3D0" />
      ))}
      {/* crescent on mat */}
      <path d="M44 50 A5 5 0 1 1 44 60 A7 7 0 0 0 44 50Z" fill="#FCD34D" opacity="0.9" />
      {/* mat fringe */}
      {[10,16,22,28,34,40,46,52,58,64,70].map((x, i) => (
        <line key={i} x1={x} y1="76" x2={x} y2="79" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* CHILD in sujood (prostration) */}
      {/* feet/legs curled */}
      <ellipse cx="62" cy="62" rx="8" ry="5" fill="#FB923C" />
      {/* body arc */}
      <path d="M54 66 Q46 52 38 52 Q32 52 28 56" stroke="#F97316" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* head on mat */}
      <circle cx="26" cy="58" r="8" fill="#FBBF24" />
      {/* arms on mat */}
      <path d="M34 56 Q30 54 24 52" stroke="#F97316" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M34 56 Q38 52 40 50" stroke="#F97316" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* crescent + star top corner */}
      <path d="M66 8 A6 6 0 1 1 66 20 A8 8 0 0 0 66 8Z" fill="#FCD34D" />
      <path d="M73 9 L74 12 L77 12 L74.5 14 L75.5 17 L73 15.5 L70.5 17 L71.5 14 L69 12 L72 12Z" fill="#FCD34D" />
    </svg>
  );
}

/** Respect — small child giving salaam (hand on heart, gentle bow) to a grandparent */
export function IconRespect() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FDF4FF" />
      {/* ground */}
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#E9D5FF" opacity="0.4" />
      {/* ── GRANDPARENT (left, tall) ── */}
      {/* robe/body */}
      <rect x="8" y="28" width="18" height="34" rx="7" fill="#7C3AED" />
      {/* thoub detail */}
      <line x1="17" y1="32" x2="17" y2="58" stroke="#6D28D9" strokeWidth="1.5" opacity="0.5" />
      {/* arms folded */}
      <path d="M8 40 Q6 46 10 50" stroke="#7C3AED" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M26 40 Q28 46 24 50" stroke="#7C3AED" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* legs */}
      <rect x="8" y="60" width="7" height="14" rx="3" fill="#5B21B6" />
      <rect x="19" y="60" width="7" height="14" rx="3" fill="#5B21B6" />
      {/* grandparent head */}
      <circle cx="17" cy="20" r="10" fill="#FBBF24" />
      {/* beard */}
      <path d="M10 25 Q17 34 24 25" fill="#D4D4D4" opacity="0.8" />
      {/* kufi cap */}
      <path d="M7 18 Q17 10 27 18" fill="#A855F7" />
      {/* grandparent eyes (wise, calm) */}
      <circle cx="13.5" cy="19" r="2" fill="#1C1917" />
      <circle cx="20.5" cy="19" r="2" fill="#1C1917" />
      <circle cx="14" cy="18.5" r="0.7" fill="white" />
      <circle cx="21" cy="18.5" r="0.7" fill="white" />
      {/* gentle smile */}
      <path d="M12 24 Q17 28 22 24" stroke="#92400E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* ── CHILD (right, smaller, bowing with hand on heart) ── */}
      <rect x="50" y="46" width="12" height="16" rx="5" fill="#C084FC" />
      {/* hand on heart gesture */}
      <path d="M50 52 Q44 50 40 52" stroke="#C084FC" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* heart on chest */}
      <path d="M53 50 C52.5 48.5 50 48.5 50 50.5 C50 51.5 51.5 52.5 53 54 C54.5 52.5 56 51.5 56 50.5 C56 48.5 53.5 48.5 53 50Z" fill="#F43F5E" />
      {/* child legs */}
      <rect x="50" y="60" width="5" height="14" rx="2.5" fill="#9333EA" />
      <rect x="57" y="60" width="5" height="14" rx="2.5" fill="#9333EA" />
      {/* child head — slight bow */}
      <circle cx="56" cy="39" r="8" fill="#FBBF24" />
      <path d="M48 36 Q49 30 56 30 Q63 30 64 36" fill="#92400E" />
      <circle cx="53" cy="38" r="1.8" fill="#1C1917" />
      <circle cx="59" cy="38" r="1.8" fill="#1C1917" />
      <circle cx="53.5" cy="37.5" r="0.7" fill="white" />
      <circle cx="59.5" cy="37.5" r="0.7" fill="white" />
      <path d="M52 43 Q56 47 60 43" stroke="#1C1917" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* sparkles */}
      <circle cx="38" cy="18" r="3.5" fill="#E9D5FF" />
      <circle cx="70" cy="22" r="2.5" fill="#DDD6FE" />
    </svg>
  );
}

/** Forgiveness — two children shaking hands with a mended heart glowing between them */
export function IconForgiveness() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF1F2" />
      {/* ground */}
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#FECDD3" opacity="0.4" />
      {/* MENDED HEART in centre */}
      {/* heart glow */}
      <circle cx="40" cy="36" r="16" fill="#FECDD3" opacity="0.35" />
      {/* heart shape */}
      <path d="M40 48 C30 40 22 36 22 28 C22 22 27 18 32 18 C36 18 39 20 40 22 C41 20 44 18 48 18 C53 18 58 22 58 28 C58 36 50 40 40 48Z" fill="#F43F5E" />
      {/* mend stitches */}
      <line x1="38" y1="26" x2="42" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="31" x2="43" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="23" x2="40" y2="34" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
      {/* ── LEFT child ── */}
      <rect x="6" y="50" width="13" height="18" rx="5" fill="#FB7185" />
      <rect x="6" y="66" width="5" height="12" rx="2.5" fill="#E11D48" />
      <rect x="13" y="66" width="5" height="12" rx="2.5" fill="#E11D48" />
      <ChildFace cx={12} cy={43} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M3 41 Q4 34 12 34 Q20 34 21 41" fill="#92400E" />
      {/* left arm reaching right */}
      <path d="M19 56 Q28 52 32 54" stroke="#FB7185" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* ── RIGHT child ── */}
      <rect x="61" y="50" width="13" height="18" rx="5" fill="#FDA4AF" />
      <rect x="61" y="66" width="5" height="12" rx="2.5" fill="#E11D48" />
      <rect x="69" y="66" width="5" height="12" rx="2.5" fill="#E11D48" />
      <ChildFace cx={68} cy={43} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M59 41 Q60 34 68 34 Q76 34 77 41" fill="#92400E" />
      {/* right arm reaching left */}
      <path d="M61 56 Q52 52 48 54" stroke="#FDA4AF" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* HANDSHAKE in centre bottom */}
      <path d="M32 54 Q40 58 48 54" stroke="#FBBF24" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="55" r="4" fill="#FCD34D" />
      {/* sparkles */}
      <circle cx="10" cy="14" r="3" fill="#FECDD3" />
      <circle cx="70" cy="12" r="2.5" fill="#FECDD3" />
    </svg>
  );
}

/** Bismillah — open glowing Quran with golden light rays from above */
export function IconBismillah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0FDF4" />
      {/* golden light rays from top */}
      <path d="M40 4 L44 22 L40 20 L36 22Z" fill="#FDE68A" opacity="0.5" />
      <path d="M30 6 L38 22 L40 20 L34 8Z" fill="#FDE68A" opacity="0.35" />
      <path d="M50 6 L46 22 L40 20 L46 8Z" fill="#FDE68A" opacity="0.35" />
      <path d="M20 10 L36 22 L40 20 L24 12Z" fill="#FDE68A" opacity="0.2" />
      <path d="M60 10 L44 22 L40 20 L56 12Z" fill="#FDE68A" opacity="0.2" />
      {/* glowing source */}
      <circle cx="40" cy="14" r="8" fill="#FDE68A" opacity="0.5" />
      <circle cx="40" cy="14" r="5" fill="#FCD34D" />
      <circle cx="40" cy="14" r="3" fill="#F59E0B" />
      {/* crescent + star */}
      <path d="M36 8 A5 5 0 1 1 36 20 A7 7 0 0 0 36 8Z" fill="#F59E0B" />
      <path d="M42 6 L43 8.5 L45.5 8.5 L43.5 10 L44.5 12.5 L42 11 L39.5 12.5 L40.5 10 L38.5 8.5 L41 8.5Z" fill="#FCD34D" />
      {/* shadow under book */}
      <ellipse cx="40" cy="73" rx="26" ry="5" fill="#BBF7D0" opacity="0.4" />
      {/* BOOK COVER */}
      <path d="M8 32 Q8 70 20 72 L40 72 L40 28Z" fill="#047857" />
      <path d="M72 32 Q72 70 60 72 L40 72 L40 28Z" fill="#065F46" />
      {/* spine */}
      <rect x="38" y="28" width="4" height="44" rx="2" fill="#059669" />
      {/* LEFT PAGE */}
      <path d="M10 34 Q10 68 20 70 L38 70 L38 30Z" fill="#D1FAE5" />
      {/* left page arch decoration */}
      <path d="M16 38 Q26 30 36 38" stroke="#059669" strokeWidth="2" fill="none" />
      <path d="M16 42 Q26 34 36 42" stroke="#A7F3D0" strokeWidth="1.5" fill="none" />
      {/* Arabic text lines left */}
      <line x1="14" y1="48" x2="36" y2="48" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="54" x2="35" y2="54" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="60" x2="34" y2="60" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" />
      {/* RIGHT PAGE */}
      <path d="M70 34 Q70 68 60 70 L42 70 L42 30Z" fill="#ECFDF5" />
      <path d="M44 38 Q54 30 64 38" stroke="#059669" strokeWidth="2" fill="none" />
      <path d="M44 42 Q54 34 64 42" stroke="#A7F3D0" strokeWidth="1.5" fill="none" />
      <line x1="44" y1="48" x2="66" y2="48" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="54" x2="65" y2="54" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="60" x2="64" y2="60" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" />
      {/* corner decorations */}
      <circle cx="12" cy="74" r="2.5" fill="#34D399" opacity="0.5" />
      <circle cx="68" cy="74" r="2.5" fill="#34D399" opacity="0.5" />
    </svg>
  );
}

/** Taharah — happy child washing hands with water splashing and soap bubbles */
export function IconCleanliness() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#EFF6FF" />
      {/* SINK / basin */}
      <path d="M12 56 Q12 70 24 70 L56 70 Q68 70 68 56 L68 50 L12 50Z" fill="#BFDBFE" />
      <rect x="12" y="46" width="56" height="8" rx="4" fill="#93C5FD" />
      {/* faucet */}
      <rect x="36" y="30" width="8" height="18" rx="4" fill="#60A5FA" />
      <rect x="30" y="28" width="20" height="6" rx="3" fill="#3B82F6" />
      {/* WATER STREAM */}
      <path d="M38 46 Q36 52 38 58" stroke="#60A5FA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M42 46 Q44 52 42 58" stroke="#93C5FD" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* HANDS under water */}
      {/* left hand */}
      <path d="M20 54 Q22 46 28 46 Q34 46 32 54" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
      {/* right hand */}
      <path d="M48 54 Q50 46 56 46 Q62 46 60 54" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
      {/* rubbing motion fingers */}
      <line x1="22" y1="49" x2="30" y2="49" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="52" x2="30" y2="52" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="49" x2="58" y2="49" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="52" x2="58" y2="52" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      {/* SOAP BUBBLES */}
      <circle cx="14" cy="42" r="7" fill="none" stroke="#60A5FA" strokeWidth="2" opacity="0.75" />
      <circle cx="11" cy="40" r="2" fill="#DBEAFE" opacity="0.5" />
      <circle cx="68" cy="36" r="9" fill="none" stroke="#93C5FD" strokeWidth="2" opacity="0.7" />
      <circle cx="65" cy="33" r="2.5" fill="#DBEAFE" opacity="0.5" />
      <circle cx="20" cy="24" r="5" fill="none" stroke="#93C5FD" strokeWidth="1.8" opacity="0.6" />
      <circle cx="58" cy="56" r="5" fill="none" stroke="#60A5FA" strokeWidth="1.8" opacity="0.55" />
      {/* CHILD HEAD & torso (behind sink) */}
      <ChildFace cx={40} cy={22} r={10} skinFill="#FBBF24" eyeFill="#1C1917"
        smileD="M34 25.5 Q40 30 46 25.5" />
      {/* hair */}
      <path d="M30 20 Q31 12 40 12 Q49 12 50 20" fill="#92400E" />
      {/* water drops */}
      <path d="M10 32 Q11 28 12 32" fill="#60A5FA" opacity="0.6" />
      <path d="M64 46 Q65 42 66 46" fill="#60A5FA" opacity="0.6" />
      <path d="M24 36 Q25 32 26 36" fill="#93C5FD" opacity="0.5" />
    </svg>
  );
}

/** Courage — bold child in a cape standing tall beside a friendly lion cub */
export function IconCourage() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFFBEB" />
      {/* ground */}
      <ellipse cx="40" cy="74" rx="32" ry="5" fill="#FDE68A" opacity="0.45" />
      {/* LION CUB (right) */}
      {/* mane */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a, i) => (
        <circle key={i}
          cx={60 + Math.cos(a * Math.PI / 180) * 13}
          cy={54 + Math.sin(a * Math.PI / 180) * 13}
          r="5.5" fill="#F59E0B" opacity="0.55"
        />
      ))}
      {/* lion body */}
      <ellipse cx="60" cy="62" rx="14" ry="10" fill="#FCD34D" />
      {/* lion head */}
      <circle cx="60" cy="52" r="12" fill="#FCD34D" />
      {/* lion face */}
      <circle cx="56.5" cy="50" r="2.2" fill="#78350F" />
      <circle cx="63.5" cy="50" r="2.2" fill="#78350F" />
      <circle cx="57" cy="49.5" r="0.8" fill="white" />
      <circle cx="64" cy="49.5" r="0.8" fill="white" />
      {/* lion nose */}
      <path d="M58 54.5 Q60 57 62 54.5" stroke="#78350F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="54" rx="2.5" ry="1.5" fill="#F97316" />
      {/* lion ears */}
      <path d="M50 44 L52 50 L54 44Z" fill="#FCD34D" />
      <path d="M66 44 L68 50 L70 44Z" fill="#FCD34D" />
      {/* lion tail */}
      <path d="M74 62 Q80 58 76 52" stroke="#FCD34D" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="76" cy="51" r="5" fill="#F59E0B" />
      {/* lion legs */}
      <rect x="50" y="68" width="6" height="10" rx="3" fill="#F59E0B" />
      <rect x="64" y="68" width="6" height="10" rx="3" fill="#F59E0B" />
      {/* CHILD with cape (left) */}
      {/* cape */}
      <path d="M14 44 Q12 60 16 72 L26 72 L26 44Z" fill="#EF4444" opacity="0.85" />
      {/* body */}
      <rect x="14" y="44" width="16" height="20" rx="6" fill="#F97316" />
      {/* cape collar */}
      <rect x="13" y="42" width="18" height="6" rx="3" fill="#DC2626" />
      {/* star badge on chest */}
      <path d="M22 50 L23.5 54.5 L28 54.5 L24.5 57 L26 61.5 L22 59 L18 61.5 L19.5 57 L16 54.5 L20.5 54.5Z" fill="#FCD34D" />
      {/* legs */}
      <rect x="14" y="62" width="6" height="14" rx="3" fill="#C2410C" />
      <rect x="24" y="62" width="6" height="14" rx="3" fill="#C2410C" />
      {/* boots */}
      <ellipse cx="17" cy="76" rx="5" ry="3" fill="#1C1917" />
      <ellipse cx="27" cy="76" rx="5" ry="3" fill="#1C1917" />
      {/* arms confident pose */}
      <path d="M14 50 Q6 46 6 40" stroke="#F97316" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M30 50 Q38 44 44 48" stroke="#F97316" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* CHILD HEAD */}
      <ChildFace cx={22} cy={36} r={9.5} skinFill="#FBBF24" eyeFill="#1C1917"
        smileD="M16 39.5 Q22 44.5 28 39.5" />
      {/* hair */}
      <path d="M12 33 Q14 24 22 24 Q30 24 32 33" fill="#1C1917" />
      {/* sparkles */}
      <circle cx="6" cy="20" r="3.5" fill="#FDE68A" />
      <circle cx="10" cy="12" r="2" fill="#FCD34D" opacity="0.6" />
    </svg>
  );
}

/** Ihsan — child carefully painting a glowing star on a canvas */
export function IconIhsan() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#EEF2FF" />
      <ellipse cx="40" cy="74" rx="28" ry="5" fill="#C7D2FE" opacity="0.35" />
      {/* canvas on easel */}
      <rect x="12" y="12" width="38" height="32" rx="5" fill="white" stroke="#A5B4FC" strokeWidth="2" />
      <line x1="18" y1="44" x2="14" y2="68" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="44" x2="48" y2="68" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
      {/* star painted on canvas */}
      <path d="M31 16 L32.6 21.2 L38 21.2 L33.7 24.3 L35.3 29.5 L31 26.5 L26.7 29.5 L28.3 24.3 L24 21.2 L29.4 21.2Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.8" />
      <circle cx="44" cy="14" r="2.5" fill="#FDE68A" />
      <circle cx="10" cy="24" r="2" fill="#C7D2FE" />
      {/* CHILD with paintbrush */}
      <rect x="52" y="44" width="13" height="18" rx="5" fill="#6366F1" />
      <path d="M52 50 Q44 46 36 30" stroke="#6366F1" strokeWidth="5" fill="none" strokeLinecap="round" />
      <line x1="37" y1="32" x2="33" y2="24" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="33" cy="23" r="3" fill="#F59E0B" />
      <rect x="52" y="60" width="5.5" height="14" rx="2.5" fill="#4338CA" />
      <rect x="59" y="60" width="5.5" height="14" rx="2.5" fill="#4338CA" />
      <ChildFace cx={58} cy={37} r={8} skinFill="#FBBF24" eyeFill="#1C1917" smileD="M53 40 Q58 44.5 63 40" />
      <path d="M50 34 Q51 28 58 28 Q65 28 66 34" fill="#92400E" />
    </svg>
  );
}

/** Tawbah — child kneeling in dua, tears become flowers */
export function IconTawbah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F7FEE7" />
      <ellipse cx="40" cy="74" rx="28" ry="5" fill="#BEF264" opacity="0.4" />
      {/* rain / tear drops becoming flowers */}
      <path d="M20 10 Q21 6 22 10" fill="#86EFAC" opacity="0.7" />
      <path d="M28 6 Q29 2 30 6" fill="#86EFAC" opacity="0.6" />
      <path d="M36 12 Q37 8 38 12" fill="#BEF264" opacity="0.7" />
      {/* flowers sprouting */}
      <line x1="16" y1="68" x2="16" y2="52" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx={16 + Math.cos((a - 90) * Math.PI / 180) * 5} cy={48 + Math.sin((a - 90) * Math.PI / 180) * 5}
          rx="3" ry="2" transform={`rotate(${a},${16 + Math.cos((a - 90) * Math.PI / 180) * 5},${48 + Math.sin((a - 90) * Math.PI / 180) * 5})`} fill="#86EFAC" />
      ))}
      <circle cx="16" cy="48" r="3.5" fill="#4ADE80" />
      <line x1="60" y1="68" x2="60" y2="54" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx={60 + Math.cos((a - 90) * Math.PI / 180) * 4.5} cy={50 + Math.sin((a - 90) * Math.PI / 180) * 4.5}
          rx="2.5" ry="2" transform={`rotate(${a},${60 + Math.cos((a - 90) * Math.PI / 180) * 4.5},${50 + Math.sin((a - 90) * Math.PI / 180) * 4.5})`} fill="#FDE68A" />
      ))}
      <circle cx="60" cy="50" r="3" fill="#F59E0B" />
      {/* CHILD kneeling with hands raised */}
      <path d="M36 52 Q34 60 38 68 L42 68 Q46 60 44 52Z" fill="#65A30D" />
      <path d="M36 54 Q26 44 22 36" stroke="#65A30D" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M44 54 Q54 44 58 36" stroke="#65A30D" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="34" r="5" fill="#FBBF24" />
      <circle cx="58" cy="34" r="5" fill="#FBBF24" />
      <ChildFace cx={40} cy={44} r={9} skinFill="#FBBF24" eyeFill="#1C1917" smileD="M35 47 Q40 51.5 45 47" />
      <path d="M31 42 Q32 35 40 35 Q48 35 49 42" fill="#92400E" />
    </svg>
  );
}

/** Barakah — overflowing basket of fruit with golden sparkles */
export function IconBarakah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFFBEB" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#FDE68A" opacity="0.4" />
      {/* basket base */}
      <path d="M14 52 Q14 70 28 70 L52 70 Q66 70 66 52 L66 46 L14 46Z" fill="#D97706" />
      {/* basket weave */}
      <rect x="14" y="43" width="52" height="8" rx="3" fill="#F59E0B" />
      <line x1="26" y1="51" x2="26" y2="70" stroke="#B45309" strokeWidth="1.5" />
      <line x1="40" y1="51" x2="40" y2="70" stroke="#B45309" strokeWidth="1.5" />
      <line x1="54" y1="51" x2="54" y2="70" stroke="#B45309" strokeWidth="1.5" />
      {/* FRUITS overflowing */}
      {/* apple */}
      <circle cx="26" cy="38" r="9" fill="#EF4444" />
      <path d="M26 29 Q27 25 30 27" stroke="#15803D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* orange */}
      <circle cx="44" cy="36" r="8" fill="#FB923C" />
      <circle cx="44" cy="36" r="3" fill="#FED7AA" opacity="0.5" />
      {/* banana */}
      <path d="M55 28 Q62 32 58 44" stroke="#FCD34D" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* grape cluster */}
      <circle cx="18" cy="48" r="4" fill="#A855F7" />
      <circle cx="24" cy="44" r="4" fill="#A855F7" />
      <circle cx="16" cy="42" r="3.5" fill="#7C3AED" />
      {/* stars / sparkles */}
      <circle cx="64" cy="20" r="3" fill="#FCD34D" />
      <path d="M10 18 L11 21 L14 21 L11.5 23 L12.5 26 L10 24 L7.5 26 L8.5 23 L6 21 L9 21Z" fill="#FCD34D" opacity="0.8" transform="scale(0.7) translate(6, 6)" />
      <circle cx="68" cy="36" r="2" fill="#FDE68A" />
    </svg>
  );
}

/** Adab — child giving a respectful bow-greeting, hand on heart */
export function IconAdab() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FDF4FF" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#F0ABFC" opacity="0.35" />
      {/* ── CHILD A (left, greeting) ── */}
      <rect x="8" y="44" width="13" height="18" rx="5" fill="#D946EF" />
      {/* bowing torso */}
      <path d="M8 48 Q6 54 10 60" stroke="#D946EF" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* hand on heart */}
      <path d="M21 50 Q16 48 14 50" stroke="#D946EF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M12 48 C11.5 46.5 9 46.5 9 48.5 C9 50 11.5 52 14 54 C16.5 52 19 50 19 48.5 C19 46.5 16.5 46.5 16 48Z" fill="#F43F5E" />
      <rect x="8" y="60" width="5.5" height="14" rx="2.5" fill="#A21CAF" />
      <rect x="15" y="60" width="5.5" height="14" rx="2.5" fill="#A21CAF" />
      <ChildFace cx={14} cy={37} r={8.5} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M5.5 35 Q6.5 28 14 28 Q21.5 28 22.5 35" fill="#92400E" />
      {/* ── CHILD B (right, receiving) ── */}
      <rect x="56" y="44" width="13" height="18" rx="5" fill="#E879F9" />
      <path d="M56 52 Q64 50 68 52" stroke="#E879F9" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="56" y="60" width="5.5" height="14" rx="2.5" fill="#A21CAF" />
      <rect x="63" y="60" width="5.5" height="14" rx="2.5" fill="#A21CAF" />
      <ChildFace cx={62} cy={37} r={8.5} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M53.5 35 Q54.5 28 62 28 Q69.5 28 70.5 35" fill="#92400E" />
      {/* stars between them */}
      <circle cx="40" cy="30" r="4" fill="#F0ABFC" />
      <path d="M40 22 L41 25 L44 25 L41.5 27 L42.5 30 L40 28 L37.5 30 L38.5 27 L36 25 L39 25Z" fill="#D946EF" opacity="0.7" transform="scale(0.5) translate(40,10)" />
      <circle cx="40" cy="54" r="3" fill="#F0ABFC" opacity="0.6" />
    </svg>
  );
}

/** Birr — child offering a warm cup to a parent figure */
export function IconBirr() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#ECFEFF" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#A5F3FC" opacity="0.4" />
      {/* STEAMING CUP in centre */}
      <path d="M30 50 Q30 62 36 64 L50 64 Q56 62 56 50Z" fill="#0891B2" />
      <rect x="28" y="46" width="30" height="8" rx="4" fill="#06B6D4" />
      {/* steam wisps */}
      <path d="M36 42 Q34 38 36 34 Q38 30 36 26" stroke="#BAE6FD" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M43 44 Q41 40 43 36 Q45 32 43 28" stroke="#BAE6FD" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M50 42 Q48 38 50 34 Q52 30 50 26" stroke="#BAE6FD" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* CUP HANDLE */}
      <path d="M56 50 Q64 50 64 58 Q64 66 56 66" stroke="#0891B2" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* CHILD (left, offering) */}
      <rect x="4" y="44" width="13" height="20" rx="5" fill="#0E7490" />
      <path d="M17 50 Q24 48 30 50" stroke="#0E7490" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="4" y="62" width="5.5" height="14" rx="2.5" fill="#164E63" />
      <rect x="11" y="62" width="5.5" height="14" rx="2.5" fill="#164E63" />
      <ChildFace cx={10} cy={37} r={8.5} skinFill="#FBBF24" eyeFill="#1C1917" smileD="M5 40 Q10 44.5 15 40" />
      <path d="M1.5 35 Q2.5 28 10 28 Q17.5 28 18.5 35" fill="#92400E" />
      {/* PARENT figure (right, receiving) */}
      <rect x="58" y="38" width="16" height="26" rx="7" fill="#155E75" />
      <path d="M58 50 Q54 56 58 62" stroke="#155E75" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M74 50 Q78 56 74 62" stroke="#155E75" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M74 52 Q68 50 64 52" stroke="#155E75" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <circle cx="66" cy="28" r="11" fill="#FBBF24" />
      <path d="M58 25 Q59 16 66 16 Q73 16 74 25" fill="#92400E" />
      <circle cx="63" cy="27" r="2" fill="#1C1917" />
      <circle cx="69" cy="27" r="2" fill="#1C1917" />
      <path d="M61 32 Q66 36 71 32" stroke="#1C1917" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Haya' — child in modest dress surrounded by blossoming flowers */
export function IconHayaa() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF1F2" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#FECDD3" opacity="0.45" />
      {/* flowers left */}
      <line x1="12" y1="68" x2="12" y2="48" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx={12 + Math.cos((a - 90) * Math.PI / 180) * 6} cy={44 + Math.sin((a - 90) * Math.PI / 180) * 6}
          rx="4" ry="2.5" transform={`rotate(${a},${12 + Math.cos((a - 90) * Math.PI / 180) * 6},${44 + Math.sin((a - 90) * Math.PI / 180) * 6})`} fill="#FDA4AF" />
      ))}
      <circle cx="12" cy="44" r="4" fill="#FB7185" />
      {/* flowers right */}
      <line x1="68" y1="68" x2="68" y2="50" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx={68 + Math.cos((a - 90) * Math.PI / 180) * 5.5} cy={46 + Math.sin((a - 90) * Math.PI / 180) * 5.5}
          rx="3.5" ry="2.5" transform={`rotate(${a},${68 + Math.cos((a - 90) * Math.PI / 180) * 5.5},${46 + Math.sin((a - 90) * Math.PI / 180) * 5.5})`} fill="#FDE68A" />
      ))}
      <circle cx="68" cy="46" r="3.5" fill="#F59E0B" />
      {/* CHILD in hijab / modest dress */}
      {/* long dress */}
      <path d="M26 52 Q24 70 28 72 L52 72 Q56 70 54 52Z" fill="#FB7185" />
      {/* body */}
      <rect x="28" y="42" width="24" height="14" rx="6" fill="#F43F5E" />
      {/* arms */}
      <path d="M28 48 Q20 50 18 54" stroke="#F43F5E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M52 48 Q60 50 62 54" stroke="#F43F5E" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* hijab / head scarf */}
      <path d="M26 34 Q26 24 40 22 Q54 24 54 34 Q54 42 52 44 Q40 46 28 44 Q26 42 26 34Z" fill="#FDA4AF" />
      {/* face */}
      <circle cx="40" cy="34" r="9" fill="#FBBF24" />
      <circle cx="37" cy="33" r="1.8" fill="#1C1917" />
      <circle cx="43" cy="33" r="1.8" fill="#1C1917" />
      <circle cx="37.5" cy="32.5" r="0.7" fill="white" />
      <circle cx="43.5" cy="32.5" r="0.7" fill="white" />
      <path d="M36.5 38 Q40 41.5 43.5 38" stroke="#1C1917" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* butterflies */}
      <path d="M56 24 C54 20 50 22 52 26 C54 30 56 28 56 24Z" fill="#FDA4AF" opacity="0.8" />
      <path d="M56 24 C58 20 62 22 60 26 C58 30 56 28 56 24Z" fill="#FECDD3" opacity="0.8" />
      <circle cx="56" cy="24" r="1.5" fill="#F43F5E" />
    </svg>
  );
}

/** Ukhuwwah — two children linking arms with a glowing heart between them */
export function IconUkhuwwah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#EFF6FF" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#BAE6FD" opacity="0.4" />
      {/* GLOWING HEART in centre */}
      <circle cx="40" cy="34" r="14" fill="#DBEAFE" opacity="0.4" />
      <path d="M40 44 C32 37 24 33 24 26 C24 21 28 18 32 18 C35.5 18 38 20 40 22 C42 20 44.5 18 48 18 C52 18 56 21 56 26 C56 33 48 37 40 44Z" fill="#3B82F6" />
      {/* heart shine */}
      <path d="M30 22 Q32 19 36 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* ── LEFT child ── */}
      <rect x="4" y="48" width="13" height="18" rx="5" fill="#2563EB" />
      <path d="M17 54 Q24 50 28 52" stroke="#2563EB" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="4" y="64" width="5.5" height="14" rx="2.5" fill="#1D4ED8" />
      <rect x="11" y="64" width="5.5" height="14" rx="2.5" fill="#1D4ED8" />
      <ChildFace cx={10} cy={41} r={8.5} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M1.5 39 Q2.5 32 10 32 Q17.5 32 18.5 39" fill="#92400E" />
      {/* ── RIGHT child ── */}
      <rect x="63" y="48" width="13" height="18" rx="5" fill="#60A5FA" />
      <path d="M63 54 Q56 50 52 52" stroke="#60A5FA" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="63" y="64" width="5.5" height="14" rx="2.5" fill="#1D4ED8" />
      <rect x="70" y="64" width="5.5" height="14" rx="2.5" fill="#1D4ED8" />
      <ChildFace cx={70} cy={41} r={8.5} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M61.5 39 Q62.5 32 70 32 Q77.5 32 78.5 39" fill="#92400E" />
      {/* LINKED HANDS */}
      <path d="M28 52 Q40 58 52 52" stroke="#93C5FD" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="55" r="4" fill="#BFDBFE" />
    </svg>
  );
}

/** Niyyah — child with a glowing heart of pure intention on their chest */
export function IconNiyyah() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FAF5FF" />
      <ellipse cx="40" cy="74" rx="28" ry="5" fill="#E9D5FF" opacity="0.4" />
      {/* glow rays from heart */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line key={i}
          x1={40 + Math.cos(a * Math.PI / 180) * 18} y1={48 + Math.sin(a * Math.PI / 180) * 18}
          x2={40 + Math.cos(a * Math.PI / 180) * 24} y2={48 + Math.sin(a * Math.PI / 180) * 24}
          stroke="#C084FC" strokeWidth="2" strokeLinecap="round" opacity="0.5"
        />
      ))}
      {/* CHILD body */}
      <rect x="28" y="44" width="24" height="20" rx="7" fill="#9333EA" />
      {/* arms */}
      <path d="M28 50 Q20 48 16 52" stroke="#9333EA" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M52 50 Q60 48 64 52" stroke="#9333EA" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* legs */}
      <rect x="28" y="62" width="9" height="14" rx="4" fill="#7E22CE" />
      <rect x="43" y="62" width="9" height="14" rx="4" fill="#7E22CE" />
      {/* GLOWING HEART on chest */}
      <circle cx="40" cy="52" r="9" fill="#F0ABFC" opacity="0.35" />
      <path d="M40 58 C35 54 30 51 30 47 C30 44 32.5 42 35 42 C37 42 39 43.5 40 45 C41 43.5 43 42 45 42 C47.5 42 50 44 50 47 C50 51 45 54 40 58Z" fill="#A855F7" />
      <path d="M34 44.5 Q35.5 43 38 43.5" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* HEAD */}
      <ChildFace cx={40} cy={34} r={10} skinFill="#FBBF24" eyeFill="#1C1917" smileD="M34 37.5 Q40 42 46 37.5" />
      <path d="M30 31 Q31 23 40 23 Q49 23 50 31" fill="#92400E" />
      {/* sparkles */}
      <circle cx="14" cy="28" r="3" fill="#E9D5FF" />
      <circle cx="66" cy="22" r="2.5" fill="#DDD6FE" />
    </svg>
  );
}

/** Taqwa — child holding a crescent-star shield, looking upward in awe */
export function IconTaqwa() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0FDF4" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#BBF7D0" opacity="0.45" />
      {/* sky stars */}
      <circle cx="18" cy="12" r="2.5" fill="#FCD34D" />
      <circle cx="64" cy="10" r="3" fill="#FCD34D" opacity="0.8" />
      <circle cx="50" cy="16" r="2" fill="#FCD34D" opacity="0.6" />
      <circle cx="30" cy="8" r="2" fill="#FDE68A" opacity="0.7" />
      {/* SHIELD */}
      <path d="M52 28 Q52 52 40 58 Q28 52 28 28 L40 22Z" fill="#059669" />
      <path d="M50 30 Q50 50 40 55 Q30 50 30 30 L40 24Z" fill="#10B981" />
      {/* crescent on shield */}
      <path d="M35 36 A7 7 0 1 1 35 50 A10 10 0 0 0 35 36Z" fill="#FCD34D" />
      {/* star on shield */}
      <path d="M44 34 L45 37 L48 37 L45.5 39 L46.5 42 L44 40 L41.5 42 L42.5 39 L40 37 L43 37Z" fill="#FCD34D" transform="scale(0.7) translate(19, 16)" />
      {/* CHILD holding shield */}
      <rect x="26" y="52" width="16" height="16" rx="6" fill="#16A34A" />
      {/* arm holding shield up */}
      <path d="M26 58 Q20 52 22 42" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* other arm */}
      <path d="M42 58 Q50 56 54 58" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* legs */}
      <rect x="26" y="66" width="6" height="12" rx="3" fill="#15803D" />
      <rect x="36" y="66" width="6" height="12" rx="3" fill="#15803D" />
      {/* HEAD looking up */}
      <ChildFace cx={34} cy={42} r={10} skinFill="#FBBF24" eyeFill="#1C1917" smileD="M28 45 Q34 49 40 45" />
      <path d="M24 39 Q25 31 34 31 Q43 31 44 39" fill="#92400E" />
    </svg>
  );
}

/** Wara' — child gently pushing away a tempting treat jar */
export function IconWara() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF7ED" />
      <ellipse cx="40" cy="74" rx="30" ry="5" fill="#FED7AA" opacity="0.4" />
      {/* CANDY JAR (right side) */}
      <path d="M50 52 Q50 68 56 70 L70 70 Q76 68 76 52Z" fill="#FCA5A5" />
      <rect x="48" y="46" width="30" height="10" rx="5" fill="#FB7185" />
      {/* jar lid */}
      <rect x="52" y="38" width="22" height="10" rx="5" fill="#F43F5E" />
      {/* candies inside */}
      <circle cx="58" cy="58" r="4" fill="#FDE68A" />
      <circle cx="66" cy="60" r="3.5" fill="#86EFAC" />
      <circle cx="62" cy="54" r="3" fill="#C4B5FD" />
      {/* question mark / uncertain symbol */}
      <path d="M42 30 Q42 20 48 20 Q54 20 54 28 Q54 34 48 36" stroke="#F97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="40" r="2" fill="#F97316" />
      {/* CHILD pushing away */}
      <rect x="14" y="46" width="14" height="20" rx="6" fill="#EA580C" />
      <path d="M28 52 Q36 48 44 50" stroke="#EA580C" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* palm "stop" gesture */}
      <rect x="44" y="44" width="8" height="10" rx="3" fill="#FBBF24" />
      <rect x="14" y="64" width="5.5" height="12" rx="2.5" fill="#C2410C" />
      <rect x="22" y="64" width="5.5" height="12" rx="2.5" fill="#C2410C" />
      <ChildFace cx={21} cy={39} r={9} skinFill="#FBBF24" eyeFill="#1C1917" />
      <path d="M12 37 Q13 30 21 30 Q29 30 30 37" fill="#1C1917" />
      {/* X mark over jar */}
      <path d="M50 36 L60 46 M60 36 L50 46" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Ikhlas — child holding up a glowing white heart toward a golden light */
export function IconIkhlas() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0F9FF" />
      <ellipse cx="40" cy="74" rx="28" ry="5" fill="#BAE6FD" opacity="0.4" />
      {/* golden light from above */}
      <circle cx="40" cy="8" r="7" fill="#FDE68A" opacity="0.7" />
      <circle cx="40" cy="8" r="4.5" fill="#FCD34D" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line key={i}
          x1={40 + Math.cos(a * Math.PI / 180) * 9} y1={8 + Math.sin(a * Math.PI / 180) * 9}
          x2={40 + Math.cos(a * Math.PI / 180) * 14} y2={8 + Math.sin(a * Math.PI / 180) * 14}
          stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6"
        />
      ))}
      {/* light rays downward */}
      <path d="M34 14 Q30 28 36 36" stroke="#FDE68A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M46 14 Q50 28 44 36" stroke="#FDE68A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      {/* CHILD offering heart upward */}
      <rect x="28" y="50" width="24" height="18" rx="7" fill="#0EA5E9" />
      {/* arms raised holding heart */}
      <path d="M28 56 Q22 48 22 36" stroke="#0EA5E9" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M52 56 Q58 48 58 36" stroke="#0EA5E9" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* legs */}
      <rect x="28" y="66" width="9" height="12" rx="4" fill="#0369A1" />
      <rect x="43" y="66" width="9" height="12" rx="4" fill="#0369A1" />
      {/* THE PURE HEART held up */}
      <circle cx="40" cy="34" r="11" fill="#E0F2FE" opacity="0.5" />
      <path d="M40 42 C33 36 26 32 26 26 C26 21 30 18 34 18 C36.5 18 39 19.5 40 21 C41 19.5 43.5 18 46 18 C50 18 54 21 54 26 C54 32 47 36 40 42Z" fill="white" stroke="#7DD3FC" strokeWidth="1.5" />
      <path d="M32 23 Q34 20.5 37 21.5" stroke="#93C5FD" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* HEAD */}
      <ChildFace cx={40} cy={46} r={9.5} skinFill="#FBBF24" eyeFill="#1C1917" smileD="M34.5 49.5 Q40 54 45.5 49.5" />
      <path d="M30.5 43.5 Q31.5 36 40 36 Q48.5 36 49.5 43.5" fill="#92400E" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAMIC VOCABULARY ICONS (unchanged — Quran, Masjid, Tasbih, PrayerMat)
// ─────────────────────────────────────────────────────────────────────────────

export function IconQuran() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="20" fill="#ECFDF5" />
      <rect x="14" y="12" width="52" height="60" rx="6" fill="#065F46" />
      <rect x="18" y="12" width="8" height="60" rx="4" fill="#047857" />
      <rect x="20" y="16" width="42" height="52" rx="4" fill="#D1FAE5" />
      <path d="M30 28 Q40 22 50 28 Q44 24 40 26 Q36 24 30 28Z" fill="#059669" />
      <line x1="28" y1="36" x2="52" y2="36" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="42" x2="52" y2="42" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="48" x2="52" y2="48" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="54" x2="48" y2="54" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 10 L41.2 13.5 L45 13.5 L42 15.8 L43.2 19 L40 17 L36.8 19 L38 15.8 L35 13.5 L38.8 13.5Z" fill="#34D399" />
    </svg>
  );
}

export function IconMasjid() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="20" fill="#EFF6FF" />
      <rect x="4" y="4" width="72" height="50" rx="16" fill="#DBEAFE" opacity="0.5" />
      <path d="M20 46 Q20 20 40 18 Q60 20 60 46Z" fill="#3B82F6" />
      <path d="M24 46 Q24 24 40 22 Q56 24 56 46Z" fill="#60A5FA" opacity="0.6" />
      <rect x="10" y="30" width="8" height="32" rx="2" fill="#2563EB" />
      <path d="M10 30 Q14 22 18 30Z" fill="#3B82F6" />
      <rect x="62" y="30" width="8" height="32" rx="2" fill="#2563EB" />
      <path d="M62 30 Q66 22 70 30Z" fill="#3B82F6" />
      <path d="M44 18 A7 7 0 1 1 44 32 A11 11 0 0 0 44 18Z" fill="#FCD34D" />
      <path d="M34 62 Q34 52 40 52 Q46 52 46 62Z" fill="#1D4ED8" />
      <rect x="34" y="60" width="12" height="8" fill="#1D4ED8" />
      <path d="M24 38 Q27 34 30 38Z" fill="#BFDBFE" />
      <path d="M50 38 Q53 34 56 38Z" fill="#BFDBFE" />
      <rect x="4" y="68" width="72" height="8" rx="4" fill="#BFDBFE" opacity="0.5" />
      <circle cx="62" cy="12" r="5" fill="#FCD34D" opacity="0.8" />
      <circle cx="65" cy="10" r="3" fill="#DBEAFE" />
    </svg>
  );
}

export function IconTasbih() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="20" fill="#FDF4FF" />
      {[0,24,48,72,96,120,144,168,192,216,240,264,288,312,336].map((a,i) => (
        <circle key={i} cx={40+Math.cos(a*Math.PI/180)*26} cy={38+Math.sin(a*Math.PI/180)*26} r="5" fill={i%3===0?"#A855F7":i%3===1?"#C084FC":"#E879F9"} />
      ))}
      <circle cx="40" cy="12" r="5" fill="#7C3AED" />
      <line x1="40" y1="17" x2="38" y2="28" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="17" x2="40" y2="30" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="17" x2="42" y2="28" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="38" r="12" fill="#FDF4FF" />
      <path d="M34 38 C33 35 30 35 30 38 C30 40 31.5 41.5 34 43.5 C36.5 41.5 38 40 38 38 C38 35 35 35 34 38Z" fill="#A855F7" opacity="0.6" />
    </svg>
  );
}

export function IconPrayerMat() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="20" fill="#FFF7ED" />
      <path d="M10 58 Q10 68 20 68 L60 68 Q70 68 70 58 L70 30 Q70 20 60 20 L20 20 Q10 20 10 30Z" fill="#DC2626" opacity="0.8" />
      <path d="M14 55 Q14 64 20 64 L60 64 Q66 64 66 55 L66 33 Q66 24 60 24 L20 24 Q14 24 14 33Z" fill="#EF4444" opacity="0.6" />
      <path d="M18 52 Q18 60 22 60 L58 60 Q62 60 62 52 L62 36 Q62 28 58 28 L22 28 Q18 28 18 36Z" fill="#FEF3C7" opacity="0.9" />
      <path d="M28 36 Q40 24 52 36 L52 60 L28 60Z" fill="#F59E0B" opacity="0.3" />
      <path d="M28 36 Q40 26 52 36" stroke="#D97706" strokeWidth="2.5" fill="none" />
      <path d="M40 32 L43 42 L40 44 L37 42Z" fill="#F59E0B" />
      <circle cx="40" cy="30" r="3" fill="#FCD34D" />
      {[16,22,28,34,40,46,52,58,64].map((x,i) => (
        <line key={i} x1={x} y1="68" x2={x} y2="74" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      ))}
      {[16,22,28,34,40,46,52,58,64].map((x,i) => (
        <line key={i} x1={x} y1="20" x2={x} y2="14" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRE-BUILT DU'A DATA  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export const PRESET_DUAS = [
  {
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    transliteration: "Bismillahir rahmanir raheem",
    meaning: "In the name of Allah, the Most Gracious, the Most Merciful",
    when: "before eating",
    color: "from-green-50 to-emerald-50", border: "border-green-200",
    textColor: "text-green-900", subColor: "text-green-700",
    badge: "bg-green-100 text-green-700", emoji: "🍽️",
  },
  {
    arabic: "اَلْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning: "All praise is for Allah",
    when: "after eating",
    color: "from-yellow-50 to-amber-50", border: "border-yellow-200",
    textColor: "text-yellow-900", subColor: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700", emoji: "✨",
  },
  {
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Allahumma barik lana fima razaqtana wa qina adhaban naar",
    meaning: "O Allah, bless us in what You have provided us and protect us from the punishment of the Fire",
    when: "before eating",
    color: "from-orange-50 to-red-50", border: "border-orange-200",
    textColor: "text-orange-900", subColor: "text-orange-700",
    badge: "bg-orange-100 text-orange-700", emoji: "🤲",
  },
  {
    arabic: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ",
    transliteration: "Bismika Allahumma ahya wa amoot",
    meaning: "In Your name, O Allah, I live and I die",
    when: "before sleep",
    color: "from-indigo-50 to-violet-50", border: "border-indigo-200",
    textColor: "text-indigo-900", subColor: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-700", emoji: "🌙",
  },
  {
    arabic: "اَلْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushoor",
    meaning: "Praise be to Allah Who has brought us back to life after causing us to die, and to Him is the Resurrection",
    when: "waking up",
    color: "from-sky-50 to-blue-50", border: "border-sky-200",
    textColor: "text-sky-900", subColor: "text-sky-700",
    badge: "bg-sky-100 text-sky-700", emoji: "☀️",
  },
  {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbi ishrah li sadri wa yassir li amri",
    meaning: "My Lord, expand my chest and ease my task for me",
    when: "before study",
    color: "from-blue-50 to-cyan-50", border: "border-blue-200",
    textColor: "text-blue-900", subColor: "text-blue-700",
    badge: "bg-blue-100 text-blue-700", emoji: "📖",
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    meaning: "Allah is sufficient for us, and He is the Best Disposer of affairs",
    when: "during hardship",
    color: "from-purple-50 to-violet-50", border: "border-purple-200",
    textColor: "text-purple-900", subColor: "text-purple-700",
    badge: "bg-purple-100 text-purple-700", emoji: "💜",
  },
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-naar",
    meaning: "Our Lord, give us good in this world and good in the next world, and save us from the punishment of the Fire",
    when: "starting a task",
    color: "from-rose-50 to-pink-50", border: "border-rose-200",
    textColor: "text-rose-900", subColor: "text-rose-700",
    badge: "bg-rose-100 text-rose-700", emoji: "🌹",
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    meaning: "O Allah, I seek refuge in You from worry and grief",
    when: "during hardship",
    color: "from-slate-50 to-gray-50", border: "border-slate-200",
    textColor: "text-slate-900", subColor: "text-slate-700",
    badge: "bg-slate-100 text-slate-700", emoji: "🤍",
  },
  {
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ",
    transliteration: "Bismillahi tawakkaltu 'alallah",
    meaning: "In the name of Allah, I place my trust in Allah",
    when: "before leaving home",
    color: "from-teal-50 to-cyan-50", border: "border-teal-200",
    textColor: "text-teal-900", subColor: "text-teal-700",
    badge: "bg-teal-100 text-teal-700", emoji: "🚪",
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
    transliteration: "Allahumma inni as'aluka khayral mawliji wa khayral makhraji",
    meaning: "O Allah, I ask You for the best entering and the best leaving",
    when: "entering home",
    color: "from-emerald-50 to-green-50", border: "border-emerald-200",
    textColor: "text-emerald-900", subColor: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700", emoji: "🏠",
  },
  {
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    meaning: "My Lord, increase me in knowledge",
    when: "before study",
    color: "from-violet-50 to-purple-50", border: "border-violet-200",
    textColor: "text-violet-900", subColor: "text-violet-700",
    badge: "bg-violet-100 text-violet-700", emoji: "📚",
  },
  {
    arabic: "اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ",
    transliteration: "Allahummaghfir li wa liwaalidayya",
    meaning: "O Allah, forgive me and my parents",
    when: "dua for parents",
    color: "from-pink-50 to-rose-50", border: "border-pink-200",
    textColor: "text-pink-900", subColor: "text-pink-700",
    badge: "bg-pink-100 text-pink-700", emoji: "❤️",
  },
  {
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    transliteration: "Subhanakallahumma wa bihamdika ashhadu alla ilaha illa anta astaghfiruka wa atubu ilayk",
    meaning: "Glory be to You O Allah, with Your praise I witness that there is no god but You, I seek Your forgiveness and turn to You in repentance",
    when: "seeking forgiveness",
    color: "from-amber-50 to-yellow-50", border: "border-amber-200",
    textColor: "text-amber-900", subColor: "text-amber-700",
    badge: "bg-amber-100 text-amber-700", emoji: "🌟",
  },
  {
    arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد",
    transliteration: "Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    meaning: "O Allah, send blessings and peace upon our Prophet Muhammad",
    when: "sending salawat",
    color: "from-lime-50 to-green-50", border: "border-lime-200",
    textColor: "text-lime-900", subColor: "text-lime-700",
    badge: "bg-lime-100 text-lime-700", emoji: "🌿",
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
    transliteration: "Allahumma inni as'alukal-'afiyah",
    meaning: "O Allah, I ask You for good health and well-being",
    when: "for health",
    color: "from-cyan-50 to-sky-50", border: "border-cyan-200",
    textColor: "text-cyan-900", subColor: "text-cyan-700",
    badge: "bg-cyan-100 text-cyan-700", emoji: "💙",
  },
  {
    arabic: "اللَّهُمَّ يَسِّرْ وَلَا تُعَسِّرْ",
    transliteration: "Allahumma yassir wa la tu'assir",
    meaning: "O Allah, make it easy and do not make it difficult",
    when: "before a challenge",
    color: "from-fuchsia-50 to-pink-50", border: "border-fuchsia-200",
    textColor: "text-fuchsia-900", subColor: "text-fuchsia-700",
    badge: "bg-fuchsia-100 text-fuchsia-700", emoji: "🌈",
  },
  {
    arabic: "اللَّهُمَّ آمِنَّا فِي أَوْطَانِنَا",
    transliteration: "Allahumma aaminna fi awtanina",
    meaning: "O Allah, grant us peace in our homelands",
    when: "for safety",
    color: "from-orange-50 to-amber-50", border: "border-orange-200",
    textColor: "text-orange-900", subColor: "text-orange-700",
    badge: "bg-orange-100 text-orange-700", emoji: "🛡️",
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ حُسْنَ الْخَاتِمَةِ",
    transliteration: "Allahumma inni as'aluka husnal-khatimah",
    meaning: "O Allah, I ask You for a good ending",
    when: "before sleep",
    color: "from-indigo-50 to-blue-50", border: "border-indigo-200",
    textColor: "text-indigo-900", subColor: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-700", emoji: "✨",
  },
  {
    arabic: "اللَّهُمَّ اجْعَلْنَا مِنَ الشَّاكِرِينَ",
    transliteration: "Allahumma-j'alna minas-shaakirin",
    meaning: "O Allah, make us among the grateful",
    when: "after eating",
    color: "from-yellow-50 to-lime-50", border: "border-yellow-200",
    textColor: "text-yellow-900", subColor: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700", emoji: "🌻",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ISLAMIC VALUE TILES  (unchanged keys — only icons swapped)
// ─────────────────────────────────────────────────────────────────────────────

export const ISLAMIC_VALUE_TILES = [
  { value: "Sabr — patience in hardship and difficulty",                           label: "Sabr",        icon: IconSabr,        bg: "bg-violet-100", ring: "ring-violet-500", text: "text-violet-700" },
  { value: "Shukr — gratitude to Allah for all blessings",                         label: "Shukr",       icon: IconShukr,       bg: "bg-amber-100",  ring: "ring-amber-500",  text: "text-amber-700"  },
  { value: "Sadaqah — giving generously to those in need",                          label: "Sadaqah",     icon: IconSadaqah,     bg: "bg-rose-100",   ring: "ring-rose-500",   text: "text-rose-700"   },
  { value: "Sidq — honesty and truthfulness in all situations",                     label: "Honesty",     icon: IconHonesty,     bg: "bg-green-100",  ring: "ring-green-500",  text: "text-green-700"  },
  { value: "Rahma — kindness and compassion toward all living things",              label: "Kindness",    icon: IconKindness,    bg: "bg-orange-100", ring: "ring-orange-500", text: "text-orange-700" },
  { value: "Tawakkul — trusting Allah after doing your best",                       label: "Tawakkul",    icon: IconTawakkul,    bg: "bg-blue-100",   ring: "ring-blue-500",   text: "text-blue-700"   },
  { value: "Salah — establishing prayer as the anchor of every day",                label: "Salah",       icon: IconSalah,       bg: "bg-emerald-100",ring: "ring-emerald-500",text: "text-emerald-700"},
  { value: "Respecting parents and elders with love and care",                      label: "Respect",     icon: IconRespect,     bg: "bg-purple-100", ring: "ring-purple-500", text: "text-purple-700" },
  { value: "Afw — forgiveness, letting go of anger for Allah's sake",               label: "Forgiveness", icon: IconForgiveness, bg: "bg-pink-100",   ring: "ring-pink-500",   text: "text-pink-700"   },
  { value: "Saying Bismillah before every action",                                  label: "Bismillah",   icon: IconBismillah,   bg: "bg-teal-100",   ring: "ring-teal-500",   text: "text-teal-700"   },
  { value: "Taharah — cleanliness of body, clothes, and space",                     label: "Taharah",     icon: IconCleanliness, bg: "bg-sky-100",    ring: "ring-sky-500",    text: "text-sky-700"    },
  { value: "Courage to do right even when it is difficult",                          label: "Courage",     icon: IconCourage,     bg: "bg-yellow-100",   ring: "ring-yellow-500",  text: "text-yellow-700"  },
  { value: "Ihsan — doing every action with excellence and beauty",                   label: "Ihsan",       icon: IconIhsan,       bg: "bg-indigo-100",   ring: "ring-indigo-500",  text: "text-indigo-700"  },
  { value: "Tawbah — turning back to Allah with sincere repentance",                  label: "Tawbah",      icon: IconTawbah,      bg: "bg-lime-100",     ring: "ring-lime-500",    text: "text-lime-700"    },
  { value: "Barakah — seeking and recognising Allah's blessings in everything",       label: "Barakah",     icon: IconBarakah,     bg: "bg-amber-100",    ring: "ring-amber-500",   text: "text-amber-700"   },
  { value: "Adab — good manners and respectful etiquette toward everyone",            label: "Adab",        icon: IconAdab,        bg: "bg-fuchsia-100",  ring: "ring-fuchsia-500", text: "text-fuchsia-700" },
  { value: "Birr — righteousness and kindness especially toward parents",             label: "Birr",        icon: IconBirr,        bg: "bg-cyan-100",     ring: "ring-cyan-500",    text: "text-cyan-700"    },
  { value: "Haya' — modesty and a natural sense of goodness in behaviour",            label: "Haya'",       icon: IconHayaa,       bg: "bg-rose-100",     ring: "ring-rose-500",    text: "text-rose-700"    },
  { value: "Ukhuwwah — loving brotherhood and sisterhood for the sake of Allah",      label: "Ukhuwwah",    icon: IconUkhuwwah,    bg: "bg-blue-100",     ring: "ring-blue-500",    text: "text-blue-700"    },
  { value: "Niyyah — acting with pure and sincere intentions for Allah alone",        label: "Niyyah",      icon: IconNiyyah,      bg: "bg-purple-100",   ring: "ring-purple-500",  text: "text-purple-700"  },
  { value: "Taqwa — God-consciousness, always aware that Allah is watching",          label: "Taqwa",       icon: IconTaqwa,       bg: "bg-emerald-100",  ring: "ring-emerald-500", text: "text-emerald-700" },
  { value: "Wara' — staying away from doubtful things to protect one's deen",         label: "Wara'",       icon: IconWara,        bg: "bg-orange-100",   ring: "ring-orange-500",  text: "text-orange-700"  },
  { value: "Ikhlas — sincere devotion with no desire for praise or recognition",      label: "Ikhlas",      icon: IconIkhlas,      bg: "bg-sky-100",      ring: "ring-sky-500",     text: "text-sky-700"     },
];