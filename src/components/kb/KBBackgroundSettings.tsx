import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Age group tabs ────────────────────────────────────────────────────────────
const AGE_GROUPS = [
  {
    key: "junior",
    label: "Junior",
    sub: "Ages 5–8",
    emoji: "🌟",
    accent: "violet",
    ring: "ring-violet-400",
    active: "bg-violet-600 text-white border-violet-600",
    inactive: "bg-white text-violet-700 border-violet-200 hover:border-violet-400",
    fieldBg: "bg-violet-50/50",
    fieldBorder: "border-violet-100",
  },
  {
    key: "middleGrade",
    label: "Middle Grade",
    sub: "Ages 8–13",
    emoji: "📚",
    accent: "blue",
    ring: "ring-blue-400",
    active: "bg-blue-600 text-white border-blue-600",
    inactive: "bg-white text-blue-700 border-blue-200 hover:border-blue-400",
    fieldBg: "bg-blue-50/50",
    fieldBorder: "border-blue-100",
  },
  {
    key: "saeeda",
    label: "Saeeda Series",
    sub: "Micro-World",
    emoji: "🌸",
    accent: "pink",
    ring: "ring-pink-400",
    active: "bg-pink-500 text-white border-pink-500",
    inactive: "bg-white text-pink-700 border-pink-200 hover:border-pink-400",
    fieldBg: "bg-pink-50/50",
    fieldBorder: "border-pink-100",
  },
] as const;

// ─── SVG option tile helper ────────────────────────────────────────────────────
function VisualTile({
  label, icon, selected, onClick,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md text-center w-full",
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
      )}
    >
      <div className="w-16 h-16">{icon}</div>
      <span className={cn("text-xs font-semibold leading-tight", selected ? "text-blue-700" : "text-gray-700")}>
        {label}
      </span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
    </button>
  );
}

// ─── Inline tag pill row ───────────────────────────────────────────────────────
function TagPills({
  items, onRemove, onAdd, placeholder,
}: {
  items: string[];
  onRemove: (i: number) => void;
  onAdd: (v: string) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200">
            {item}
            <button onClick={() => onRemove(i)} className="hover:text-red-500 ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground italic">None added yet</span>}
      </div>
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder={placeholder}
          className="text-sm h-9"
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
        />
        <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── TIME OF DAY icons ─────────────────────────────────────────────────────────
function SvgMorning() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF9C4" />
      <rect y="44" width="80" height="36" rx="0" fill="#C8E6C9" />
      <ellipse cx="40" cy="44" rx="40" ry="10" fill="#FFF176" opacity="0.7" />
      {/* sun just rising */}
      <circle cx="40" cy="44" r="16" fill="#FFD740" />
      <rect y="44" width="80" height="36" fill="#A5D6A7" />
      {/* rays */}
      {[0,45,90,135,225,270,315].map((a,i)=>(
        <line key={i} x1={40+Math.cos(a*Math.PI/180)*18} y1={44+Math.sin(a*Math.PI/180)*18}
          x2={40+Math.cos(a*Math.PI/180)*24} y2={44+Math.sin(a*Math.PI/180)*24}
          stroke="#FFB300" strokeWidth="3" strokeLinecap="round"/>
      ))}
      <path d="M24 44 A16 16 0 0 1 56 44Z" fill="#FFD740" />
      {/* birds */}
      <path d="M14 26 Q17 23 20 26" stroke="#546E7A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M24 22 Q27 19 30 22" stroke="#546E7A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function SvgAfternoon() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#E3F2FD" />
      <rect y="50" width="80" height="30" fill="#A5D6A7" />
      <rect width="80" height="50" fill="#81D4FA" />
      <circle cx="40" cy="20" r="14" fill="#FFD740" />
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1={40+Math.cos(a*Math.PI/180)*16} y1={20+Math.sin(a*Math.PI/180)*16}
          x2={40+Math.cos(a*Math.PI/180)*22} y2={20+Math.sin(a*Math.PI/180)*22}
          stroke="#FFB300" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      <ellipse cx="16" cy="34" rx="12" ry="6" fill="#FFF" opacity="0.9"/>
      <ellipse cx="22" cy="31" rx="9" ry="6" fill="#FFF" opacity="0.9"/>
      <ellipse cx="60" cy="30" rx="11" ry="5.5" fill="#FFF" opacity="0.8"/>
    </svg>
  );
}
function SvgEvening() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FF7043" />
      <rect width="80" height="80" rx="18" fill="url(#evGrad)"/>
      <defs>
        <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CE93D8"/>
          <stop offset="50%" stopColor="#FF7043"/>
          <stop offset="100%" stopColor="#BF360C"/>
        </linearGradient>
      </defs>
      <path d="M24 46 A16 16 0 0 1 56 46Z" fill="#FF7043"/>
      <ellipse cx="40" cy="46" rx="16" ry="3" fill="#FF5722" opacity="0.5"/>
      <rect y="46" width="80" height="34" fill="#1A237E" opacity="0.8"/>
      {/* buildings */}
      <rect x="8" y="36" width="10" height="12" fill="#0D0D2B"/>
      <rect x="22" y="30" width="8" height="18" fill="#0D0D2B"/>
      <rect x="52" y="33" width="9" height="15" fill="#0D0D2B"/>
      <rect x="64" y="38" width="10" height="10" fill="#0D0D2B"/>
      <circle cx="60" cy="14" r="2" fill="#FFF9C4"/>
      <circle cx="18" cy="18" r="1.5" fill="#FFF9C4"/>
      <circle cx="36" cy="10" r="1.5" fill="#FFF9C4" opacity="0.8"/>
    </svg>
  );
}
function SvgGoldenHour() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="ghGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB74D"/>
          <stop offset="100%" stopColor="#FF6F00"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#ghGrad)"/>
      <circle cx="40" cy="50" r="20" fill="#FFD54F" opacity="0.9"/>
      <circle cx="40" cy="50" r="26" fill="#FFCC02" opacity="0.25"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
        <line key={i} x1={40+Math.cos(a*Math.PI/180)*22} y1={50+Math.sin(a*Math.PI/180)*22}
          x2={40+Math.cos(a*Math.PI/180)*30} y2={50+Math.sin(a*Math.PI/180)*30}
          stroke="#FF8F00" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      ))}
      <ellipse cx="40" cy="68" rx="40" ry="8" fill="#E65100" opacity="0.4"/>
      {/* lone tree silhouette */}
      <rect x="13" y="38" width="3" height="18" fill="#BF360C" opacity="0.8"/>
      <ellipse cx="14.5" cy="36" rx="7" ry="9" fill="#2E7D32" opacity="0.7"/>
    </svg>
  );
}
function SvgNight() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#0D1B3E"/>
      {/* moon */}
      <path d="M52 18 A18 18 0 1 1 52 52 A24 24 0 0 0 52 18Z" fill="#FFF9C4"/>
      {/* stars */}
      {[[14,12],[26,8],[60,14],[70,28],[18,40],[68,48],[38,6],[50,36]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?1.5:1} fill="#FFF" opacity={0.7+i*0.04}/>
      ))}
      <rect y="60" width="80" height="20" rx="0" fill="#0A0F26"/>
      {/* ground glow */}
      <ellipse cx="40" cy="62" rx="30" ry="4" fill="#1A237E" opacity="0.5"/>
    </svg>
  );
}

// ─── CAMERA HINT icons ─────────────────────────────────────────────────────────
function SvgWideShot() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#EFF6FF"/>
      {/* camera body */}
      <rect x="8" y="22" width="64" height="42" rx="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
      <rect x="28" y="14" width="24" height="12" rx="4" fill="#93C5FD"/>
      <circle cx="40" cy="43" r="14" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2"/>
      <circle cx="40" cy="43" r="9" fill="#60A5FA"/>
      <circle cx="40" cy="43" r="5" fill="#1D4ED8"/>
      {/* wide-angle brackets */}
      <path d="M4 16 L4 66 M76 16 L76 66" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M4 16 L14 24 M4 66 L14 58 M76 16 L66 24 M76 66 L66 58" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function SvgMediumShot() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0FDF4"/>
      <rect x="14" y="18" width="52" height="48" rx="6" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2"/>
      <rect x="30" y="10" width="20" height="11" rx="4" fill="#86EFAC"/>
      <circle cx="40" cy="42" r="13" fill="#BBF7D0" stroke="#22C55E" strokeWidth="2"/>
      <circle cx="40" cy="42" r="8" fill="#4ADE80"/>
      <circle cx="40" cy="42" r="4" fill="#15803D"/>
      <path d="M14 20 L24 28 M14 64 L24 56 M66 20 L56 28 M66 64 L56 56" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function SvgCloseUp() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF7ED"/>
      {/* face close-up feel */}
      <circle cx="40" cy="38" r="26" fill="#FED7AA" stroke="#F97316" strokeWidth="2"/>
      <circle cx="31" cy="32" r="5" fill="#FFF" stroke="#F97316" strokeWidth="1.5"/>
      <circle cx="49" cy="32" r="5" fill="#FFF" stroke="#F97316" strokeWidth="1.5"/>
      <circle cx="32" cy="32" r="2.5" fill="#7C3AED"/>
      <circle cx="50" cy="32" r="2.5" fill="#7C3AED"/>
      <path d="M30 46 Q40 52 50 46" stroke="#F97316" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* tight-frame bracket */}
      <path d="M8 8 L8 26 L18 26 M72 8 L72 26 L62 26 M8 72 L8 54 L18 54 M72 72 L72 54 L62 54" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function SvgFullBody() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FDF4FF"/>
      <rect x="24" y="10" width="32" height="62" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="2"/>
      {/* stick figure */}
      <circle cx="40" cy="24" r="6" fill="#A855F7"/>
      <rect x="37" y="30" width="6" height="18" rx="3" fill="#C084FC"/>
      <line x1="37" y1="35" x2="28" y2="44" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="43" y1="35" x2="52" y2="44" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="39" y1="48" x2="34" y2="64" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="41" y1="48" x2="46" y2="64" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
function SvgOverShoulder() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#F0FDF4"/>
      {/* shoulder/back of one figure */}
      <path d="M8 80 Q8 50 24 40 Q32 36 36 36 L36 80Z" fill="#BBF7D0"/>
      {/* facing figure */}
      <circle cx="56" cy="30" r="12" fill="#34D399"/>
      <rect x="46" y="42" width="20" height="24" rx="6" fill="#059669"/>
      {/* face */}
      <circle cx="52" cy="27" r="2" fill="#065F46"/>
      <circle cx="60" cy="27" r="2" fill="#065F46"/>
      <path d="M52 34 Q56 37 60 34" stroke="#065F46" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── MOOD & TONE icons ─────────────────────────────────────────────────────────
function SvgBright() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFFDE7"/>
      <circle cx="40" cy="38" r="18" fill="#FFD740"/>
      {[0,36,72,108,144,180,216,252,288,324].map((a,i)=>(
        <line key={i} x1={40+Math.cos(a*Math.PI/180)*20} y1={38+Math.sin(a*Math.PI/180)*20}
          x2={40+Math.cos(a*Math.PI/180)*28} y2={38+Math.sin(a*Math.PI/180)*28}
          stroke="#FFB300" strokeWidth="3" strokeLinecap="round"/>
      ))}
      <circle cx="34" cy="34" r="2.5" fill="#FF6F00"/>
      <circle cx="46" cy="34" r="2.5" fill="#FF6F00"/>
      <path d="M32 44 Q40 50 48 44" stroke="#FF6F00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function SvgWarm() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF3E0"/>
      {/* cozy fire */}
      <path d="M40 60 C28 58 22 48 26 38 C28 32 30 30 30 26 C36 30 34 36 36 42 C38 36 40 28 44 22 C46 32 42 38 46 44 C48 38 52 34 54 30 C56 38 56 48 48 56 C46 58 43 60 40 60Z" fill="#FF6D00"/>
      <path d="M40 60 C32 58 28 52 30 44 C32 40 34 38 34 36 C38 40 36 46 38 50 C40 44 42 38 44 34 C46 42 42 48 46 52 C48 48 50 44 50 40 C52 46 50 54 44 58C43 59 41.5 60 40 60Z" fill="#FFAB40"/>
    </svg>
  );
}
function SvgCalm() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="calmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B2EBF2"/>
          <stop offset="100%" stopColor="#E8F5E9"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#calmGrad)"/>
      {/* water ripples */}
      <ellipse cx="40" cy="56" rx="28" ry="6" fill="#80DEEA" opacity="0.5"/>
      <ellipse cx="40" cy="56" rx="18" ry="4" fill="#4DD0E1" opacity="0.4"/>
      <ellipse cx="40" cy="56" rx="8" ry="2.5" fill="#00BCD4" opacity="0.5"/>
      {/* floating lotus */}
      {[0,72,144,216,288].map((a,i)=>(
        <ellipse key={i} cx={40+Math.cos(a*Math.PI/180)*9} cy={52+Math.sin(a*Math.PI/180)*5}
          rx="7" ry="4" fill={["#F48FB1","#F06292","#E91E63","#FCE4EC","#F8BBD0"][i]}
          transform={`rotate(${a+90} ${40+Math.cos(a*Math.PI/180)*9} ${52+Math.sin(a*Math.PI/180)*5})`} opacity="0.9"/>
      ))}
      <circle cx="40" cy="52" r="4" fill="#FFF9C4"/>
      {/* mountain */}
      <path d="M10 52 L28 24 L46 52Z" fill="#A5D6A7" opacity="0.6"/>
      <path d="M34 52 L52 28 L70 52Z" fill="#80CBC4" opacity="0.5"/>
    </svg>
  );
}
function SvgMystery() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#1A1A2E"/>
      <path d="M52 16 A18 18 0 1 1 52 50 A24 24 0 0 0 52 16Z" fill="#E1BEE7"/>
      {[[16,20],[26,10],[60,22],[70,40],[12,52]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.5" fill="#FFF" opacity={0.6+i*0.08}/>
      ))}
      {/* mist */}
      <ellipse cx="20" cy="68" rx="20" ry="6" fill="#7B1FA2" opacity="0.3"/>
      <ellipse cx="60" cy="72" rx="22" ry="5" fill="#6A1B9A" opacity="0.25"/>
      {/* trees */}
      <rect x="10" y="48" width="3" height="20" fill="#4A148C" opacity="0.8"/>
      <ellipse cx="11.5" cy="46" rx="7" ry="9" fill="#311B92" opacity="0.7"/>
      <rect x="62" y="50" width="3" height="18" fill="#4A148C" opacity="0.8"/>
      <ellipse cx="63.5" cy="48" rx="6" ry="8" fill="#311B92" opacity="0.7"/>
    </svg>
  );
}
function SvgDramatic() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="dramGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D0D0D"/>
          <stop offset="60%" stopColor="#1A237E"/>
          <stop offset="100%" stopColor="#311B92"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#dramGrad)"/>
      {/* spotlight */}
      <path d="M40 0 L58 60 L22 60Z" fill="#FFF" opacity="0.08"/>
      <circle cx="40" cy="8" r="6" fill="#FFF" opacity="0.9"/>
      <circle cx="40" cy="8" r="4" fill="#FFEB3B"/>
      {/* single hero figure in light */}
      <circle cx="40" cy="42" r="7" fill="#FFF9C4"/>
      <rect x="36" y="49" width="8" height="12" rx="4" fill="#E8EAF6"/>
      {/* lightning bolt */}
      <path d="M58 12 L52 32 L58 32 L46 56 L54 34 L48 34Z" fill="#FFD740" opacity="0.9"/>
    </svg>
  );
}

// ─── COLOR STYLE icons ─────────────────────────────────────────────────────────
function SvgVibrant() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF"/>
      <circle cx="30" cy="34" r="18" fill="#F44336" opacity="0.85"/>
      <circle cx="50" cy="34" r="18" fill="#2196F3" opacity="0.85"/>
      <circle cx="40" cy="50" r="18" fill="#FFEB3B" opacity="0.85"/>
      <circle cx="40" cy="40" r="8" fill="#FFF" opacity="0.6"/>
    </svg>
  );
}
function SvgPastels() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FCE4EC"/>
      <rect x="8" y="8" width="18" height="64" rx="6" fill="#F8BBD0"/>
      <rect x="30" y="8" width="18" height="64" rx="6" fill="#E1BEE7"/>
      <rect x="52" y="8" width="20" height="64" rx="6" fill="#BBDEFB"/>
    </svg>
  );
}
function SvgWarmTones() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="wt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6F00"/>
          <stop offset="50%" stopColor="#E65100"/>
          <stop offset="100%" stopColor="#BF360C"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#wt)"/>
      <circle cx="40" cy="40" r="22" fill="#FF8F00" opacity="0.5"/>
      <circle cx="40" cy="40" r="12" fill="#FFB300" opacity="0.6"/>
    </svg>
  );
}
function SvgCoolTones() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="ct" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#006064"/>
          <stop offset="50%" stopColor="#0277BD"/>
          <stop offset="100%" stopColor="#283593"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#ct)"/>
      <circle cx="40" cy="40" r="22" fill="#00BCD4" opacity="0.4"/>
      <circle cx="40" cy="40" r="12" fill="#80DEEA" opacity="0.5"/>
    </svg>
  );
}
function SvgEarthTones() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#5D4037"/>
      <rect x="8" y="8" width="28" height="28" rx="6" fill="#8D6E63"/>
      <rect x="44" y="8" width="28" height="28" rx="6" fill="#6D4C41"/>
      <rect x="8" y="44" width="28" height="28" rx="6" fill="#A1887F"/>
      <rect x="44" y="44" width="28" height="28" rx="6" fill="#4CAF50" opacity="0.7"/>
    </svg>
  );
}

// ─── LIGHTING STYLE icons (NEW) ────────────────────────────────────────────────
function SvgGoldenLight() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#FFF8E1"/>
      {/* big sun low */}
      <circle cx="40" cy="62" r="20" fill="#FFD740" opacity="0.7"/>
      <circle cx="40" cy="62" r="14" fill="#FFB300"/>
      {/* rays going upward */}
      {[270,290,310,330,350,10,30,50,70,90].map((a,i)=>(
        <line key={i} x1={40+Math.cos(a*Math.PI/180)*16} y1={62+Math.sin(a*Math.PI/180)*16}
          x2={40+Math.cos(a*Math.PI/180)*26} y2={62+Math.sin(a*Math.PI/180)*26}
          stroke="#FF8F00" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      {/* scene bathed in gold */}
      <ellipse cx="40" cy="62" rx="40" ry="10" fill="#FFE082" opacity="0.3"/>
      <path d="M4 62 Q40 50 76 62" stroke="#FFB300" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}
function SvgSoftDaylight() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="sdl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3F2FD"/>
          <stop offset="100%" stopColor="#FFF9C4"/>
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#sdl)"/>
      <circle cx="40" cy="18" r="12" fill="#FFF9C4" opacity="0.9"/>
      <circle cx="40" cy="18" r="8" fill="#FFF59D"/>
      {/* diffused light beams */}
      <path d="M30 30 L10 70" stroke="#FFF9C4" strokeWidth="8" strokeLinecap="round" opacity="0.4"/>
      <path d="M40 28 L40 70" stroke="#FFF9C4" strokeWidth="10" strokeLinecap="round" opacity="0.35"/>
      <path d="M50 30 L70 70" stroke="#FFF9C4" strokeWidth="8" strokeLinecap="round" opacity="0.4"/>
      <ellipse cx="16" cy="36" rx="14" ry="7" fill="#FFF" opacity="0.8"/>
      <ellipse cx="64" cy="30" rx="12" ry="6" fill="#FFF" opacity="0.7"/>
    </svg>
  );
}
function SvgDappled() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#1B5E20"/>
      {/* light patches through leaves */}
      {[[20,20],[50,14],[30,44],[62,36],[14,58],[44,62],[68,60]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx={6+i%3*2} ry={5+i%2*2} fill="#FFF9C4" opacity={0.15+i*0.04}/>
      ))}
      {/* leaves */}
      <ellipse cx="20" cy="16" rx="12" ry="8" fill="#2E7D32" transform="rotate(-30 20 16)"/>
      <ellipse cx="56" cy="12" rx="14" ry="8" fill="#388E3C" transform="rotate(20 56 12)"/>
      <ellipse cx="10" cy="44" rx="10" ry="6" fill="#1B5E20" transform="rotate(-50 10 44)"/>
      <ellipse cx="68" cy="40" rx="12" ry="7" fill="#2E7D32" transform="rotate(40 68 40)"/>
      {/* bright spot bottom */}
      <ellipse cx="40" cy="70" rx="18" ry="6" fill="#FFF9C4" opacity="0.2"/>
    </svg>
  );
}
function SvgCandlelight() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#1A0800"/>
      {/* glow */}
      <circle cx="40" cy="40" r="28" fill="#FF6D00" opacity="0.12"/>
      <circle cx="40" cy="40" r="18" fill="#FF8F00" opacity="0.15"/>
      {/* candle body */}
      <rect x="34" y="46" width="12" height="28" rx="4" fill="#FFF9C4"/>
      <rect x="34" y="56" width="12" height="4" fill="#FFE082" opacity="0.5"/>
      {/* flame */}
      <path d="M40 46 C36 40 34 32 40 26 C46 32 44 40 40 46Z" fill="#FF6D00"/>
      <path d="M40 46 C37.5 42 37 36 40 30 C43 36 42.5 42 40 46Z" fill="#FFD740"/>
      <ellipse cx="40" cy="46" rx="4" ry="2" fill="#FF8F00" opacity="0.6"/>
    </svg>
  );
}
function SvgMoonlight() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#0D1B2A"/>
      {/* moon glow */}
      <circle cx="40" cy="28" r="22" fill="#37474F" opacity="0.4"/>
      <circle cx="40" cy="28" r="16" fill="#546E7A" opacity="0.3"/>
      {/* moon */}
      <path d="M52 14 A16 16 0 1 1 52 42 A20 20 0 0 0 52 14Z" fill="#ECEFF1"/>
      {/* moon glow on ground */}
      <ellipse cx="40" cy="68" rx="30" ry="8" fill="#1A237E" opacity="0.3"/>
      <rect y="60" width="80" height="20" rx="0" fill="#0A1628"/>
      {/* stars */}
      {[[14,16],[26,8],[60,12],[70,24],[18,38]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.4" fill="#FFF" opacity={0.6+i*0.07}/>
      ))}
      {/* reflection on water */}
      <line x1="40" y1="52" x2="40" y2="70" stroke="#ECEFF1" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.3"/>
    </svg>
  );
}
function SvgRainbow() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="18" fill="#E3F2FD"/>
      <path d="M4 60 A36 36 0 0 1 76 60" stroke="#F44336" strokeWidth="5" fill="none"/>
      <path d="M10 60 A30 30 0 0 1 70 60" stroke="#FF9800" strokeWidth="5" fill="none"/>
      <path d="M16 60 A24 24 0 0 1 64 60" stroke="#FFEB3B" strokeWidth="5" fill="none"/>
      <path d="M22 60 A18 18 0 0 1 58 60" stroke="#4CAF50" strokeWidth="5" fill="none"/>
      <path d="M28 60 A12 12 0 0 1 52 60" stroke="#2196F3" strokeWidth="5" fill="none"/>
      <path d="M34 60 A6 6 0 0 1 46 60" stroke="#9C27B0" strokeWidth="5" fill="none"/>
      {/* clouds */}
      <ellipse cx="12" cy="48" rx="12" ry="6" fill="#FFF" opacity="0.9"/>
      <ellipse cx="68" cy="48" rx="12" ry="6" fill="#FFF" opacity="0.9"/>
      <circle cx="18" cy="16" r="6" fill="#FFF9C4" opacity="0.8"/>
    </svg>
  );
}

const LIGHTING_OPTIONS = [
  { value: "golden hour warm light, long shadows, amber and copper tones",     label: "Golden Hour",   icon: <SvgGoldenLight /> },
  { value: "soft diffused daylight, even illumination, crisp and clear",        label: "Soft Daylight", icon: <SvgSoftDaylight /> },
  { value: "dappled light through leaves, forest green with light patches",     label: "Dappled",       icon: <Img src="/background/lighting-dappled.png" /> },
  { value: "warm candlelight, intimate glow, flickering amber radiance",        label: "Candlelight",   icon: <Img src="/background/lighting-candle.png" /> },
  { value: "cool moonlight, pale silver-blue light, magical and serene",        label: "Moonlight",     icon: <SvgMoonlight /> },
  { value: "joyful rainbow light, bright multi-colour wash, celebratory",       label: "Rainbow",       icon: <Img src="/background/lighting-rainbow.png" /> },
];

// ─── LOCATION presets ──────────────────────────────────────────────────────────
const LOCATION_PRESETS = [
  { value: "bedroom",          label: "Bedroom",       emoji: "🛏️", img: "/background/loc-bedroom.png" },
  { value: "masjid",           label: "Masjid",        emoji: "🕌", img: "/background/loc-masjid.png" },
  { value: "garden",           label: "Garden",        emoji: "🌿", img: "/background/loc-garden.png" },
  { value: "school classroom", label: "Classroom",     emoji: "🏫", img: "/background/loc-classroom.png" },
  { value: "kitchen",          label: "Kitchen",       emoji: "🍳", img: "/background/loc-kitchen.png" },
  { value: "forest",           label: "Forest",        emoji: "🌲", img: "/background/loc-forest.png" },
  { value: "seaside beach",    label: "Beach",         emoji: "🏖️", img: "/background/loc-beach.png" },
  { value: "market souk",      label: "Souk",          emoji: "🪔", img: null },
  { value: "rooftop",          label: "Rooftop",       emoji: "🌙", img: "/background/loc-rooftop.png" },
  { value: "library",          label: "Library",       emoji: "📚", img: "/background/loc-library.png" },
  { value: "desert dunes",     label: "Desert",        emoji: "🏜️", img: "/background/loc-desert.png" },
  { value: "snowy mountain",   label: "Mountain",      emoji: "🏔️", img: null },
];

// ─── PNG image tile helper ─────────────────────────────────────────────────────
function Img({ src, alt = "" }: { src: string; alt?: string }) {
  return <img src={src} alt={alt} className="w-full h-full object-cover" />;
}

const TIME_OPTIONS = [
  { value: "morning",     label: "Morning",     icon: <Img src="/background/time-morning.png" /> },
  { value: "afternoon",   label: "Afternoon",   icon: <Img src="/background/time-afternoon.png" /> },
  { value: "evening",     label: "Evening",     icon: <Img src="/background/time-evening.png" /> },
  { value: "golden-hour", label: "Golden Hour", icon: <Img src="/background/time-golden-hour.png" /> },
  { value: "night",       label: "Night",       icon: <Img src="/background/time-night.png" /> },
];

const CAMERA_OPTIONS = [
  { value: "wide",          label: "Wide Shot",    icon: <Img src="/background/camera-wide.png" /> },
  { value: "medium",        label: "Medium",       icon: <Img src="/background/camera-medium.png" /> },
  { value: "close",         label: "Close-Up",     icon: <Img src="/background/camera-close.png" /> },
  { value: "full-body",     label: "Full Body",    icon: <Img src="/background/camera-fullbody.png" /> },
  { value: "over-shoulder", label: "Over Shoulder",icon: <Img src="/background/camera-overshoulder.png" /> },
];

const TONE_OPTIONS_LIST = [
  { value: "bright, safe, familiar, cheerful",                          label: "Bright & Joyful", icon: <Img src="/background/mood-bright.png" /> },
  { value: "warm, cozy, intimate, inviting",                             label: "Warm & Cozy",     icon: <Img src="/background/mood-warm.png" /> },
  { value: "calm, peaceful, gentle, reflective",                         label: "Calm & Peaceful", icon: <Img src="/background/mood-calm.png" /> },
  { value: "mysterious, wonder-filled, curious, atmospheric",            label: "Mysterious",      icon: <Img src="/background/mood-mystery.png" /> },
  { value: "cinematic, dramatic, adventurous with emotional warmth",     label: "Dramatic",        icon: <Img src="/background/mood-dramatic.png" /> },
];

const COLOR_STYLE_LIST = [
  { value: "vibrant, saturated, primary colors with warm accents",       label: "Vibrant",       icon: <Img src="/background/color-vibrant.png" /> },
  { value: "soft pastel watercolor washes, translucent light effects",   label: "Soft Pastels",  icon: <Img src="/background/color-pastels.png" /> },
  { value: "rich warm tones, oranges, reds, ambers and burnt sienna",    label: "Warm Tones",    icon: <Img src="/background/color-warm.png" /> },
  { value: "cool blues, teals, and aquas, crisp and refreshing palette", label: "Cool Blues",    icon: <Img src="/background/color-cool.png" /> },
  { value: "earth tones, ochres, siennas, forest greens and warm browns",label: "Earth Tones",   icon: <SvgEarthTones /> },
];

// ─── 2-column visual picker ────────────────────────────────────────────────────
function TwoColPicker({
  options, value, onChange, accent = "blue",
}: {
  options: { value: string; label: string; icon: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  accent?: string;
}) {
  const colorMap: Record<string, { sel: string; ring: string }> = {
    blue:   { sel: "border-blue-500 bg-blue-50",    ring: "bg-blue-500" },
    amber:  { sel: "border-amber-500 bg-amber-50",  ring: "bg-amber-500" },
    emerald:{ sel: "border-emerald-500 bg-emerald-50", ring: "bg-emerald-500" },
    violet: { sel: "border-violet-500 bg-violet-50",ring: "bg-violet-500" },
    teal:   { sel: "border-teal-500 bg-teal-50",    ring: "bg-teal-500" },
  };
  const c = colorMap[accent] || colorMap.blue;
  return (
    <div className="grid grid-cols-4 gap-3">
      {options.map(opt => {
        const isSel = value === opt.value;
        return (
          <button key={opt.value} type="button"
            onClick={() => onChange(isSel ? "" : opt.value)}
            className={cn(
              "relative flex flex-col items-center overflow-hidden rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg text-center",
              isSel ? c.sel + " shadow-lg" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
            )}>
            <div className="w-full aspect-square overflow-hidden">{opt.icon}</div>
            <span className={cn("text-xs font-bold leading-tight py-2 px-2", isSel ? "text-gray-800" : "text-gray-600")}>
              {opt.label}
            </span>
            {isSel && (
              <span className={cn("absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow", c.ring)}>
                <Check className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface Props {
  bs: any;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
}

export function KBBackgroundSettings({ bs, onSave, isSaving }: Props) {
  const [activeGroup, setActiveGroup] = useState<"junior" | "middleGrade" | "saeeda">("junior");

  const patchBg = (groupKey: string, partial: object) =>
    onSave({ backgroundSettings: { ...bs, [groupKey]: { ...bs[groupKey], ...partial } } });
  const patchBgRoot = (partial: object) =>
    onSave({ backgroundSettings: { ...bs, ...partial } });

  const ag = AGE_GROUPS.find(a => a.key === activeGroup)!;
  const g = bs[activeGroup] || {};
  const locs = g.locations || [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Set the scene environment for each age group. AI injects these into every image generation prompt.
      </p>

      {/* ── 3 Radio buttons ── */}
      <div className="grid grid-cols-3 gap-3">
        {AGE_GROUPS.map(a => {
          const isActive = activeGroup === a.key;
          const groupData = bs[a.key] || {};
          const hasData = groupData.timeOfDay || groupData.tone || (groupData.locations?.length > 0);
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => setActiveGroup(a.key as any)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                isActive ? a.active : a.inactive
              )}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-sm font-bold leading-tight">{a.label}</span>
              <span className={cn("text-[11px] font-medium", isActive ? "opacity-80" : "opacity-60")}>{a.sub}</span>
              {hasData && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              {isActive && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Settings panel for selected group ── */}
      <div className={cn("rounded-2xl border-2 p-5 space-y-6", ag.fieldBg, ag.fieldBorder)}>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {ag.emoji} {ag.label} Settings
        </p>

        {/* TIME OF DAY */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">🕐 Time of Day</Label>
          <TwoColPicker options={TIME_OPTIONS} value={g.timeOfDay || ""} onChange={v => patchBg(activeGroup, { timeOfDay: v })} accent="amber" />
        </div>

        {/* CAMERA HINT */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">📷 Camera View</Label>
          <TwoColPicker options={CAMERA_OPTIONS} value={g.cameraHint || ""} onChange={v => patchBg(activeGroup, { cameraHint: v })} accent="blue" />
        </div>

        {/* MOOD & TONE */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">🎭 Mood & Tone</Label>
          <TwoColPicker options={TONE_OPTIONS_LIST} value={g.tone || ""} onChange={v => patchBg(activeGroup, { tone: v })} accent="violet" />
          {!TONE_OPTIONS_LIST.some(o => o.value === g.tone) && g.tone && (
            <div className="mt-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-600">Custom: {g.tone}</div>
          )}
          <Input className="text-sm mt-1" placeholder="Or type a custom mood…"
            value={TONE_OPTIONS_LIST.some(o => o.value === g.tone) ? "" : (g.tone || "")}
            onChange={e => patchBg(activeGroup, { tone: e.target.value })} />
        </div>

        {/* COLOR STYLE */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">🎨 Color Style</Label>
          <TwoColPicker options={COLOR_STYLE_LIST} value={g.colorStyle || ""} onChange={v => patchBg(activeGroup, { colorStyle: v })} accent="emerald" />
          <Input className="text-sm mt-1" placeholder="Or type a custom color style…"
            value={COLOR_STYLE_LIST.some(o => o.value === g.colorStyle) ? "" : (g.colorStyle || "")}
            onChange={e => patchBg(activeGroup, { colorStyle: e.target.value })} />
        </div>

        {/* LIGHTING STYLE */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">💡 Lighting Style</Label>
          <TwoColPicker options={LIGHTING_OPTIONS} value={g.lightingStyle || ""} onChange={v => patchBg(activeGroup, { lightingStyle: v })} accent="amber" />
          <Input className="text-sm mt-1" placeholder="Or describe a custom lighting style…"
            value={LIGHTING_OPTIONS.some(o => o.value === g.lightingStyle) ? "" : (g.lightingStyle || "")}
            onChange={e => patchBg(activeGroup, { lightingStyle: e.target.value })} />
        </div>

        {/* LOCATIONS */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">📍 Locations</Label>
          {/* Quick-add preset location tiles */}
          <div className="grid grid-cols-4 gap-3">
            {LOCATION_PRESETS.map(loc => {
              const isAdded = locs.includes(loc.value);
              return (
                <button key={loc.value} type="button"
                  onClick={() => {
                    const next = isAdded ? locs.filter((l: string) => l !== loc.value) : [...locs, loc.value];
                    patchBg(activeGroup, { locations: next });
                  }}
                  className={cn(
                    "relative flex flex-col items-center overflow-hidden rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg text-center",
                    isAdded ? "border-teal-400 shadow-lg" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
                  )}>
                  {loc.img ? (
                    <div className="w-full aspect-square overflow-hidden">
                      <img src={loc.img} alt={loc.label} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-50 text-5xl">{loc.emoji}</div>
                  )}
                  <span className={cn("text-xs font-bold py-2 px-1", isAdded ? "text-teal-700" : "text-gray-600")}>{loc.label}</span>
                  {isAdded && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Custom location input */}
          <TagPills
            items={locs.filter((l: string) => !LOCATION_PRESETS.some(p => p.value === l))}
            onAdd={v => patchBg(activeGroup, { locations: [...locs, v] })}
            onRemove={i => {
              const custom = locs.filter((l: string) => !LOCATION_PRESETS.some(p => p.value === l));
              const removed = custom[i];
              patchBg(activeGroup, { locations: locs.filter((l: string) => l !== removed) });
            }}
            placeholder="Add custom location e.g. moonlit rooftop…"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-1">
          <Label className="text-sm font-bold">📝 Additional Notes</Label>
          <Input placeholder="Any extra scene rules for AI…"
            defaultValue={g.additionalNotes || ""}
            onBlur={e => patchBg(activeGroup, { additionalNotes: e.target.value })} />
        </div>
      </div>

      {/* ── Cross-series avoidance ── */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">🚫 Avoid All Backgrounds</p>
        <TagPills
          items={bs.avoidBackgrounds || []}
          onAdd={v => patchBgRoot({ avoidBackgrounds: [...(bs.avoidBackgrounds || []), v] })}
          onRemove={i => patchBgRoot({ avoidBackgrounds: (bs.avoidBackgrounds || []).filter((_: string, j: number) => j !== i) })}
          placeholder="e.g. Abstract gradients, busy wallpaper…"
        />
        <div>
          <Label className="text-xs font-semibold">Universal Rules (applies to all age groups)</Label>
          <Input className="mt-1" placeholder="e.g. Every scene must feel handcrafted, not digital"
            defaultValue={bs.universalRules || ""}
            onBlur={e => patchBgRoot({ universalRules: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
