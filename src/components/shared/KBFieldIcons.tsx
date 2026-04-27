/**
 * KBFieldIcons — SVG illustrations for visual pickers in Knowledge Base fields.
 * All icons are 48×48 viewBox for use in VisualPicker tiles.
 *
 * Covers: Time of Day, Camera Hint, Tone, Color Style, Lighting Style
 */

// ══════════════════════════════════════════════════════════════════
// TIME OF DAY
// ══════════════════════════════════════════════════════════════════

export function MorningSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#E8F4FD" rx="6" />
      {/* Sky gradient band */}
      <rect width="48" height="28" fill="#B3E5FC" rx="6" />
      {/* Ground */}
      <rect y="28" width="48" height="20" fill="#C8E6C9" rx="0" />
      {/* Horizon glow */}
      <ellipse cx="24" cy="28" rx="24" ry="6" fill="#FFF9C4" opacity="0.7" />
      {/* Sun rising */}
      <circle cx="24" cy="30" r="10" fill="#FFD93D" />
      <circle cx="24" cy="30" r="13" fill="#FFD93D" opacity="0.2" />
      {/* Ray lines */}
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i}
          x1={24 + Math.cos(a * Math.PI / 180) * 14}
          y1={30 + Math.sin(a * Math.PI / 180) * 14}
          x2={24 + Math.cos(a * Math.PI / 180) * 18}
          y2={30 + Math.sin(a * Math.PI / 180) * 18}
          stroke="#FFB300" strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
      {/* "Rising" — sun half below horizon: mask bottom half */}
      <rect y="28" width="48" height="20" fill="#C8E6C9" />
      {/* Visible top half of sun */}
      <path d="M14 28 A10 10 0 0 1 34 28Z" fill="#FFD93D" />
      {/* Birds */}
      <path d="M8 18 Q10 16 12 18" stroke="#546E7A" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M18 14 Q20 12 22 14" stroke="#546E7A" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Label zone */}
      <text x="24" y="44" textAnchor="middle" fontSize="5" fill="#37474F" fontFamily="sans-serif" fontWeight="bold">Morning</text>
    </svg>
  );
}

export function AfternoonSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF8E1" rx="6" />
      {/* Sky */}
      <rect width="48" height="32" fill="#87CEEB" rx="6" />
      {/* Ground */}
      <rect y="32" width="48" height="16" fill="#A5D6A7" />
      {/* Sun — high center */}
      <circle cx="24" cy="14" r="8" fill="#FFD93D" />
      <circle cx="24" cy="14" r="11" fill="#FFD93D" opacity="0.2" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i}
          x1={24 + Math.cos(a * Math.PI / 180) * 12}
          y1={14 + Math.sin(a * Math.PI / 180) * 12}
          x2={24 + Math.cos(a * Math.PI / 180) * 16}
          y2={14 + Math.sin(a * Math.PI / 180) * 16}
          stroke="#FFB300" strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
      {/* Clouds */}
      <ellipse cx="10" cy="22" rx="8" ry="4" fill="#FFF" opacity="0.8" />
      <ellipse cx="16" cy="20" rx="6" ry="4" fill="#FFF" opacity="0.8" />
      <ellipse cx="38" cy="20" rx="7" ry="3.5" fill="#FFF" opacity="0.8" />
      {/* Ground detail */}
      <ellipse cx="24" cy="40" rx="10" ry="3" fill="#81C784" opacity="0.5" />
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#37474F" fontFamily="sans-serif" fontWeight="bold">Afternoon</text>
    </svg>
  );
}

export function EveningSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FCE4EC" rx="6" />
      {/* Sky gradient */}
      <rect width="48" height="30" fill="#FF8A65" opacity="0.6" rx="6" />
      <rect width="48" height="20" fill="#CE93D8" opacity="0.5" rx="6" />
      {/* Horizon glow */}
      <ellipse cx="24" cy="30" rx="24" ry="8" fill="#FF7043" opacity="0.4" />
      {/* Setting sun */}
      <path d="M14 30 A10 10 0 0 1 34 30Z" fill="#FF7043" />
      <ellipse cx="24" cy="30" rx="10" ry="2" fill="#FF5722" opacity="0.4" />
      {/* Ground/silhouette */}
      <rect y="30" width="48" height="18" fill="#1A237E" opacity="0.7" />
      {/* Building silhouettes */}
      <rect x="5" y="24" width="6" height="8" fill="#1A237E" opacity="0.8" />
      <rect x="14" y="20" width="5" height="12" fill="#1A237E" opacity="0.8" />
      <rect x="33" y="22" width="5" height="10" fill="#1A237E" opacity="0.8" />
      {/* Stars */}
      <circle cx="38" cy="8" r="1" fill="#FFF9C4" opacity="0.9" />
      <circle cx="12" cy="12" r="0.8" fill="#FFF9C4" opacity="0.7" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#FFF" fontFamily="sans-serif" fontWeight="bold">Evening</text>
    </svg>
  );
}

export function GoldenHourSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ghSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8F00" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFECB3" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#ghSky)" rx="6" />
      {/* Ground */}
      <rect y="32" width="48" height="16" fill="#5D4037" opacity="0.6" />
      {/* Golden glow halo */}
      <ellipse cx="24" cy="30" rx="20" ry="10" fill="#FFD54F" opacity="0.4" />
      {/* Sun low on horizon */}
      <circle cx="24" cy="30" r="8" fill="#FF8F00" />
      <circle cx="24" cy="30" r="12" fill="#FFD54F" opacity="0.3" />
      <circle cx="24" cy="30" r="16" fill="#FFD54F" opacity="0.15" />
      {/* Light rays */}
      {[-60,-30,0,30,60,90,120,150,180,210,240,270].map((a, i) => (
        <line key={i}
          x1={24 + Math.cos(a * Math.PI / 180) * 18}
          y1={30 + Math.sin(a * Math.PI / 180) * 18}
          x2={24 + Math.cos(a * Math.PI / 180) * 24}
          y2={30 + Math.sin(a * Math.PI / 180) * 24}
          stroke="#FF8F00" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"
        />
      ))}
      {/* Silhouette tree */}
      <rect x="6" y="20" width="2" height="14" fill="#3E2723" />
      <ellipse cx="7" cy="18" rx="5" ry="7" fill="#2E7D32" opacity="0.6" />
      <text x="24" y="46" textAnchor="middle" fontSize="4" fill="#FFF8E1" fontFamily="sans-serif" fontWeight="bold">Golden Hour</text>
    </svg>
  );
}

export function NightTimeSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ntBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050918" />
          <stop offset="100%" stopColor="#0D1B4A" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#ntBg)" rx="6" />
      {/* Ground */}
      <rect y="36" width="48" height="12" fill="#0A0F1E" rx="0" />
      {/* Stars */}
      {[[8,6],[18,4],[30,8],[40,5],[12,16],[25,12],[38,18],[6,24],[44,22]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.2 : 0.7} fill="#E8E8FF" opacity={0.5 + (i * 0.05)} />
      ))}
      {/* Crescent moon */}
      <path d="M30 10 A8 8 0 1 1 30 26 A5.5 5.5 0 1 0 30 10Z" fill="#C9A84C" />
      {/* Mosque silhouette */}
      <rect x="16" y="22" width="16" height="16" fill="#060D24" />
      <path d="M16 22 Q24 14 32 22Z" fill="#060D24" />
      <rect x="20" y="12" width="8" height="10" fill="#060D24" />
      <path d="M20 12 Q24 8 28 12Z" fill="#060D24" />
      <rect x="23" y="5" width="2" height="7" fill="#C9A84C" opacity="0.8" />
      {/* Soft glow */}
      <ellipse cx="24" cy="36" rx="12" ry="3" fill="#1A2456" opacity="0.8" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#B0BEC5" fontFamily="sans-serif" fontWeight="bold">Night</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// CAMERA HINT
// ══════════════════════════════════════════════════════════════════

function CameraFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#ECEFF1" rx="6" />
      {children}
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#37474F" fontFamily="sans-serif" fontWeight="bold">{label}</text>
    </svg>
  );
}

export function CameraWideSvg() {
  return (
    <CameraFrame label="Wide Shot">
      {/* Wide frame lines */}
      <rect x="3" y="8" width="42" height="30" rx="2" fill="none" stroke="#546E7A" strokeWidth="1.5" strokeDasharray="2 1" />
      {/* Wide landscape inside */}
      <rect x="3" y="8" width="42" height="30" rx="2" fill="#B3E5FC" opacity="0.3" />
      <rect x="3" y="28" width="42" height="10" rx="0" fill="#A5D6A7" opacity="0.4" />
      {/* Tiny figure - small to show scale */}
      <ellipse cx="24" cy="27" rx="2" ry="2" fill="#5D4037" />
      <rect x="22.5" y="28.5" width="3" height="5" rx="1" fill="#5D4037" />
      {/* Horizon trees */}
      <rect x="8" y="20" width="1.5" height="8" fill="#388E3C" opacity="0.5" />
      <ellipse cx="8.75" cy="18" rx="3" ry="4" fill="#43A047" opacity="0.5" />
      <rect x="36" y="22" width="1.5" height="6" fill="#388E3C" opacity="0.5" />
      <ellipse cx="36.75" cy="20" rx="2.5" ry="3" fill="#43A047" opacity="0.5" />
      {/* Frame label arrows */}
      <line x1="3" y1="5" x2="45" y2="5" stroke="#546E7A" strokeWidth="1" markerEnd="url(#a)" />
    </CameraFrame>
  );
}

export function CameraMediumSvg() {
  return (
    <CameraFrame label="Medium Shot">
      <rect x="8" y="6" width="32" height="32" rx="2" fill="none" stroke="#546E7A" strokeWidth="1.5" strokeDasharray="2 1" />
      <rect x="8" y="6" width="32" height="32" rx="2" fill="#FFF9C4" opacity="0.3" />
      {/* Figure — waist up */}
      <ellipse cx="24" cy="20" rx="5" ry="5" fill="#F9A825" />
      <rect x="19" y="24" width="10" height="10" rx="2" fill="#1565C0" />
      <rect x="14" y="25" width="5" height="8" rx="2" fill="#1565C0" />
      <rect x="29" y="25" width="5" height="8" rx="2" fill="#1565C0" />
      {/* Background */}
      <rect x="8" y="6" width="32" height="15" rx="2" fill="#B3E5FC" opacity="0.3" />
      <rect x="8" y="21" width="32" height="17" rx="0" fill="#C8E6C9" opacity="0.3" />
    </CameraFrame>
  );
}

export function CameraCloseUpSvg() {
  return (
    <CameraFrame label="Close-Up">
      <rect x="12" y="4" width="24" height="32" rx="2" fill="none" stroke="#546E7A" strokeWidth="1.5" strokeDasharray="2 1" />
      <rect x="12" y="4" width="24" height="32" rx="2" fill="#FFF3E0" opacity="0.4" />
      {/* Face fills the frame */}
      <ellipse cx="24" cy="18" rx="9" ry="11" fill="#F9A825" />
      {/* Eyes */}
      <ellipse cx="20.5" cy="16" rx="2" ry="2.5" fill="#5D4037" />
      <ellipse cx="27.5" cy="16" rx="2" ry="2.5" fill="#5D4037" />
      <circle cx="21" cy="15.5" r="0.7" fill="#FFF" />
      <circle cx="28" cy="15.5" r="0.7" fill="#FFF" />
      {/* Smile */}
      <path d="M20 22 Q24 26 28 22" stroke="#5D4037" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Hair */}
      <path d="M15 16 Q15 8 24 7 Q33 8 33 16" fill="#5D4037" />
      {/* Hijab suggestion */}
      <path d="M15 20 Q15 30 24 32 Q33 30 33 20 Q33 18 30 18 L18 18 Q15 18 15 20Z" fill="#5D4037" opacity="0.2" />
    </CameraFrame>
  );
}

export function CameraFullBodySvg() {
  return (
    <CameraFrame label="Full Body">
      <rect x="15" y="3" width="18" height="36" rx="2" fill="none" stroke="#546E7A" strokeWidth="1.5" strokeDasharray="2 1" />
      <rect x="15" y="3" width="18" height="36" rx="2" fill="#E8F5E9" opacity="0.4" />
      {/* Full character */}
      <ellipse cx="24" cy="12" rx="4" ry="4" fill="#F9A825" />
      <rect x="20" y="15" width="8" height="10" rx="2" fill="#1565C0" />
      <rect x="17" y="16" width="4" height="8" rx="2" fill="#1565C0" />
      <rect x="27" y="16" width="4" height="8" rx="2" fill="#1565C0" />
      <rect x="21" y="24" width="3" height="10" rx="1.5" fill="#3E2723" />
      <rect x="24" y="24" width="3" height="10" rx="1.5" fill="#3E2723" />
      {/* Ground line */}
      <line x1="15" y1="34" x2="33" y2="34" stroke="#A5D6A7" strokeWidth="1" />
    </CameraFrame>
  );
}

export function CameraOverShoulderSvg() {
  return (
    <CameraFrame label="Over Shoulder">
      <rect x="5" y="8" width="38" height="28" rx="2" fill="none" stroke="#546E7A" strokeWidth="1.5" strokeDasharray="2 1" />
      <rect x="5" y="8" width="38" height="28" rx="2" fill="#EDE7F6" opacity="0.3" />
      {/* Foreground shoulder (left) */}
      <path d="M5 36 Q8 20 18 18 L18 36Z" fill="#5D4037" opacity="0.7" />
      {/* Background character being looked at */}
      <ellipse cx="32" cy="22" rx="5" ry="5" fill="#F9A825" opacity="0.9" />
      <rect x="27" y="26" width="10" height="8" rx="2" fill="#1565C0" opacity="0.9" />
      {/* Bokeh suggestion */}
      <ellipse cx="12" cy="15" rx="3" ry="3" fill="#B39DDB" opacity="0.3" />
    </CameraFrame>
  );
}

// ══════════════════════════════════════════════════════════════════
// TONE / MOOD
// ══════════════════════════════════════════════════════════════════

export function ToneBrightSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF9C4" rx="6" />
      <circle cx="24" cy="22" r="14" fill="#FFD93D" />
      <circle cx="24" cy="22" r="18" fill="#FFD93D" opacity="0.2" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
        <line key={i}
          x1={24 + Math.cos(a * Math.PI/180) * 19}
          y1={22 + Math.sin(a * Math.PI/180) * 19}
          x2={24 + Math.cos(a * Math.PI/180) * 23}
          y2={22 + Math.sin(a * Math.PI/180) * 23}
          stroke="#FFB300" strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
      <text x="24" y="45" textAnchor="middle" fontSize="4.5" fill="#F57F17" fontFamily="sans-serif" fontWeight="bold">Bright & Joyful</text>
    </svg>
  );
}

export function ToneWarmSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF3E0" rx="6" />
      {/* Warm firelight glow */}
      <ellipse cx="24" cy="30" rx="18" ry="14" fill="#FF8A65" opacity="0.3" />
      <ellipse cx="24" cy="30" rx="12" ry="10" fill="#FF7043" opacity="0.3" />
      {/* Candle flame */}
      <path d="M22 32 Q24 20 26 32 Q24 38 22 32Z" fill="#FF8F00" />
      <path d="M23 32 Q24 25 25 32 Q24 36 23 32Z" fill="#FFD54F" />
      <ellipse cx="24" cy="33" rx="3" ry="1.5" fill="#5D4037" />
      <rect x="23" y="33" width="2" height="8" rx="1" fill="#BCAAA4" />
      {/* Warm amber light spots */}
      <circle cx="10" cy="20" r="3" fill="#FF8F00" opacity="0.15" />
      <circle cx="38" cy="22" r="4" fill="#FF8F00" opacity="0.15" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#BF360C" fontFamily="sans-serif" fontWeight="bold">Warm & Cozy</text>
    </svg>
  );
}

export function ToneCalmSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="calmBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3F2FD" />
          <stop offset="100%" stopColor="#E8F5E9" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#calmBg)" rx="6" />
      {/* Gentle water ripples */}
      <ellipse cx="24" cy="30" rx="18" ry="6" fill="none" stroke="#90CAF9" strokeWidth="1" opacity="0.6" />
      <ellipse cx="24" cy="30" rx="13" ry="4" fill="none" stroke="#90CAF9" strokeWidth="1" opacity="0.5" />
      <ellipse cx="24" cy="30" rx="7" ry="2" fill="none" stroke="#90CAF9" strokeWidth="1" opacity="0.4" />
      {/* Gentle leaf */}
      <path d="M18 22 Q24 12 30 22 Q24 28 18 22Z" fill="#A5D6A7" opacity="0.8" />
      {/* Soft clouds */}
      <ellipse cx="10" cy="14" rx="7" ry="4" fill="#FFF" opacity="0.7" />
      <ellipse cx="15" cy="12" rx="5" ry="3.5" fill="#FFF" opacity="0.7" />
      <ellipse cx="36" cy="16" rx="6" ry="3.5" fill="#FFF" opacity="0.7" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#1565C0" fontFamily="sans-serif" fontWeight="bold">Calm & Peaceful</text>
    </svg>
  );
}

export function ToneMysterySvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mystBg" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#4A148C" />
          <stop offset="100%" stopColor="#0D0D2B" />
        </radialGradient>
      </defs>
      <rect width="48" height="48" fill="url(#mystBg)" rx="6" />
      {/* Mysterious fog */}
      <ellipse cx="24" cy="36" rx="22" ry="8" fill="#7B1FA2" opacity="0.3" />
      {/* Crescent moon */}
      <path d="M30 10 A7 7 0 1 1 30 24 A4.5 4.5 0 1 0 30 10Z" fill="#CE93D8" opacity="0.9" />
      {/* Stars */}
      {[[10,8],[16,5],[22,10],[8,18],[40,12],[44,20]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="0.8" fill="#E8E8FF" opacity="0.6" />
      ))}
      {/* Silhouette archway */}
      <path d="M10 42 L10 28 Q24 16 38 28 L38 42Z" fill="#1A0A2E" opacity="0.7" />
      {/* Mysterious glow through arch */}
      <ellipse cx="24" cy="35" rx="8" ry="5" fill="#7B1FA2" opacity="0.4" />
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#CE93D8" fontFamily="sans-serif" fontWeight="bold">Mysterious</text>
    </svg>
  );
}

export function ToneDramaticSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dramBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B71C1C" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="#0D0D0D" rx="6" />
      {/* Dramatic light beam */}
      <path d="M24 0 L18 48 L30 48Z" fill="#FFF9C4" opacity="0.08" />
      <path d="M24 0 L21 48 L27 48Z" fill="#FFF9C4" opacity="0.1" />
      {/* High contrast figure */}
      <ellipse cx="24" cy="24" rx="5" ry="5" fill="#E53935" opacity="0.8" />
      <rect x="20" y="28" width="8" height="10" rx="2" fill="#1A1A1A" />
      {/* Rim light */}
      <path d="M19 23 Q18 24 19 30" stroke="#FF8A80" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M29 23 Q30 24 29 30" stroke="#FF8A80" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Scattered light sparks */}
      <circle cx="12" cy="10" r="1" fill="#FF8A80" opacity="0.7" />
      <circle cx="36" cy="8" r="1.2" fill="#FF8A80" opacity="0.7" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#FF8A80" fontFamily="sans-serif" fontWeight="bold">Dramatic</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// COLOR STYLE
// ══════════════════════════════════════════════════════════════════

export function ColorVibrantSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F3F4F6" rx="6" />
      {/* Vibrant color circles */}
      <circle cx="16" cy="16" r="10" fill="#FF1744" opacity="0.85" />
      <circle cx="32" cy="16" r="10" fill="#FFD600" opacity="0.85" />
      <circle cx="24" cy="30" r="10" fill="#00E5FF" opacity="0.85" />
      {/* Overlap blends */}
      <circle cx="24" cy="16" r="6" fill="#FF6D00" opacity="0.6" />
      <circle cx="19" cy="24" r="5" fill="#D500F9" opacity="0.5" />
      <circle cx="29" cy="24" r="5" fill="#00BFA5" opacity="0.5" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#37474F" fontFamily="sans-serif" fontWeight="bold">Vibrant</text>
    </svg>
  );
}

export function ColorPastelSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF9FB" rx="6" />
      <rect x="4" y="6" width="10" height="32" rx="3" fill="#F8BBD0" />
      <rect x="16" y="6" width="10" height="32" rx="3" fill="#C8E6C9" />
      <rect x="28" y="6" width="10" height="32" rx="3" fill="#B3E5FC" />
      <rect x="10" y="6" width="6" height="32" rx="0" fill="#F3E5F5" opacity="0.6" />
      <rect x="22" y="6" width="6" height="32" rx="0" fill="#E8F5E9" opacity="0.6" />
      <rect x="34" y="6" width="6" height="32" rx="0" fill="#FFF9C4" opacity="0.6" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#AD1457" fontFamily="sans-serif" fontWeight="bold">Soft Pastels</text>
    </svg>
  );
}

export function ColorWarmSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="warmGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF8F00" />
          <stop offset="40%" stopColor="#FF5722" />
          <stop offset="70%" stopColor="#D84315" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#warmGrad)" rx="6" />
      {/* Warm glow effect */}
      <ellipse cx="20" cy="24" rx="16" ry="16" fill="#FFD54F" opacity="0.15" />
      {/* Color chips */}
      <rect x="4" y="8" width="9" height="28" rx="2" fill="#FF8F00" />
      <rect x="15" y="8" width="9" height="28" rx="2" fill="#FF5722" />
      <rect x="26" y="8" width="9" height="28" rx="2" fill="#BF360C" />
      <rect x="37" y="8" width="7" height="28" rx="2" fill="#4E342E" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#FFF3E0" fontFamily="sans-serif" fontWeight="bold">Warm Tones</text>
    </svg>
  );
}

export function ColorCoolSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coolGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E1F5FE" />
          <stop offset="40%" stopColor="#0288D1" />
          <stop offset="70%" stopColor="#006064" />
          <stop offset="100%" stopColor="#1A237E" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#coolGrad)" rx="6" />
      <ellipse cx="28" cy="24" rx="16" ry="16" fill="#80DEEA" opacity="0.15" />
      <rect x="4" y="8" width="9" height="28" rx="2" fill="#B3E5FC" />
      <rect x="15" y="8" width="9" height="28" rx="2" fill="#0288D1" />
      <rect x="26" y="8" width="9" height="28" rx="2" fill="#006064" />
      <rect x="37" y="8" width="7" height="28" rx="2" fill="#1A237E" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#E1F5FE" fontFamily="sans-serif" fontWeight="bold">Cool Blues</text>
    </svg>
  );
}

export function ColorEarthSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="earthGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F5E6C8" />
          <stop offset="35%" stopColor="#A0785A" />
          <stop offset="65%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#earthGrad)" rx="6" />
      <rect x="4" y="8" width="9" height="28" rx="2" fill="#F5E6C8" />
      <rect x="15" y="8" width="9" height="28" rx="2" fill="#A0785A" />
      <rect x="26" y="8" width="9" height="28" rx="2" fill="#5D4037" />
      <rect x="37" y="8" width="7" height="28" rx="2" fill="#2E7D32" />
      <text x="24" y="46" textAnchor="middle" fontSize="4.5" fill="#FFF8E1" fontFamily="sans-serif" fontWeight="bold">Earth Tones</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// KB STARTER TEMPLATE THUMBNAILS (for creation picker)
// ══════════════════════════════════════════════════════════════════

export function KBPictureBookSvg() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="80" fill="#FFF9C4" rx="8" />
      <rect y="45" width="64" height="35" fill="#A5D6A7" rx="0" />
      <circle cx="32" cy="28" r="16" fill="#FFD93D" />
      <circle cx="32" cy="28" r="20" fill="#FFD93D" opacity="0.2" />
      {[0,60,120,180,240,300].map((a,i)=>(
        <line key={i} x1={32+Math.cos(a*Math.PI/180)*21} y1={28+Math.sin(a*Math.PI/180)*21} x2={32+Math.cos(a*Math.PI/180)*25} y2={28+Math.sin(a*Math.PI/180)*25} stroke="#FFB300" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <ellipse cx="32" cy="55" rx="8" ry="8" fill="#F9A825" />
      <rect x="26" y="62" width="12" height="10" rx="3" fill="#4FC3F7" />
      <text x="32" y="76" textAnchor="middle" fontSize="5" fill="#37474F" fontFamily="sans-serif" fontWeight="bold">Picture Book</text>
    </svg>
  );
}

export function KBMiddleGradeSvg() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mgBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A237E" />
          <stop offset="100%" stopColor="#283593" />
        </linearGradient>
      </defs>
      <rect width="64" height="80" fill="url(#mgBg)" rx="8" />
      <rect y="55" width="64" height="25" fill="#0D1240" />
      <path d="M10 55 L20 35 L28 45 L35 30 L45 48 L55 35 L64 45 L64 55Z" fill="#0D1240" opacity="0.7" />
      {/* Star field */}
      {[[8,8],[20,5],[35,12],[50,7],[58,18],[14,22],[44,18]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="0.8" fill="#E8E8FF" opacity="0.7"/>
      ))}
      {/* Crescent */}
      <path d="M44 12 A8 8 0 1 1 44 28 A5 5 0 1 0 44 12Z" fill="#C9A84C" />
      {/* Hero silhouette */}
      <ellipse cx="32" cy="42" rx="5" ry="5" fill="#1A237E" />
      <path d="M28 47 Q30 60 28 68 M36 47 Q34 60 36 68" stroke="#1A237E" strokeWidth="3.5" fill="none" />
      <path d="M28 51 L20 57 M36 51 L44 57" stroke="#1A237E" strokeWidth="3" fill="none" />
      <ellipse cx="32" cy="42" rx="5.5" ry="5.5" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.8" />
      <text x="32" y="77" textAnchor="middle" fontSize="4.5" fill="#9FA8DA" fontFamily="sans-serif" fontWeight="bold">MG Adventure</text>
    </svg>
  );
}

export function KBQuranStoriesSvg() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="80" fill="#F0EBD8" rx="8" />
      <rect x="2" y="2" width="60" height="76" rx="6" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
      {/* Mosque */}
      <rect x="20" y="30" width="24" height="28" fill="#1B6CA8" opacity="0.7" />
      <path d="M20 30 Q32 18 44 30Z" fill="#1B6CA8" opacity="0.7" />
      <rect x="26" y="18" width="12" height="12" fill="#1B6CA8" opacity="0.7" />
      <path d="M26 18 Q32 12 38 18Z" fill="#1B6CA8" opacity="0.7" />
      <rect x="30" y="8" width="4" height="10" fill="#C9A84C" />
      <circle cx="32" cy="7" r="3" fill="#C9A84C" />
      {/* Stars and crescent */}
      <path d="M50 14 A6 6 0 1 1 50 26 A4 4 0 1 0 50 14Z" fill="#C9A84C" />
      <circle cx="12" cy="12" r="1.5" fill="#C9A84C" />
      <circle cx="10" cy="22" r="1" fill="#C9A84C" />
      {/* Ground */}
      <rect y="58" width="64" height="22" fill="#C8A96E" opacity="0.3" />
      <text x="32" y="76" textAnchor="middle" fontSize="4.5" fill="#5D4037" fontFamily="sans-serif" fontWeight="bold">Quran Stories</text>
    </svg>
  );
}

export function KBNatureExplorerSvg() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="neBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="50%" stopColor="#B8E4C9" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
      </defs>
      <rect width="64" height="80" fill="url(#neBg)" rx="8" />
      <circle cx="52" cy="14" r="10" fill="#F9C784" opacity="0.9" />
      <path d="M48 80 L48 48 L40 48 L54 30 L40 30 L56 10 L72 30 L58 30 L72 48 L58 48 L58 80Z" fill="#1B4332" opacity="0.7" />
      <path d="M0 80 L0 52 L-4 52 L10 35 L-4 35 L12 16 L28 35 L14 35 L28 52 L14 52 L14 80Z" fill="#2D6A4F" opacity="0.6" />
      <path d="M0 62 Q16 54 32 60 Q48 66 64 58 L64 80 L0 80Z" fill="#2D6A4F" />
      <ellipse cx="32" cy="58" rx="6" ry="6" fill="#F9A825" />
      <rect x="28" y="63" width="8" height="9" rx="2" fill="#52B788" />
      <text x="32" y="77" textAnchor="middle" fontSize="4.5" fill="#FFF" fontFamily="sans-serif" fontWeight="bold">Nature Explorer</text>
    </svg>
  );
}

export function KBSaeedaWorldSvg() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="swBg2" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#F8BBD0" />
          <stop offset="50%" stopColor="#C3B8E8" />
          <stop offset="100%" stopColor="#B5D5C5" />
        </radialGradient>
        <filter id="swBlur2"><feGaussianBlur stdDeviation="2.5" /></filter>
      </defs>
      <rect width="64" height="80" fill="url(#swBg2)" rx="8" />
      {/* Watercolor blobs */}
      <ellipse cx="16" cy="20" rx="20" ry="14" fill="#F9C784" opacity="0.4" filter="url(#swBlur2)" />
      <ellipse cx="48" cy="35" rx="18" ry="15" fill="#B5D5C5" opacity="0.5" filter="url(#swBlur2)" />
      <ellipse cx="28" cy="55" rx="22" ry="14" fill="#E8A598" opacity="0.35" filter="url(#swBlur2)" />
      {/* Giant flower */}
      {[0,72,144,216,288].map((a,i)=>(
        <ellipse key={i} cx={32+Math.cos(a*Math.PI/180)*12} cy={38+Math.sin(a*Math.PI/180)*12}
          rx="7" ry="4" fill={["#F8BBD0","#CE93D8","#B5D5C5","#F9C784","#E8A598"][i]}
          transform={`rotate(${a} ${32+Math.cos(a*Math.PI/180)*12} ${38+Math.sin(a*Math.PI/180)*12})`}
          opacity="0.9" />
      ))}
      <circle cx="32" cy="38" r="6" fill="#FFD93D" />
      {/* Tiny character */}
      <circle cx="32" cy="25" r="3" fill="#F9A825" />
      <rect x="30" y="27.5" width="4" height="5" rx="2" fill="#CE93D8" />
      <text x="32" y="76" textAnchor="middle" fontSize="4.5" fill="#6A1B9A" fontFamily="sans-serif" fontWeight="bold">Saeeda World</text>
    </svg>
  );
}

// ── Export maps ───────────────────────────────────────────────────────────────

import React from 'react';

export const TIME_OF_DAY_OPTIONS = [
  { value: "morning",      label: "Morning",      icon: <MorningSvg /> },
  { value: "afternoon",    label: "Afternoon",    icon: <AfternoonSvg /> },
  { value: "evening",      label: "Evening",      icon: <EveningSvg /> },
  { value: "golden-hour",  label: "Golden Hour",  icon: <GoldenHourSvg /> },
  { value: "night",        label: "Night",        icon: <NightTimeSvg /> },
];

export const CAMERA_HINT_OPTIONS = [
  { value: "wide",          label: "Wide Shot",     icon: <CameraWideSvg /> },
  { value: "medium",        label: "Medium",        icon: <CameraMediumSvg /> },
  { value: "close",         label: "Close-Up",      icon: <CameraCloseUpSvg /> },
  { value: "full-body",     label: "Full Body",     icon: <CameraFullBodySvg /> },
  { value: "over-shoulder", label: "Over Shoulder", icon: <CameraOverShoulderSvg /> },
];

export const TONE_OPTIONS = [
  { value: "bright, safe, familiar, cheerful",                            label: "Bright & Joyful",    icon: <ToneBrightSvg /> },
  { value: "warm, cozy, intimate, inviting",                               label: "Warm & Cozy",        icon: <ToneWarmSvg /> },
  { value: "calm, peaceful, gentle, reflective",                           label: "Calm & Peaceful",    icon: <ToneCalmSvg /> },
  { value: "mysterious, wonder-filled, curious, atmospheric",              label: "Mysterious",         icon: <ToneMysterySvg /> },
  { value: "cinematic, dramatic, adventurous with emotional warmth",       label: "Dramatic",           icon: <ToneDramaticSvg /> },
];

export const COLOR_STYLE_OPTIONS = [
  { value: "vibrant, saturated, primary colors with warm accents",        label: "Vibrant",       icon: <ColorVibrantSvg /> },
  { value: "soft pastel watercolor washes, translucent light effects",    label: "Soft Pastels",  icon: <ColorPastelSvg /> },
  { value: "rich warm tones, oranges, reds, ambers and burnt sienna",     label: "Warm Tones",    icon: <ColorWarmSvg /> },
  { value: "cool blues, teals, and aquas, crisp and refreshing palette",  label: "Cool Blues",    icon: <ColorCoolSvg /> },
  { value: "earth tones, ochres, siennas, forest greens and warm browns", label: "Earth Tones",   icon: <ColorEarthSvg /> },
];

export const KB_TEMPLATE_SVG_MAP: Record<string, () => JSX.Element> = {
  "kbt_picture_book":    KBPictureBookSvg,
  "kbt_middle_grade":    KBMiddleGradeSvg,
  "kbt_quran_stories":   KBQuranStoriesSvg,
  "kbt_nature_explorer": KBNatureExplorerSvg,
  "kbt_saeeda_world":    KBSaeedaWorldSvg,
};

// ══════════════════════════════════════════════════════════════════
// ISLAMIC VALUES — illustrated preset tiles (48×48)
// ══════════════════════════════════════════════════════════════════

export function ValueSabrSvg() { // Patience — hourglass + calm figure
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EDE7F6" rx="8"/>
      {/* Hourglass */}
      <path d="M16 8 L32 8 L24 22 L32 40 L16 40 L24 22Z" fill="#7C3AED" opacity="0.15"/>
      <path d="M16 8 L32 8 L24 20Z" fill="#7C3AED" opacity="0.7"/>
      <path d="M16 40 L32 40 L24 28Z" fill="#7C3AED" opacity="0.4"/>
      <rect x="14" y="7" width="20" height="2.5" rx="1.2" fill="#7C3AED"/>
      <rect x="14" y="38.5" width="20" height="2.5" rx="1.2" fill="#7C3AED"/>
      {/* Sand flowing */}
      <circle cx="24" cy="24" r="2" fill="#C4B5FD"/>
      <text x="24" y="47" textAnchor="middle" fontSize="5" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">Sabr</text>
    </svg>
  );
}

export function ValueShukrSvg() { // Gratitude — hands raised
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Raised hands */}
      <path d="M14 30 Q10 20 12 12 Q14 8 17 10 Q18 8 20 9 Q21 7 23 9 L23 26" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M34 30 Q38 20 36 12 Q34 8 31 10 Q30 8 28 9 Q27 7 25 9 L25 26" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 30 Q24 34 34 30" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Stars/sparkles */}
      <circle cx="24" cy="8" r="2" fill="#FCD34D"/>
      <circle cx="12" cy="6" r="1.2" fill="#FCD34D" opacity="0.7"/>
      <circle cx="36" cy="6" r="1.2" fill="#FCD34D" opacity="0.7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Shukr</text>
    </svg>
  );
}

export function ValueSadaqahSvg() { // Charity — giving hand with heart
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      {/* Open giving hand */}
      <path d="M10 30 Q10 22 16 20 L28 20 Q32 20 32 24 Q32 26 28 26 L22 26" stroke="#E11D48" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 30 L34 30 Q40 30 40 26 Q40 22 34 22" stroke="#E11D48" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M8 30 L36 30 Q42 30 42 36 L8 36 Z" fill="#E11D48" opacity="0.15"/>
      {/* Heart being given */}
      <path d="M24 14 C22 11 18 11 18 14.5 C18 17 21 19.5 24 22 C27 19.5 30 17 30 14.5 C30 11 26 11 24 14Z" fill="#E11D48"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Sadaqah</text>
    </svg>
  );
}

export function ValueHonestySvg() { // Honesty/Sidq — balance scales
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Stand */}
      <rect x="22.5" y="10" width="3" height="26" rx="1.5" fill="#16A34A"/>
      <rect x="18" y="36" width="12" height="3" rx="1.5" fill="#16A34A"/>
      {/* Top bar */}
      <rect x="10" y="12" width="28" height="2" rx="1" fill="#16A34A"/>
      {/* Left pan (balanced) */}
      <line x1="13" y1="14" x2="13" y2="22" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M8 22 Q13 20 18 22" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
      {/* Right pan (balanced) */}
      <line x1="35" y1="14" x2="35" y2="22" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M30 22 Q35 20 40 22" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
      {/* Star center */}
      <circle cx="24" cy="11" r="2.5" fill="#BBF7D0"/>
      <circle cx="24" cy="11" r="1.5" fill="#16A34A"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#15803D" fontFamily="sans-serif" fontWeight="bold">Honesty</text>
    </svg>
  );
}

export function ValueKindnessSvg() { // Kindness — figure helping another
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Two figures - one helping other */}
      {/* Figure 1 (helper) */}
      <circle cx="16" cy="14" r="4" fill="#F97316"/>
      <path d="M12 18 Q12 28 12 32" stroke="#F97316" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M12 22 L22 26" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Figure 2 (receiving help - leaning) */}
      <circle cx="32" cy="16" r="4" fill="#FB923C"/>
      <path d="M32 20 Q30 28 30 32" stroke="#FB923C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M22 26 Q26 24 30 26" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Heart between them */}
      <path d="M24 20 C23 18 21 18 21 20 C21 21.5 22.5 22.5 24 24 C25.5 22.5 27 21.5 27 20 C27 18 25 18 24 20Z" fill="#EF4444"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#C2410C" fontFamily="sans-serif" fontWeight="bold">Kindness</text>
    </svg>
  );
}

export function ValueTawakkulSvg() { // Trust in Allah — figure with light from above
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Light beam from above */}
      <path d="M20 4 L24 16 L28 4Z" fill="#BFDBFE" opacity="0.6"/>
      <path d="M22 4 L24 14 L26 4Z" fill="#3B82F6" opacity="0.3"/>
      {/* Star/light source */}
      <circle cx="24" cy="6" r="4" fill="#DBEAFE"/>
      <circle cx="24" cy="6" r="2.5" fill="#3B82F6"/>
      {/* Peaceful figure, arms open */}
      <circle cx="24" cy="24" r="4.5" fill="#60A5FA"/>
      <path d="M19.5 28 Q20 36 20 38" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M28.5 28 Q28 36 28 38" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M19.5 30 L12 28" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M28.5 30 L36 28" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Tawakkul</text>
    </svg>
  );
}

export function ValuePrayerSvg() { // Salah — figure in sujood
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Prayer mat */}
      <path d="M6 34 Q24 30 42 34 L42 38 Q24 42 6 38Z" fill="#A7F3D0" opacity="0.6"/>
      <path d="M6 34 Q24 30 42 34" stroke="#6EE7B7" strokeWidth="1" fill="none"/>
      {/* Figure in sujood (prostration) */}
      <ellipse cx="24" cy="30" rx="14" ry="4" fill="#059669" opacity="0.2"/>
      <path d="M14 30 Q16 24 20 22 Q24 20 28 22 Q32 24 34 30" fill="#059669" opacity="0.6"/>
      <ellipse cx="24" cy="22" rx="5" ry="3" fill="#059669" opacity="0.7"/>
      {/* Forehead touching ground */}
      <circle cx="24" cy="28" r="2" fill="#059669"/>
      <text x="24" y="47" textAnchor="middle" fontSize="5" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Salah</text>
    </svg>
  );
}

export function ValueRespectSvg() { // Respect parents — family figures
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF4FF" rx="8"/>
      {/* Parent figure (larger) */}
      <circle cx="20" cy="14" r="5" fill="#A855F7"/>
      <rect x="15" y="19" width="10" height="14" rx="3" fill="#A855F7"/>
      <rect x="11" y="20" width="5" height="10" rx="2.5" fill="#A855F7"/>
      {/* Child figure (smaller) */}
      <circle cx="32" cy="17" r="3.5" fill="#C084FC"/>
      <rect x="28.5" y="21" width="7" height="10" rx="2" fill="#C084FC"/>
      {/* Holding hands */}
      <path d="M25 26 L28.5 26" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Heart above */}
      <path d="M26 9 C25 7 23 7 23 9 C23 10.5 24.5 11.5 26 13 C27.5 11.5 29 10.5 29 9 C29 7 27 7 26 9Z" fill="#7C3AED" opacity="0.7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#6B21A8" fontFamily="sans-serif" fontWeight="bold">Respect</text>
    </svg>
  );
}

export function ValueForgivenessSvg() { // Forgiveness — handshake
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      {/* Two hands shaking */}
      <path d="M8 28 Q10 22 14 20 L20 20 Q22 20 22 22 L22 26 Q22 28 20 28 L14 28" stroke="#F43F5E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 28 Q38 22 34 20 L28 20 Q26 20 26 22 L26 26 Q26 28 28 28 L34 28" stroke="#F43F5E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 28 Q24 32 34 28" stroke="#F43F5E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Peace/dove suggestion */}
      <path d="M21 16 Q24 10 27 16 Q24 13 21 16Z" fill="#FDA4AF"/>
      <circle cx="24" cy="14" r="2" fill="#FB7185"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#BE123C" fontFamily="sans-serif" fontWeight="bold">Forgiveness</text>
    </svg>
  );
}

export function ValueBismillahSvg() { // Bismillah — before starting
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Open book */}
      <path d="M8 14 Q8 36 24 38 Q40 36 40 14 L24 12Z" fill="#BBF7D0" opacity="0.5"/>
      <line x1="24" y1="12" x2="24" y2="38" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M8 14 Q10 12 24 12" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
      <path d="M40 14 Q38 12 24 12" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
      {/* Arabic-feel lines on pages */}
      <line x1="12" y1="20" x2="22" y2="20" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="24" x2="21" y2="24" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round"/>
      <line x1="12" y1="28" x2="20" y2="28" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round"/>
      <line x1="26" y1="20" x2="36" y2="20" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="27" y1="24" x2="36" y2="24" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round"/>
      <line x1="28" y1="28" x2="36" y2="28" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#15803D" fontFamily="sans-serif" fontWeight="bold">Bismillah</text>
    </svg>
  );
}

export function ValueCleanlinesssvg() { // Taharah — water drop + sparkle
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Water drop */}
      <path d="M24 8 Q32 20 32 28 A8 8 0 0 1 16 28 Q16 20 24 8Z" fill="#60A5FA" opacity="0.7"/>
      <path d="M24 8 Q28 18 28 26 A4 4 0 0 1 20 26 Q20 18 24 8Z" fill="#BFDBFE" opacity="0.5"/>
      {/* Sparkles */}
      <circle cx="10" cy="12" r="2" fill="#93C5FD" opacity="0.8"/>
      <circle cx="38" cy="16" r="2.5" fill="#93C5FD" opacity="0.6"/>
      <circle cx="36" cy="34" r="1.5" fill="#93C5FD" opacity="0.7"/>
      <circle cx="10" cy="30" r="1.5" fill="#93C5FD" opacity="0.5"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Cleanliness</text>
    </svg>
  );
}

export function ValueCourageSvg() { // Courage — lion / shield
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Shield */}
      <path d="M24 8 L36 13 L36 26 Q36 34 24 40 Q12 34 12 26 L12 13Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5"/>
      <path d="M24 12 L32 16 L32 26 Q32 32 24 37 Q16 32 16 26 L16 16Z" fill="#FCD34D" opacity="0.5"/>
      {/* Star on shield */}
      <path d="M24 18 L25.5 22 L30 22 L26.5 24.5 L28 28.5 L24 26 L20 28.5 L21.5 24.5 L18 22 L22.5 22Z" fill="#D97706"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Courage</text>
    </svg>
  );
}

// Exported preset list for the Islamic Values visual picker
export const ISLAMIC_VALUE_PRESETS = [
  { value: "Sabr — patience in hardship and difficulty",                              label: "Sabr",        icon: <ValueSabrSvg /> },
  { value: "Shukr — gratitude to Allah for all blessings",                            label: "Shukr",       icon: <ValueShukrSvg /> },
  { value: "Sadaqah — giving generously to those in need",                             label: "Sadaqah",     icon: <ValueSadaqahSvg /> },
  { value: "Sidq — honesty and truthfulness in all situations",                        label: "Honesty",     icon: <ValueHonestySvg /> },
  { value: "Rahma — kindness and compassion toward all living things",                 label: "Kindness",    icon: <ValueKindnessSvg /> },
  { value: "Tawakkul — trusting Allah after doing your best",                          label: "Tawakkul",    icon: <ValueTawakkulSvg /> },
  { value: "Salah — establishing prayer as the anchor of every day",                   label: "Salah",       icon: <ValuePrayerSvg /> },
  { value: "Respecting parents and elders with love and care",                         label: "Respect",     icon: <ValueRespectSvg /> },
  { value: "Afw — forgiveness, letting go of anger for Allah's sake",                  label: "Forgiveness", icon: <ValueForgivenessSvg /> },
  { value: "Saying Bismillah before every action",                                     label: "Bismillah",   icon: <ValueBismillahSvg /> },
  { value: "Taharah — cleanliness of body, clothes, and space",                        label: "Cleanliness", icon: <ValueCleanlinesssvg /> },
  { value: "Courage to do right even when it is difficult",                             label: "Courage",     icon: <ValueCourageSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// DU'A CONTEXT — when this du'a is used in the story (48×48)
// ══════════════════════════════════════════════════════════════════

export function DuaBeforeEatingSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Bowl */}
      <path d="M10 24 Q10 36 24 36 Q38 36 38 24Z" fill="#FED7AA" stroke="#F97316" strokeWidth="1.5"/>
      <ellipse cx="24" cy="24" rx="14" ry="4" fill="#FDBA74"/>
      {/* Steam */}
      <path d="M18 20 Q16 16 18 12" stroke="#FB923C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M24 19 Q22 15 24 11" stroke="#FB923C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M30 20 Q28 16 30 12" stroke="#FB923C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Spoon */}
      <path d="M34 28 L40 22" stroke="#9A3412" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="40" cy="21" r="2.5" fill="#C2410C"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9A3412" fontFamily="sans-serif" fontWeight="bold">Before Eating</text>
    </svg>
  );
}

export function DuaBeforeSleepSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#1E1B4B" rx="8"/>
      {/* Moon */}
      <path d="M30 10 A10 10 0 1 1 30 30 A14 14 0 0 0 30 10Z" fill="#C4B5FD"/>
      {/* Stars */}
      <circle cx="10" cy="12" r="1.5" fill="#FDE68A"/>
      <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
      <circle cx="6" cy="22" r="1" fill="#FDE68A"/>
      <circle cx="38" cy="8" r="1.5" fill="#FDE68A"/>
      {/* Pillow / Bed suggestion */}
      <rect x="6" y="34" width="36" height="8" rx="4" fill="#4338CA" opacity="0.6"/>
      <rect x="6" y="34" width="14" height="8" rx="4" fill="#6D28D9" opacity="0.7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#C4B5FD" fontFamily="sans-serif" fontWeight="bold">Before Sleep</text>
    </svg>
  );
}

export function DuaMorningSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Sunrise rays */}
      <circle cx="24" cy="26" r="9" fill="#FCD34D"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
        <line key={i}
          x1={24+Math.cos(a*Math.PI/180)*11} y1={26+Math.sin(a*Math.PI/180)*11}
          x2={24+Math.cos(a*Math.PI/180)*15} y2={26+Math.sin(a*Math.PI/180)*15}
          stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Horizon */}
      <rect x="4" y="30" width="40" height="2" rx="1" fill="#D97706" opacity="0.4"/>
      {/* Ground */}
      <rect x="4" y="32" width="40" height="8" rx="3" fill="#A7F3D0" opacity="0.5"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Waking Up</text>
    </svg>
  );
}

export function DuaStartingTaskSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Rocket body */}
      <path d="M24 8 L30 22 L24 20 L18 22Z" fill="#059669"/>
      <path d="M24 8 L30 22 L24 32 L18 22Z" fill="#34D399"/>
      {/* Window */}
      <circle cx="24" cy="20" r="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1"/>
      {/* Flames */}
      <path d="M20 32 Q24 38 28 32 Q24 36 20 32Z" fill="#F59E0B"/>
      <path d="M21 32 Q24 36 27 32 Q24 34 21 32Z" fill="#FCD34D"/>
      {/* Stars */}
      <circle cx="10" cy="14" r="1.5" fill="#FCD34D"/>
      <circle cx="38" cy="18" r="1.5" fill="#FCD34D"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Starting Task</text>
    </svg>
  );
}

export function DuaHardshipSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F5F3FF" rx="8"/>
      {/* Mountain */}
      <path d="M6 38 L18 16 L24 24 L30 12 L42 38Z" fill="#7C3AED" opacity="0.2"/>
      <path d="M6 38 L18 16 L24 24 L30 12 L42 38Z" stroke="#7C3AED" strokeWidth="1.5" fill="none"/>
      {/* Snow cap */}
      <path d="M28 14 L30 12 L32 16Z" fill="#EDE9FE"/>
      {/* Figure climbing */}
      <circle cx="20" cy="26" r="2.5" fill="#6D28D9"/>
      <path d="M20 28.5 L20 34" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 30 L16 32" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 30 L23 28" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Heart/dua glow above */}
      <path d="M20 20 C19 18 17 18 17 20 C17 21.5 18.5 22.5 20 24 C21.5 22.5 23 21.5 23 20 C23 18 21 18 20 20Z" fill="#A78BFA" opacity="0.8"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">In Hardship</text>
    </svg>
  );
}

export function DuaStudySvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Open book */}
      <path d="M8 12 Q8 32 24 34 Q40 32 40 12Z" fill="#BFDBFE" opacity="0.4"/>
      <line x1="24" y1="12" x2="24" y2="34" stroke="#3B82F6" strokeWidth="1.5"/>
      <rect x="8" y="10" width="16" height="24" rx="2" fill="#93C5FD" opacity="0.3" stroke="#3B82F6" strokeWidth="1"/>
      <rect x="24" y="10" width="16" height="24" rx="2" fill="#93C5FD" opacity="0.3" stroke="#3B82F6" strokeWidth="1"/>
      {/* Lines on pages */}
      <line x1="11" y1="17" x2="22" y2="17" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round"/>
      <line x1="11" y1="21" x2="22" y2="21" stroke="#3B82F6" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="11" y1="25" x2="20" y2="25" stroke="#3B82F6" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="26" y1="17" x2="37" y2="17" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round"/>
      <line x1="26" y1="21" x2="37" y2="21" stroke="#3B82F6" strokeWidth="0.8" strokeLinecap="round"/>
      {/* Pencil */}
      <rect x="34" y="6" width="3" height="12" rx="1" fill="#FCD34D" transform="rotate(30 34 6)"/>
      <path d="M36 17 L34 22 L38 17Z" fill="#374151" transform="rotate(30 34 6)"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Before Study</text>
    </svg>
  );
}

export function DuaTravelSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Road */}
      <path d="M4 40 Q24 28 44 40" stroke="#9CA3AF" strokeWidth="3" fill="none"/>
      {/* Center line dashes */}
      <path d="M10 37 Q14 33 18 34" stroke="#FCD34D" strokeWidth="1.5" fill="none" strokeDasharray="2 3" strokeLinecap="round"/>
      <path d="M22 32 Q26 29 30 30" stroke="#FCD34D" strokeWidth="1.5" fill="none" strokeDasharray="2 3" strokeLinecap="round"/>
      {/* Car */}
      <rect x="16" y="24" width="16" height="8" rx="3" fill="#059669"/>
      <rect x="18" y="20" width="12" height="6" rx="2" fill="#34D399"/>
      <circle cx="19" cy="32" r="2.5" fill="#1F2937"/>
      <circle cx="29" cy="32" r="2.5" fill="#1F2937"/>
      {/* Windows */}
      <rect x="19" y="21" width="4" height="3.5" rx="1" fill="#BAE6FD" opacity="0.8"/>
      <rect x="25" y="21" width="4" height="3.5" rx="1" fill="#BAE6FD" opacity="0.8"/>
      {/* Clouds */}
      <ellipse cx="10" cy="14" rx="7" ry="4" fill="#FFF" opacity="0.8"/>
      <ellipse cx="38" cy="10" rx="6" ry="3.5" fill="#FFF" opacity="0.8"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Before Travel</text>
    </svg>
  );
}

export const DUA_CONTEXT_OPTIONS = [
  { value: "before eating", label: "Before Eating", icon: <DuaBeforeEatingSvg /> },
  { value: "before sleep",  label: "Before Sleep",  icon: <DuaBeforeSleepSvg /> },
  { value: "waking up",     label: "Waking Up",     icon: <DuaMorningSvg /> },
  { value: "starting a task", label: "Starting Task", icon: <DuaStartingTaskSvg /> },
  { value: "during hardship", label: "In Hardship",  icon: <DuaHardshipSvg /> },
  { value: "before study",  label: "Before Study",  icon: <DuaStudySvg /> },
  { value: "before travel", label: "Before Travel", icon: <DuaTravelSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// VOCABULARY TYPE — kind of word/phrase (48×48)
// ══════════════════════════════════════════════════════════════════

export function VocabArabicWordSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Crescent */}
      <path d="M28 10 A10 10 0 1 1 28 34 A14 14 0 0 0 28 10Z" fill="#059669"/>
      {/* Dot */}
      <circle cx="14" cy="22" r="2.5" fill="#FCD34D"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Arabic Word</text>
    </svg>
  );
}

export function VocabQuranPhrSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Quran-style open book */}
      <path d="M6 10 Q6 34 24 36 Q42 34 42 10Z" fill="#FDE68A" opacity="0.5"/>
      <line x1="24" y1="10" x2="24" y2="36" stroke="#D97706" strokeWidth="2"/>
      {/* Star */}
      <path d="M24 14 L25.5 18.5 L30 18.5 L26.5 21 L28 25.5 L24 23 L20 25.5 L21.5 21 L18 18.5 L22.5 18.5Z" fill="#F59E0B"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Quranic Phrase</text>
    </svg>
  );
}

export function VocabDuaPhrSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Raised hands */}
      <path d="M14 30 Q10 20 12 12 Q14 8 17 10 Q18 8 20 9 L20 26" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M34 30 Q38 20 36 12 Q34 8 31 10 Q30 8 28 9 L28 26" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M14 30 Q24 34 34 30" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="24" cy="8" r="2.5" fill="#BFDBFE"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Du'a Phrase</text>
    </svg>
  );
}

export function VocabExpressionSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      {/* Speech bubble */}
      <path d="M8 10 Q8 28 14 28 L20 28 L20 34 L26 28 L38 28 Q42 28 42 22 L42 10 Q42 6 38 6 L12 6 Q8 6 8 10Z" fill="#FCA5A5" opacity="0.5" stroke="#F87171" strokeWidth="1.5"/>
      {/* Exclamation lines */}
      <text x="18" y="23" fontSize="12" fill="#E11D48" fontFamily="sans-serif" fontWeight="bold">!</text>
      <text x="28" y="21" fontSize="8" fill="#E11D48" fontFamily="sans-serif" fontWeight="bold">!</text>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Expression</text>
    </svg>
  );
}

export function VocabValueWordSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF4FF" rx="8"/>
      {/* Heart + sparkles */}
      <path d="M24 34 C18 28 8 24 8 16 C8 10 12 8 16 8 C19 8 22 10 24 14 C26 10 29 8 32 8 C36 8 40 10 40 16 C40 24 30 28 24 34Z" fill="#A855F7" opacity="0.7"/>
      <circle cx="10" cy="10" r="1.5" fill="#D8B4FE"/>
      <circle cx="38" cy="10" r="1.5" fill="#D8B4FE"/>
      <circle cx="38" cy="30" r="1" fill="#D8B4FE"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#7E22CE" fontFamily="sans-serif" fontWeight="bold">Value Word</text>
    </svg>
  );
}

export const VOCAB_TYPE_OPTIONS = [
  { value: "Arabic word",     label: "Arabic Word",    icon: <VocabArabicWordSvg /> },
  { value: "Quranic phrase",  label: "Quranic Phrase", icon: <VocabQuranPhrSvg /> },
  { value: "du'a phrase",     label: "Du'a Phrase",    icon: <VocabDuaPhrSvg /> },
  { value: "expression",      label: "Expression",     icon: <VocabExpressionSvg /> },
  { value: "value word",      label: "Value Word",     icon: <VocabValueWordSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// CHARACTER VOICE — Speaking style, Faith tone, Literary role (48×48)
// ══════════════════════════════════════════════════════════════════

export function StyleFastSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Speech bubble */}
      <path d="M8 10 Q8 24 14 24 L18 24 L18 30 L24 24 L38 24 Q42 24 42 18 L42 10 Q42 6 38 6 L12 6 Q8 6 8 10Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8"/>
      {/* Lightning bolt */}
      <path d="M26 8 L20 18 L24 18 L18 28 L28 16 L24 16Z" fill="#F59E0B"/>
      {/* Speed lines */}
      <line x1="8" y1="32" x2="18" y2="32" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="36" x2="22" y2="36" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="40" x2="26" y2="40" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="34" y="44" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Fast</text>
    </svg>
  );
}

export function StyleGentleSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Soft speech bubble */}
      <path d="M8 12 Q8 26 14 26 L18 26 L18 32 L24 26 L38 26 Q42 26 42 20 L42 12 Q42 8 38 8 L12 8 Q8 8 8 12Z" fill="#BBF7D0" stroke="#4ADE80" strokeWidth="1.5" opacity="0.8"/>
      {/* Leaf/gentle wave */}
      <path d="M18 18 Q24 12 30 18 Q24 22 18 18Z" fill="#22C55E" opacity="0.7"/>
      <path d="M16 22 Q22 16 28 22" stroke="#4ADE80" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Soft dots */}
      <circle cx="14" cy="40" r="2" fill="#86EFAC"/>
      <circle cx="20" cy="38" r="1.5" fill="#86EFAC"/>
      <circle cx="26" cy="40" r="2" fill="#86EFAC"/>
      <text x="36" y="44" textAnchor="middle" fontSize="4" fill="#15803D" fontFamily="sans-serif" fontWeight="bold">Gentle</text>
    </svg>
  );
}

export function StyleWiseSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF4FF" rx="8"/>
      {/* Owl body */}
      <ellipse cx="24" cy="28" rx="10" ry="12" fill="#A855F7" opacity="0.3"/>
      <ellipse cx="24" cy="28" rx="10" ry="12" stroke="#A855F7" strokeWidth="1.5" fill="none"/>
      {/* Eyes */}
      <circle cx="20" cy="24" r="4" fill="#FFF" stroke="#7C3AED" strokeWidth="1.5"/>
      <circle cx="28" cy="24" r="4" fill="#FFF" stroke="#7C3AED" strokeWidth="1.5"/>
      <circle cx="20" cy="24" r="2" fill="#1F2937"/>
      <circle cx="28" cy="24" r="2" fill="#1F2937"/>
      <circle cx="20.8" cy="23.2" r="0.8" fill="#FFF"/>
      <circle cx="28.8" cy="23.2" r="0.8" fill="#FFF"/>
      {/* Beak */}
      <path d="M22 28 L24 31 L26 28Z" fill="#F59E0B"/>
      {/* Ears */}
      <path d="M16 16 L18 20 L14 20Z" fill="#A855F7" opacity="0.6"/>
      <path d="M32 16 L30 20 L34 20Z" fill="#A855F7" opacity="0.6"/>
      <text x="24" y="47" textAnchor="middle" fontSize="5" fill="#6B21A8" fontFamily="sans-serif" fontWeight="bold">Wise</text>
    </svg>
  );
}

export function StylePlayfulSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      {/* Bouncing star */}
      <path d="M24 6 L26.5 13 L34 13 L28 17.5 L30.5 24.5 L24 20 L17.5 24.5 L20 17.5 L14 13 L21.5 13Z" fill="#FB7185" opacity="0.9"/>
      {/* Bounce arcs */}
      <path d="M10 36 Q14 28 18 36 Q22 28 26 36 Q30 28 34 36" stroke="#FDA4AF" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="2 2"/>
      {/* Exclamation + stars */}
      <circle cx="38" cy="12" r="2" fill="#FCD34D"/>
      <circle cx="10" cy="20" r="1.5" fill="#FCD34D"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#BE123C" fontFamily="sans-serif" fontWeight="bold">Playful</text>
    </svg>
  );
}

export function StyleFormalSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F8FAFC" rx="8"/>
      {/* Crown */}
      <path d="M10 28 L14 16 L20 22 L24 12 L28 22 L34 16 L38 28Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
      <rect x="10" y="28" width="28" height="6" rx="2" fill="#FCD34D" stroke="#D97706" strokeWidth="1"/>
      {/* Jewels */}
      <circle cx="18" cy="21" r="2" fill="#E11D48"/>
      <circle cx="24" cy="17" r="2" fill="#3B82F6"/>
      <circle cx="30" cy="21" r="2" fill="#059669"/>
      <circle cx="14" cy="31" r="1.5" fill="#A855F7"/>
      <circle cx="24" cy="31" r="1.5" fill="#E11D48"/>
      <circle cx="34" cy="31" r="1.5" fill="#F59E0B"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#1E293B" fontFamily="sans-serif" fontWeight="bold">Formal</text>
    </svg>
  );
}

export function StyleReflectiveSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#1E1B4B" rx="8"/>
      {/* Moon */}
      <path d="M30 10 A10 10 0 1 1 30 30 A14 14 0 0 0 30 10Z" fill="#818CF8" opacity="0.8"/>
      {/* Thought bubbles */}
      <circle cx="14" cy="28" r="6" fill="#312E81" opacity="0.8" stroke="#818CF8" strokeWidth="1"/>
      <circle cx="8" cy="30" r="2" fill="#3730A3" opacity="0.8" stroke="#818CF8" strokeWidth="0.8"/>
      <circle cx="5" cy="34" r="1" fill="#4338CA" opacity="0.8"/>
      {/* Ellipsis in thought bubble */}
      <circle cx="12" cy="28" r="1" fill="#A5B4FC"/>
      <circle cx="14" cy="28" r="1" fill="#A5B4FC"/>
      <circle cx="16" cy="28" r="1" fill="#A5B4FC"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#A5B4FC" fontFamily="sans-serif" fontWeight="bold">Reflective</text>
    </svg>
  );
}

export const SPEAKING_STYLE_OPTIONS = [
  { value: "Fast, buzzing, excitable — short fragmented lines",                          label: "Fast & Buzzing",    icon: <StyleFastSvg /> },
  { value: "Gentle, calm and measured — soft flowing speech",                            label: "Gentle & Calm",     icon: <StyleGentleSvg /> },
  { value: "Wise, deliberate and thoughtful — long considered lines",                    label: "Wise & Measured",   icon: <StyleWiseSvg /> },
  { value: "Playful, silly and light-hearted — jokes and wordplay",                      label: "Playful & Silly",   icon: <StylePlayfulSvg /> },
  { value: "Formal, dignified and poetic — elevated language",                           label: "Formal & Dignified",icon: <StyleFormalSvg /> },
  { value: "Reflective, introspective and quiet — thoughtful pauses",                    label: "Reflective",        icon: <StyleReflectiveSvg /> },
];

export function FaithJoyfulSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      <circle cx="24" cy="20" r="10" fill="#FCD34D"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i} x1={24+Math.cos(a*Math.PI/180)*12} y1={20+Math.sin(a*Math.PI/180)*12}
          x2={24+Math.cos(a*Math.PI/180)*16} y2={20+Math.sin(a*Math.PI/180)*16}
          stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <path d="M19 24 Q24 28 29 24" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="20.5" cy="20" r="1.5" fill="#92400E"/>
      <circle cx="27.5" cy="20" r="1.5" fill="#92400E"/>
      <path d="M18 36 C18 32 30 32 30 36" fill="#FCD34D" opacity="0.5" stroke="#F59E0B" strokeWidth="1"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Joyful</text>
    </svg>
  );
}

export function FaithReflectiveSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      <path d="M30 8 A10 10 0 1 1 30 28 A14 14 0 0 0 30 8Z" fill="#93C5FD"/>
      <circle cx="12" cy="18" r="1.5" fill="#DBEAFE"/>
      <circle cx="8" cy="24" r="1" fill="#BFDBFE"/>
      {/* Question mark */}
      <text x="17" y="28" fontSize="14" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold" opacity="0.8">?</text>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1E40AF" fontFamily="sans-serif" fontWeight="bold">Reflective</text>
    </svg>
  );
}

export function FaithWarmSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FED7AA"/>
        <stop offset="100%" stopColor="#FFF7ED"/>
      </radialGradient>
      <circle cx="24" cy="24" r="16" fill="url(#warmGlow)"/>
      <path d="M24 30 C18 24 10 20 10 14 C10 8 16 7 20 11 C21 9 23 8 24 11 C25 8 27 9 28 11 C32 7 38 8 38 14 C38 20 30 24 24 30Z" fill="#FB923C" opacity="0.8"/>
      <circle cx="10" cy="10" r="2" fill="#FED7AA"/>
      <circle cx="38" cy="8" r="2" fill="#FED7AA"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#9A3412" fontFamily="sans-serif" fontWeight="bold">Warm & Sincere</text>
    </svg>
  );
}

export function FaithGentleSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Flower */}
      {[0,72,144,216,288].map((a,i) => (
        <ellipse key={i} cx={24+Math.cos(a*Math.PI/180)*9} cy={22+Math.sin(a*Math.PI/180)*9}
          rx="5" ry="3.5" fill={["#86EFAC","#4ADE80","#34D399","#6EE7B7","#A7F3D0"][i]}
          transform={`rotate(${a} ${24+Math.cos(a*Math.PI/180)*9} ${22+Math.sin(a*Math.PI/180)*9})`}/>
      ))}
      <circle cx="24" cy="22" r="5" fill="#FCD34D"/>
      {/* Peace dove */}
      <path d="M10 36 Q14 30 18 34 Q16 36 10 36Z" fill="#FFF" opacity="0.7"/>
      <circle cx="18" cy="34" r="1.5" fill="#6EE7B7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#15803D" fontFamily="sans-serif" fontWeight="bold">Gentle</text>
    </svg>
  );
}

export const FAITH_TONE_OPTIONS = [
  { value: "Joyful & imitative — mirrors Islamic joy, frequent Alhamdulillah moments",        label: "Joyful",     icon: <FaithJoyfulSvg /> },
  { value: "Reflective & questioning — wrestles with faith sincerely",                         label: "Reflective", icon: <FaithReflectiveSvg /> },
  { value: "Warm & sincere — authentic heartfelt expressions of faith",                        label: "Warm",       icon: <FaithWarmSvg /> },
  { value: "Gentle & encouraging — softly guides others toward good",                          label: "Gentle",     icon: <FaithGentleSvg /> },
];

export function RoleProtagonistSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Hero star burst */}
      <path d="M24 6 L26.5 14 L34 14 L28 18.5 L30.5 26.5 L24 22 L17.5 26.5 L20 18.5 L14 14 L21.5 14Z" fill="#F59E0B"/>
      {/* Cape */}
      <path d="M18 28 Q14 36 14 42 L18 40 L24 44 L30 40 L34 42 Q34 36 30 28Z" fill="#DC2626" opacity="0.8"/>
      {/* Figure */}
      <circle cx="24" cy="24" r="5" fill="#FCD34D"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Protagonist</text>
    </svg>
  );
}

export function RoleMentorSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F5F3FF" rx="8"/>
      {/* Elder figure — taller */}
      <circle cx="20" cy="14" r="5" fill="#7C3AED"/>
      <rect x="15" y="19" width="10" height="14" rx="3" fill="#7C3AED"/>
      <rect x="11" y="20" width="5" height="10" rx="2.5" fill="#7C3AED"/>
      {/* Staff */}
      <line x1="30" y1="12" x2="30" y2="38" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 12 Q30 8 32 12" stroke="#A78BFA" strokeWidth="1.5" fill="none"/>
      {/* Knowledge sparkle */}
      <circle cx="36" cy="18" r="3" fill="#DDD6FE"/>
      <path d="M35 18 L36 15 L37 18 L40 18 L37.5 19.8 L38.5 22.8 L36 21 L33.5 22.8 L34.5 19.8 L32 18Z" fill="#7C3AED" opacity="0.7" transform="scale(0.6) translate(27 15)"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">Mentor</text>
    </svg>
  );
}

export function RoleComicSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      {/* Round face */}
      <circle cx="24" cy="22" r="14" fill="#FCA5A5" opacity="0.5"/>
      <circle cx="24" cy="22" r="14" stroke="#F43F5E" strokeWidth="1.5" fill="none"/>
      {/* Big grin */}
      <path d="M16 26 Q24 34 32 26" fill="#F43F5E" opacity="0.5"/>
      <path d="M16 26 Q24 34 32 26" stroke="#BE123C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Eyes squinting with joy */}
      <path d="M17 18 Q20 15 23 18" stroke="#BE123C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M25 18 Q28 15 31 18" stroke="#BE123C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Stars */}
      <circle cx="10" cy="12" r="2" fill="#FDE68A"/>
      <circle cx="38" cy="12" r="2" fill="#FDE68A"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Comic Relief</text>
    </svg>
  );
}

export function RoleCompanionSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Two figures side by side */}
      <circle cx="17" cy="14" r="4" fill="#22C55E"/>
      <rect x="12" y="18" width="9" height="12" rx="3" fill="#22C55E"/>
      <circle cx="31" cy="14" r="4" fill="#4ADE80"/>
      <rect x="26" y="18" width="9" height="12" rx="3" fill="#4ADE80"/>
      {/* Holding hands */}
      <path d="M21 24 L26 24" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Heart above */}
      <path d="M24 9 C23 7 21 7 21 9 C21 10.5 22.5 11.5 24 13 C25.5 11.5 27 10.5 27 9 C27 7 25 7 24 9Z" fill="#22C55E" opacity="0.8"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#15803D" fontFamily="sans-serif" fontWeight="bold">Companion</text>
    </svg>
  );
}

export function RoleChallengerSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Shield + lightning */}
      <path d="M24 6 L36 10 L36 24 Q36 34 24 40 Q12 34 12 24 L12 10Z" fill="#FED7AA" stroke="#F97316" strokeWidth="1.5"/>
      <path d="M28 12 L20 22 L24 22 L16 34 L30 20 L26 20Z" fill="#F97316"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9A3412" fontFamily="sans-serif" fontWeight="bold">Challenger</text>
    </svg>
  );
}

export const LITERARY_ROLE_OPTIONS = [
  { value: "Protagonist — the hero whose journey drives the entire story",                    label: "Protagonist",    icon: <RoleProtagonistSvg /> },
  { value: "Wise mentor — guides the protagonist with wisdom and faith",                       label: "Wise Mentor",    icon: <RoleMentorSvg /> },
  { value: "Comic relief — brings lightness, humour and humanity",                             label: "Comic Relief",   icon: <RoleComicSvg /> },
  { value: "Loyal companion — steadfast friend who acts as mirror and support",                label: "Companion",      icon: <RoleCompanionSvg /> },
  { value: "Challenger — tests the hero, forces growth, represents opposing values",           label: "Challenger",     icon: <RoleChallengerSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// BOOK FORMATTING — page layout & illustration style (48×48)
// ══════════════════════════════════════════════════════════════════

export function LayoutImageLeftSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Page */}
      <rect x="4" y="8" width="40" height="32" rx="3" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="24" y1="8" x2="24" y2="40" stroke="#BFDBFE" strokeWidth="1" strokeDasharray="2 2"/>
      {/* Image left (mountain scene) */}
      <rect x="5" y="9" width="18" height="30" rx="2" fill="#BFDBFE"/>
      <path d="M8 32 L14 20 L20 32Z" fill="#3B82F6" opacity="0.6"/>
      <circle cx="17" cy="17" r="4" fill="#FCD34D" opacity="0.8"/>
      {/* Text lines right */}
      <line x1="27" y1="16" x2="42" y2="16" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="27" y1="20" x2="40" y2="20" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <line x1="27" y1="24" x2="42" y2="24" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <line x1="27" y1="28" x2="39" y2="28" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <line x1="27" y1="32" x2="41" y2="32" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Image Left</text>
    </svg>
  );
}

export function LayoutFullBleedSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Full page image */}
      <rect x="4" y="8" width="40" height="32" rx="3" fill="#BBF7D0"/>
      {/* Scene */}
      <path d="M4 28 Q14 18 24 24 Q34 18 44 28 L44 40 Q44 40 4 40Z" fill="#34D399" opacity="0.5"/>
      <circle cx="36" cy="14" r="5" fill="#FCD34D" opacity="0.8"/>
      {/* Text overlay bar at bottom */}
      <rect x="4" y="33" width="40" height="7" rx="0" fill="#1F2937" opacity="0.6"/>
      <line x1="10" y1="37" x2="38" y2="37" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Full Bleed</text>
    </svg>
  );
}

export function LayoutTopImgSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Page */}
      <rect x="4" y="8" width="40" height="32" rx="3" fill="#FFF" stroke="#FED7AA" strokeWidth="1.5"/>
      {/* Image top half */}
      <rect x="4" y="8" width="40" height="18" rx="3" fill="#FED7AA"/>
      <path d="M8 24 L16 14 L24 20 L30 14 L44 24Z" fill="#F97316" opacity="0.5"/>
      <circle cx="34" cy="14" r="4" fill="#FCD34D" opacity="0.8"/>
      {/* Text bottom */}
      <line x1="10" y1="32" x2="38" y2="32" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="36" x2="35" y2="36" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9A3412" fontFamily="sans-serif" fontWeight="bold">Top Image</text>
    </svg>
  );
}

export function LayoutSplitSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF4FF" rx="8"/>
      {/* Two pages side by side */}
      <rect x="4" y="8" width="19" height="32" rx="3" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1"/>
      <rect x="25" y="8" width="19" height="32" rx="3" fill="#FFF" stroke="#A855F7" strokeWidth="1"/>
      {/* Left — full image */}
      <path d="M6 30 L12 18 L18 30Z" fill="#A855F7" opacity="0.5"/>
      <circle cx="16" cy="14" r="3" fill="#FCD34D" opacity="0.7"/>
      {/* Right — text */}
      <line x1="28" y1="15" x2="41" y2="15" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="28" y1="19" x2="40" y2="19" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <line x1="28" y1="23" x2="41" y2="23" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <line x1="28" y1="27" x2="39" y2="27" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <line x1="28" y1="31" x2="40" y2="31" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#6B21A8" fontFamily="sans-serif" fontWeight="bold">Spread Split</text>
    </svg>
  );
}

export const PAGE_LAYOUT_OPTIONS = [
  { value: "Left full-page image, right text block (100–150 words max)",       label: "Image Left",     icon: <LayoutImageLeftSvg /> },
  { value: "Full-bleed image with text overlay bar at bottom",                  label: "Full Bleed",     icon: <LayoutFullBleedSvg /> },
  { value: "Top image (2/3 height), bottom text band",                          label: "Top Image",      icon: <LayoutTopImgSvg /> },
  { value: "Left page full illustration, right page full text spread",          label: "Spread Split",   icon: <LayoutSplitSvg /> },
];

export function IllustPixarSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* 3D-ish round character */}
      <circle cx="24" cy="20" r="12" fill="#60A5FA"/>
      <circle cx="24" cy="20" r="12" fill="url(#px3d)" opacity="0.4"/>
      <defs>
        <radialGradient id="px3d" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Eyes */}
      <circle cx="20" cy="18" r="3" fill="#FFF"/>
      <circle cx="28" cy="18" r="3" fill="#FFF"/>
      <circle cx="20.8" cy="18" r="1.8" fill="#1D4ED8"/>
      <circle cx="28.8" cy="18" r="1.8" fill="#1D4ED8"/>
      <circle cx="21.3" cy="17.4" r="0.8" fill="#FFF"/>
      <circle cx="29.3" cy="17.4" r="0.8" fill="#FFF"/>
      {/* Smile */}
      <path d="M19 24 Q24 28 29 24" stroke="#1D4ED8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Shadow */}
      <ellipse cx="24" cy="36" rx="10" ry="3" fill="#3B82F6" opacity="0.2"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">3D Rendered</text>
    </svg>
  );
}

export function IllustFlatSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Flat geometric shapes — character */}
      <rect x="18" y="8" width="12" height="12" rx="6" fill="#F59E0B"/>
      <rect x="16" y="20" width="16" height="14" rx="2" fill="#10B981"/>
      {/* Arms */}
      <rect x="8" y="20" width="8" height="4" rx="2" fill="#F59E0B"/>
      <rect x="32" y="20" width="8" height="4" rx="2" fill="#F59E0B"/>
      {/* Legs */}
      <rect x="16" y="34" width="6" height="8" rx="2" fill="#6366F1"/>
      <rect x="26" y="34" width="6" height="8" rx="2" fill="#6366F1"/>
      {/* Face dots */}
      <circle cx="22" cy="12" r="1.5" fill="#1F2937"/>
      <circle cx="26" cy="12" r="1.5" fill="#1F2937"/>
      <line x1="21" y1="16" x2="27" y2="16" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Flat Illustrative</text>
    </svg>
  );
}

export function IllustWatercolorSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wcBlur"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="48" height="48" fill="#FFF0F9" rx="8"/>
      {/* Watercolor blobs */}
      <ellipse cx="20" cy="20" rx="14" ry="12" fill="#F9A8D4" opacity="0.5" filter="url(#wcBlur)"/>
      <ellipse cx="28" cy="26" rx="12" ry="10" fill="#A5F3FC" opacity="0.5" filter="url(#wcBlur)"/>
      <ellipse cx="16" cy="32" rx="10" ry="8" fill="#FDE68A" opacity="0.4" filter="url(#wcBlur)"/>
      {/* Crisp brush stroke lines */}
      <path d="M12 14 Q18 10 24 14" stroke="#EC4899" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M20 20 Q26 16 32 22" stroke="#06B6D4" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#BE185D" fontFamily="sans-serif" fontWeight="bold">Watercolour</text>
    </svg>
  );
}

export function IllustBoldCartoonSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      {/* Bold outlined face */}
      <circle cx="24" cy="22" r="14" fill="#FCA5A5" stroke="#1F2937" strokeWidth="2.5"/>
      {/* Eyes — big bold */}
      <circle cx="19" cy="19" r="4" fill="#FFF" stroke="#1F2937" strokeWidth="2"/>
      <circle cx="29" cy="19" r="4" fill="#FFF" stroke="#1F2937" strokeWidth="2"/>
      <circle cx="20" cy="19" r="2" fill="#1F2937"/>
      <circle cx="30" cy="19" r="2" fill="#1F2937"/>
      {/* Bold smile */}
      <path d="M16 26 Q24 33 32 26" stroke="#1F2937" strokeWidth="2.5" fill="#F9A8D4" strokeLinecap="round"/>
      {/* Bold star */}
      <path d="M38 6 L39.5 9.5 L43 9.5 L40.5 11.5 L41.5 15 L38 13 L34.5 15 L35.5 11.5 L33 9.5 L36.5 9.5Z" fill="#FCD34D" stroke="#1F2937" strokeWidth="1"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Bold Cartoon</text>
    </svg>
  );
}

export function IllustSketchSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FAFAF9" rx="8"/>
      {/* Sketchy circle head */}
      <path d="M16 16 Q15 8 24 8 Q33 8 32 16 Q32 26 24 26 Q16 26 16 16Z" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Sketch eyes */}
      <path d="M19 14 Q21 12 23 14" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M25 14 Q27 12 29 14" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M20 20 Q24 23 28 20" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Sketch body */}
      <path d="M20 26 Q18 34 18 42" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M28 26 Q30 34 30 42" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M18 32 L30 32" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Pencil texture lines */}
      <path d="M36 10 L38 8 L42 14 L40 16Z" fill="#374151" opacity="0.6"/>
      <text x="22" y="47" textAnchor="middle" fontSize="4" fill="#374151" fontFamily="sans-serif" fontWeight="bold">Pencil Sketch</text>
    </svg>
  );
}

export const ILLUSTRATION_STYLE_OPTIONS = [
  { value: "stylized 3D render, round shapes, subsurface scattering, soft shadows",        label: "3D Rendered",    icon: <IllustPixarSvg /> },
  { value: "Flat illustrative, bold geometric shapes, no gradients",                       label: "Flat",           icon: <IllustFlatSvg /> },
  { value: "Soft watercolour washes, translucent overlapping tones",                       label: "Watercolour",    icon: <IllustWatercolorSvg /> },
  { value: "Bold cartoon, thick black outlines, vivid fill colours",                       label: "Bold Cartoon",   icon: <IllustBoldCartoonSvg /> },
  { value: "Pencil sketch style, hand-drawn lines, light hatching",                        label: "Pencil Sketch",  icon: <IllustSketchSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// COVER DESIGN — title placement presets (48×48)
// ══════════════════════════════════════════════════════════════════

export function TitleTopSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      <rect x="6" y="6" width="36" height="36" rx="4" fill="#FFF" stroke="#FDA4AF" strokeWidth="1.5"/>
      {/* Title at top */}
      <rect x="8" y="9" width="32" height="7" rx="2" fill="#FB7185" opacity="0.7"/>
      <line x1="12" y1="12.5" x2="36" y2="12.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Scene in center */}
      <path d="M10 30 L18 18 L26 26 L30 20 L38 30Z" fill="#FCA5A5" opacity="0.4"/>
      <circle cx="34" cy="16" r="4" fill="#FDE68A" opacity="0.7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Title Top</text>
    </svg>
  );
}

export function TitleBottomSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      <rect x="6" y="6" width="36" height="36" rx="4" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5"/>
      {/* Scene */}
      <path d="M10 28 L18 14 L26 22 L30 14 L38 28Z" fill="#BFDBFE" opacity="0.5"/>
      <circle cx="34" cy="12" r="4" fill="#FCD34D" opacity="0.7"/>
      {/* Title at bottom */}
      <rect x="8" y="32" width="32" height="7" rx="2" fill="#3B82F6" opacity="0.7"/>
      <line x1="12" y1="35.5" x2="36" y2="35.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Title Bottom</text>
    </svg>
  );
}

export function TitleCenterSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F5F3FF" rx="8"/>
      <rect x="6" y="6" width="36" height="36" rx="4" fill="#FFF" stroke="#C4B5FD" strokeWidth="1.5"/>
      {/* Gradient bg */}
      <rect x="7" y="7" width="34" height="34" rx="3" fill="#EDE9FE" opacity="0.5"/>
      {/* Center banner */}
      <rect x="8" y="19" width="32" height="10" rx="2" fill="#7C3AED" opacity="0.7"/>
      <line x1="12" y1="24" x2="36" y2="24" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
      {/* Decorative corners */}
      <circle cx="10" cy="10" r="2" fill="#A78BFA" opacity="0.6"/>
      <circle cx="38" cy="10" r="2" fill="#A78BFA" opacity="0.6"/>
      <circle cx="10" cy="38" r="2" fill="#A78BFA" opacity="0.6"/>
      <circle cx="38" cy="38" r="2" fill="#A78BFA" opacity="0.6"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">Title Center</text>
    </svg>
  );
}

export const TITLE_PLACEMENT_OPTIONS = [
  { value: "Top 1/3 of cover, always legible at thumbnail size",                          label: "Title Top",     icon: <TitleTopSvg /> },
  { value: "Bottom 1/4 of cover, overlapping the scene",                                  label: "Title Bottom",  icon: <TitleBottomSvg /> },
  { value: "Centre of cover, on a contrasting banner",                                    label: "Title Centre",  icon: <TitleCenterSvg /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// PASTE THESE ADDITIONS INTO KBFieldIcons.tsx  (before the closing of the file)
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════
// DU'A STYLE — how this character makes du'a (48×48)
// ══════════════════════════════════════════════════════════════════

export function DuaStyleWhisperedSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#1E1B4B" rx="8"/>
      {/* Night sky */}
      <circle cx="36" cy="10" r="1.2" fill="#C4B5FD" opacity="0.7"/>
      <circle cx="10" cy="8"  r="0.9" fill="#C4B5FD" opacity="0.5"/>
      <circle cx="42" cy="18" r="0.8" fill="#C4B5FD" opacity="0.6"/>
      {/* Crescent */}
      <path d="M28 8 A7 7 0 1 1 28 22 A5 5 0 1 0 28 8Z" fill="#A78BFA" opacity="0.9"/>
      {/* Seated figure, head bowed */}
      <circle cx="18" cy="28" r="4"   fill="#6D28D9"/>
      <path d="M14 32 Q14 40 18 40 Q22 40 22 32" fill="#6D28D9" opacity="0.8"/>
      {/* Tiny speech-whisper dots */}
      <circle cx="24" cy="26" r="1"   fill="#DDD6FE" opacity="0.5"/>
      <circle cx="27" cy="23" r="0.7" fill="#DDD6FE" opacity="0.4"/>
      <circle cx="30" cy="21" r="0.5" fill="#DDD6FE" opacity="0.3"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#C4B5FD" fontFamily="sans-serif" fontWeight="bold">Whispered</text>
    </svg>
  );
}

export function DuaStyleFamilySvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Prayer mat */}
      <path d="M4 36 Q24 32 44 36 L44 40 Q24 44 4 40Z" fill="#A7F3D0" opacity="0.6"/>
      {/* Three figures side by side */}
      {/* Adult left */}
      <circle cx="12" cy="22" r="4.5" fill="#059669"/>
      <path d="M8 27 Q8 36 12 36 Q16 36 16 27" fill="#059669" opacity="0.7"/>
      <path d="M8 29 L4 27 M16 29 L20 27" stroke="#059669" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Child center */}
      <circle cx="24" cy="24" r="3.5" fill="#34D399"/>
      <path d="M21 28 Q21 36 24 36 Q27 36 27 28" fill="#34D399" opacity="0.7"/>
      <path d="M21 30 L18 28 M27 30 L30 28" stroke="#34D399" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Adult right */}
      <circle cx="36" cy="22" r="4.5" fill="#10B981"/>
      <path d="M32 27 Q32 36 36 36 Q40 36 40 27" fill="#10B981" opacity="0.7"/>
      <path d="M32 29 L28 27 M40 29 L44 27" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Glow above */}
      <ellipse cx="24" cy="16" rx="8" ry="4" fill="#FCD34D" opacity="0.2"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">With Family</text>
    </svg>
  );
}

export function DuaStyleJoyfulSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Radiant sun-burst */}
      <circle cx="24" cy="22" r="9" fill="#FCD34D" opacity="0.8"/>
      {[0,40,80,120,160,200,240,280,320].map((a,i)=>(
        <line key={i}
          x1={24+Math.cos(a*Math.PI/180)*11} y1={22+Math.sin(a*Math.PI/180)*11}
          x2={24+Math.cos(a*Math.PI/180)*15} y2={22+Math.sin(a*Math.PI/180)*15}
          stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Raised hands figure */}
      <circle cx="24" cy="18" r="3.5" fill="#F59E0B"/>
      <path d="M16 26 Q14 20 16 16" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M32 26 Q34 20 32 16" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M20 26 Q22 32 24 34 Q26 32 28 26" fill="#F59E0B" opacity="0.6"/>
      {/* Stars */}
      <circle cx="8"  cy="10" r="1.5" fill="#FDE68A"/>
      <circle cx="40" cy="10" r="1.5" fill="#FDE68A"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Out Loud, Joyful</text>
    </svg>
  );
}

export function DuaStyleTearsHardshipSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Soft rain lines */}
      {[[8,6],[14,4],[20,8],[28,4],[34,6],[40,4]].map(([x,y],i)=>(
        <line key={i} x1={x} y1={y} x2={x-2} y2={y+8}
          stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      ))}
      {/* Figure with hands raised, head up */}
      <circle cx="24" cy="20" r="4.5" fill="#3B82F6"/>
      <path d="M20 25 Q20 34 24 34 Q28 34 28 25" fill="#3B82F6" opacity="0.7"/>
      <path d="M20 27 L14 24" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M28 27 L34 24" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Teardrop */}
      <path d="M22 19 Q22 22 24 23 Q26 22 26 19 Q24 16 22 19Z" fill="#BFDBFE"/>
      {/* Glow/hope */}
      <circle cx="24" cy="8" r="3" fill="#DBEAFE"/>
      <circle cx="24" cy="8" r="1.5" fill="#3B82F6"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">In Hardship</text>
    </svg>
  );
}

export function DuaStyleQuickShortSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Fast clock */}
      <circle cx="24" cy="22" r="12" fill="#FFF" stroke="#F97316" strokeWidth="2"/>
      <circle cx="24" cy="22" r="1.5" fill="#F97316"/>
      <line x1="24" y1="22" x2="24" y2="14" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="22" x2="30" y2="22" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
      {/* Speed lines outside clock */}
      <line x1="38" y1="16" x2="44" y2="14" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="38" y1="22" x2="45" y2="22" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="38" y1="28" x2="44" y2="30" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Lightning bolt */}
      <path d="M28 14 L22 22 L25 22 L19 30 L29 20 L26 20Z" fill="#F97316" opacity="0.7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9A3412" fontFamily="sans-serif" fontWeight="bold">Quick & Brief</text>
    </svg>
  );
}

export function DuaStyleLongReflectiveSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F5F3FF" rx="8"/>
      {/* Meditative seated figure */}
      <circle cx="24" cy="18" r="5" fill="#7C3AED"/>
      {/* Crossed-leg pose */}
      <path d="M18 24 Q14 30 18 32 Q22 32 24 28 Q26 32 30 32 Q34 30 30 24" fill="#7C3AED" opacity="0.7"/>
      <path d="M18 26 Q24 22 30 26" stroke="#A78BFA" strokeWidth="1" fill="none"/>
      {/* Thought spiral */}
      <path d="M34 10 Q38 10 38 14 Q38 18 34 18 Q30 18 30 14 Q30 12 32 12" stroke="#C4B5FD" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="30" cy="14" r="1" fill="#7C3AED"/>
      {/* Aura rings */}
      <circle cx="24" cy="22" r="14" fill="none" stroke="#DDD6FE" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="24" cy="22" r="18" fill="none" stroke="#DDD6FE" strokeWidth="0.5" opacity="0.3"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">Long & Reflective</text>
    </svg>
  );
}

export const DUA_STYLE_OPTIONS = [
  { value: "Whispered quietly in solitude, private and intimate",              label: "Whispered",       icon: <DuaStyleWhisperedSvg /> },
  { value: "Recited warmly with family, communal and bonding",                 label: "With Family",     icon: <DuaStyleFamilySvg /> },
  { value: "Out loud and joyfully, with full heart and energy",                label: "Joyful & Aloud",  icon: <DuaStyleJoyfulSvg /> },
  { value: "In tears or hardship, sincere and desperate",                      label: "In Hardship",     icon: <DuaStyleTearsHardshipSvg /> },
  { value: "Quick and brief, woven naturally into actions",                    label: "Quick & Brief",   icon: <DuaStyleQuickShortSvg /> },
  { value: "Long and reflective, meditative and contemplative",                label: "Long & Reflective", icon: <DuaStyleLongReflectiveSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// ISLAMIC TRAITS — character trait preset tiles (48×48)
// ══════════════════════════════════════════════════════════════════

export function TraitPatientSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EDE7F6" rx="8"/>
      <path d="M16 8 L32 8 L24 22 L32 40 L16 40 L24 28Z" fill="#7C3AED" opacity="0.15"/>
      <path d="M16 8 L32 8 L24 20Z" fill="#7C3AED" opacity="0.7"/>
      <path d="M16 40 L32 40 L24 28Z" fill="#7C3AED" opacity="0.4"/>
      <rect x="14" y="7"   width="20" height="2.5" rx="1.2" fill="#7C3AED"/>
      <rect x="14" y="38.5" width="20" height="2.5" rx="1.2" fill="#7C3AED"/>
      <circle cx="24" cy="24" r="2" fill="#C4B5FD"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">Patient</text>
    </svg>
  );
}

export function TraitGratefulSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      <path d="M14 30 Q10 20 12 12 Q14 8 17 10 Q18 8 20 9 Q21 7 23 9 L23 26" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M34 30 Q38 20 36 12 Q34 8 31 10 Q30 8 28 9 Q27 7 25 9 L25 26" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 30 Q24 34 34 30" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="24" cy="8" r="2" fill="#FCD34D"/>
      <circle cx="12" cy="6" r="1.2" fill="#FCD34D" opacity="0.7"/>
      <circle cx="36" cy="6" r="1.2" fill="#FCD34D" opacity="0.7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Grateful</text>
    </svg>
  );
}

export function TraitHonestSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      <rect x="22.5" y="10" width="3" height="26" rx="1.5" fill="#16A34A"/>
      <rect x="18" y="36" width="12" height="3" rx="1.5" fill="#16A34A"/>
      <rect x="10" y="12" width="28" height="2" rx="1" fill="#16A34A"/>
      <line x1="13" y1="14" x2="13" y2="22" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M8 22 Q13 20 18 22" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
      <line x1="35" y1="14" x2="35" y2="22" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M30 22 Q35 20 40 22" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
      <circle cx="24" cy="11" r="2.5" fill="#BBF7D0"/>
      <circle cx="24" cy="11" r="1.5" fill="#16A34A"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#15803D" fontFamily="sans-serif" fontWeight="bold">Honest</text>
    </svg>
  );
}

export function TraitBraveSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      <path d="M24 8 L36 13 L36 26 Q36 34 24 40 Q12 34 12 26 L12 13Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5"/>
      <path d="M24 12 L32 16 L32 26 Q32 32 24 37 Q16 32 16 26 L16 16Z" fill="#FCD34D" opacity="0.5"/>
      <path d="M24 18 L25.5 22 L30 22 L26.5 24.5 L28 28.5 L24 26 L20 28.5 L21.5 24.5 L18 22 L22.5 22Z" fill="#D97706"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Brave</text>
    </svg>
  );
}

export function TraitGenerousSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      <path d="M10 30 Q10 22 16 20 L28 20 Q32 20 32 24 Q32 26 28 26 L22 26" stroke="#E11D48" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 30 L34 30 Q40 30 40 26 Q40 22 34 22" stroke="#E11D48" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M8 30 L36 30 Q42 30 42 36 L8 36 Z" fill="#E11D48" opacity="0.15"/>
      <path d="M24 14 C22 11 18 11 18 14.5 C18 17 21 19.5 24 22 C27 19.5 30 17 30 14.5 C30 11 26 11 24 14Z" fill="#E11D48"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Generous</text>
    </svg>
  );
}

export function TraitHumbleSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Head bowed low */}
      <circle cx="24" cy="16" r="5" fill="#3B82F6"/>
      {/* Bowing body */}
      <path d="M20 21 Q14 30 14 36" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M28 21 Q26 28 14 36" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M14 36 L34 36" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      {/* Small crown they aren't wearing */}
      <path d="M32 10 L34 16 L38 14 L36 20 L28 20 L26 14 L30 16Z" fill="#FCD34D" opacity="0.6"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Humble</text>
    </svg>
  );
}

export function TraitTrustworthySvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Handshake */}
      <path d="M8 28 Q10 22 14 20 L20 20 Q22 20 22 22 L22 26 Q22 28 20 28 L14 28" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 28 Q38 22 34 20 L28 20 Q26 20 26 22 L26 26 Q26 28 28 28 L34 28" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 28 Q24 32 34 28" stroke="#059669" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Check mark above */}
      <circle cx="24" cy="12" r="6" fill="#BBF7D0" stroke="#059669" strokeWidth="1.5"/>
      <path d="M20 12 L23 15 L28 9" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Trustworthy</text>
    </svg>
  );
}

export function TraitForgivingSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Two figures reconciling */}
      <circle cx="14" cy="16" r="4" fill="#F97316"/>
      <path d="M10 20 Q10 28 14 28" stroke="#F97316" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="34" cy="16" r="4" fill="#FB923C"/>
      <path d="M38 20 Q38 28 34 28" stroke="#FB923C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Hands meeting in middle */}
      <path d="M14 26 Q19 30 24 28 Q29 30 34 26" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Dove between them */}
      <path d="M22 18 Q24 12 26 18 Q24 16 22 18Z" fill="#FFF" opacity="0.9"/>
      <circle cx="26" cy="17" r="1.5" fill="#FEF3C7"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#C2410C" fontFamily="sans-serif" fontWeight="bold">Forgiving</text>
    </svg>
  );
}

export function TraitCuriousSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F5F3FF" rx="8"/>
      {/* Magnifying glass */}
      <circle cx="20" cy="20" r="9" fill="none" stroke="#7C3AED" strokeWidth="2.5"/>
      <circle cx="20" cy="20" r="6" fill="#EDE9FE" opacity="0.6"/>
      <line x1="27" y1="27" x2="36" y2="36" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"/>
      {/* Question mark inside */}
      <text x="20" y="25" textAnchor="middle" fontSize="10" fill="#7C3AED" fontFamily="sans-serif" fontWeight="bold">?</text>
      {/* Stars of curiosity */}
      <circle cx="38" cy="10" r="1.5" fill="#C4B5FD"/>
      <circle cx="10" cy="12" r="1"   fill="#C4B5FD"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#5B21B6" fontFamily="sans-serif" fontWeight="bold">Curious</text>
    </svg>
  );
}

export function TraitProtectiveSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#ECFDF5" rx="8"/>
      {/* Big figure sheltering small */}
      <circle cx="20" cy="14" r="5.5" fill="#059669"/>
      <path d="M14 20 Q12 32 14 38 L26 38 Q28 32 26 20Z" fill="#059669" opacity="0.8"/>
      {/* Arms wide open sheltering */}
      <path d="M14 24 L6 20 M26 24 L40 18" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Small figure underneath */}
      <circle cx="20" cy="30" r="3" fill="#34D399"/>
      <path d="M17 33 Q17 38 20 38 Q23 38 23 33" fill="#34D399" opacity="0.7"/>
      {/* Heart above */}
      <path d="M20 8 C19 6 17 6 17 8 C17 9.5 18.5 10.5 20 12 C21.5 10.5 23 9.5 23 8 C23 6 21 6 20 8Z" fill="#34D399" opacity="0.8"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Protective</text>
    </svg>
  );
}

export const ISLAMIC_TRAIT_PRESETS = [
  { value: "Patient",      icon: <TraitPatientSvg /> },
  { value: "Grateful",     icon: <TraitGratefulSvg /> },
  { value: "Honest",       icon: <TraitHonestSvg /> },
  { value: "Brave",        icon: <TraitBraveSvg /> },
  { value: "Generous",     icon: <TraitGenerousSvg /> },
  { value: "Humble",       icon: <TraitHumbleSvg /> },
  { value: "Trustworthy",  icon: <TraitTrustworthySvg /> },
  { value: "Forgiving",    icon: <TraitForgivingSvg /> },
  { value: "Curious",      icon: <TraitCuriousSvg /> },
  { value: "Protective",   icon: <TraitProtectiveSvg /> },
];

// ══════════════════════════════════════════════════════════════════
// FAITH EXPRESSIONS — observable acts of faith the character shows (48×48)
// ══════════════════════════════════════════════════════════════════

export function ExprWuduSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Tap/faucet with water */}
      <rect x="20" y="8" width="8" height="12" rx="2" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
      <path d="M20 14 L12 14 Q10 14 10 18 L10 20" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M8 20 L12 20" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Water drops */}
      <path d="M24 20 Q24 26 26 28 Q28 26 26 20 Q25 18 24 20Z" fill="#60A5FA" opacity="0.8"/>
      <path d="M26 22 Q26 27 28 29 Q30 27 28 22 Q27 20 26 22Z" fill="#93C5FD" opacity="0.6"/>
      {/* Hands below */}
      <path d="M10 34 Q12 28 18 28 L22 28 Q24 28 24 30 L24 34" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38 34 Q36 28 30 28 L26 28 Q24 28 24 30 L24 34" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Makes Wudu</text>
    </svg>
  );
}

export function ExprQuranSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFFBEB" rx="8"/>
      {/* Open Quran */}
      <path d="M6 10 Q6 34 24 36 Q42 34 42 10Z" fill="#FDE68A" opacity="0.5"/>
      <line x1="24" y1="10" x2="24" y2="36" stroke="#D97706" strokeWidth="2"/>
      <rect x="6"  y="8" width="17" height="26" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2"/>
      <rect x="25" y="8" width="17" height="26" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2"/>
      {/* Arabic-feel lines */}
      <line x1="9"  y1="15" x2="21" y2="15" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="9"  y1="19" x2="20" y2="19" stroke="#F59E0B" strokeWidth="1"   strokeLinecap="round"/>
      <line x1="9"  y1="23" x2="21" y2="23" stroke="#F59E0B" strokeWidth="1"   strokeLinecap="round"/>
      <line x1="9"  y1="27" x2="19" y2="27" stroke="#F59E0B" strokeWidth="1"   strokeLinecap="round"/>
      <line x1="27" y1="15" x2="39" y2="15" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="27" y1="19" x2="38" y2="19" stroke="#F59E0B" strokeWidth="1"   strokeLinecap="round"/>
      <line x1="27" y1="23" x2="39" y2="23" stroke="#F59E0B" strokeWidth="1"   strokeLinecap="round"/>
      <line x1="27" y1="27" x2="37" y2="27" stroke="#F59E0B" strokeWidth="1"   strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#92400E" fontFamily="sans-serif" fontWeight="bold">Reads Quran</text>
    </svg>
  );
}

export function ExprBismillahSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0FDF4" rx="8"/>
      {/* Five-pointed star + glow */}
      <circle cx="24" cy="20" r="12" fill="#BBF7D0" opacity="0.4"/>
      <path d="M24 8 L26.5 15.5 L34.5 15.5 L28.2 20 L30.8 27.5 L24 23 L17.2 27.5 L19.8 20 L13.5 15.5 L21.5 15.5Z" fill="#059669"/>
      {/* Hand pointing inward (about to start) */}
      <path d="M10 36 Q14 30 20 32 L20 38" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M38 36 Q34 30 28 32 L28 38" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M20 38 L28 38" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#065F46" fontFamily="sans-serif" fontWeight="bold">Says Bismillah</text>
    </svg>
  );
}

export function ExprHelpOthersSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="8"/>
      {/* Figure 1 giving to figure 2 */}
      <circle cx="14" cy="14" r="4.5" fill="#F97316"/>
      <path d="M10 19 Q10 28 12 32" stroke="#F97316" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M18 19 Q18 26 20 30" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Extended arm with gift */}
      <path d="M18 22 L28 24" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Gift box */}
      <rect x="28" y="20" width="8" height="8" rx="1.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <line x1="32" y1="20" x2="32" y2="28" stroke="#D97706" strokeWidth="1"/>
      <path d="M30 20 Q32 17 34 20" stroke="#D97706" strokeWidth="1" fill="none"/>
      {/* Receiving figure */}
      <circle cx="38" cy="18" r="3.5" fill="#FB923C"/>
      <path d="M34 22 Q34 30 36 32" stroke="#FB923C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9A3412" fontFamily="sans-serif" fontWeight="bold">Helps Others</text>
    </svg>
  );
}

export function ExprMasjidSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#EFF6FF" rx="8"/>
      {/* Mosque */}
      <rect x="14" y="22" width="20" height="18" rx="2" fill="#3B82F6" opacity="0.6"/>
      <path d="M14 22 Q24 12 34 22Z" fill="#3B82F6" opacity="0.7"/>
      <rect x="18" y="14" width="12" height="8" rx="2" fill="#3B82F6" opacity="0.6"/>
      <path d="M18 14 Q24 9 30 14Z" fill="#3B82F6" opacity="0.7"/>
      <rect x="22" y="6" width="4" height="8" rx="2" fill="#60A5FA"/>
      <circle cx="24" cy="5"  r="2.5" fill="#FCD34D"/>
      {/* Door */}
      <path d="M20 40 L20 32 Q24 28 28 32 L28 40Z" fill="#1D4ED8" opacity="0.6"/>
      {/* Stars */}
      <circle cx="8"  cy="10" r="1.2" fill="#93C5FD"/>
      <circle cx="40" cy="12" r="1.2" fill="#93C5FD"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">Goes to Masjid</text>
    </svg>
  );
}

export function ExprFastingSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF4FF" rx="8"/>
      {/* Crescent + sun both visible = Ramadan */}
      <path d="M30 8 A8 8 0 1 1 30 24 A5.5 5.5 0 1 0 30 8Z" fill="#A855F7"/>
      <circle cx="12" cy="14" r="5" fill="#FCD34D" opacity="0.7"/>
      {[0,60,120,180,240,300].map((a,i)=>(
        <line key={i}
          x1={12+Math.cos(a*Math.PI/180)*7}  y1={14+Math.sin(a*Math.PI/180)*7}
          x2={12+Math.cos(a*Math.PI/180)*9}  y2={14+Math.sin(a*Math.PI/180)*9}
          stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
      ))}
      {/* Lantern / fanoos */}
      <path d="M20 28 L22 24 L26 24 L28 28 L28 38 L20 38Z" fill="#E879F9" opacity="0.6" stroke="#A855F7" strokeWidth="1"/>
      <rect x="22" y="22" width="4" height="3" rx="1" fill="#A855F7"/>
      <path d="M20 28 L28 28" stroke="#A855F7" strokeWidth="1"/>
      <path d="M20 33 L28 33" stroke="#A855F7" strokeWidth="1"/>
      <line x1="24" y1="20" x2="24" y2="22" stroke="#A855F7" strokeWidth="1.5"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4.5" fill="#7E22CE" fontFamily="sans-serif" fontWeight="bold">Fasting</text>
    </svg>
  );
}

export function ExprDuaBeforeSleepFaithSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#1E1B4B" rx="8"/>
      <path d="M30 8 A9 9 0 1 1 30 26 A6 6 0 1 0 30 8Z" fill="#818CF8"/>
      <circle cx="10" cy="10" r="1.2" fill="#FDE68A"/>
      <circle cx="16" cy="6"  r="0.8" fill="#FDE68A"/>
      <circle cx="6"  cy="18" r="0.8" fill="#FDE68A"/>
      <circle cx="40" cy="8"  r="1.2" fill="#FDE68A"/>
      {/* Bed */}
      <rect x="6"  y="34" width="36" height="7" rx="3" fill="#312E81" opacity="0.7"/>
      <rect x="6"  y="34" width="14" height="7" rx="3" fill="#4338CA" opacity="0.8"/>
      {/* Hands folded on bed — du'a before sleep */}
      <path d="M18 32 Q22 28 26 32 Q22 30 18 32Z" fill="#A5B4FC" opacity="0.8"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#C7D2FE" fontFamily="sans-serif" fontWeight="bold">Du'a Before Sleep</text>
    </svg>
  );
}

export function ExprSadaqahFaithSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF1F2" rx="8"/>
      <path d="M24 14 C22 11 18 11 18 14.5 C18 17 21 19.5 24 22 C27 19.5 30 17 30 14.5 C30 11 26 11 24 14Z" fill="#E11D48"/>
      <path d="M10 30 Q10 22 16 20 L28 20 Q32 20 32 24 Q32 26 28 26 L22 26" stroke="#F43F5E" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 30 L34 30 Q40 30 40 26 Q40 22 34 22" stroke="#F43F5E" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="8" y="30" width="32" height="8" rx="2" fill="#FCA5A5" opacity="0.4"/>
      <text x="24" y="47" textAnchor="middle" fontSize="4" fill="#9F1239" fontFamily="sans-serif" fontWeight="bold">Gives Sadaqah</text>
    </svg>
  );
}

export const FAITH_EXPRESSION_PRESETS = [
  { value: "Copies parent's wudu without being asked",                   label: "Makes Wudu",        icon: <ExprWuduSvg /> },
  { value: "Reads or listens to Quran daily",                            label: "Reads Quran",       icon: <ExprQuranSvg /> },
  { value: "Says Bismillah before starting every task",                  label: "Says Bismillah",    icon: <ExprBismillahSvg /> },
  { value: "Spontaneously helps those in need without being asked",      label: "Helps Others",      icon: <ExprHelpOthersSvg /> },
  { value: "Looks forward to going to the masjid",                       label: "Loves Masjid",      icon: <ExprMasjidSvg /> },
  { value: "Observes fasting with joy and understanding",                label: "Fasting",           icon: <ExprFastingSvg /> },
  { value: "Makes du'a before going to sleep every night",               label: "Nightly Du'a",      icon: <ExprDuaBeforeSleepFaithSvg /> },
  { value: "Gives sadaqah from their pocket money or belongings",        label: "Gives Sadaqah",     icon: <ExprSadaqahFaithSvg /> },
];