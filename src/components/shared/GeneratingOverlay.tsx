import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

const NEUTRAL_MESSAGES = [
  "Weaving your story together…",
  "Grab a cup of coffee — our illustrators are hard at work…",
  "Almost there — reviewing the final spreads…",
  "Polishing your cover…",
  "Every great book takes a moment to breathe…",
  "Crafting each page with care…",
  "Your characters are coming to life…",
  "Sketching the perfect scene…",
  "Adding the finishing touches…",
  "Good things take time — nearly done…",
];

const ISLAMIC_MESSAGES = [
  "Bismillah — generating your cover…",
  "Bi-idhnillah, your illustrations are coming together…",
  "Alhamdulillah — almost done…",
  "MashaAllah — your story is taking shape…",
  "May every page carry barakah…",
  "Your story is in good hands, bi-idhnillah…",
  "In shāʾ Allāh, your pages will be ready soon…",
  "JazākAllāhu Khayran for your patience…",
];

interface GeneratingOverlayProps {
  register?: "neutral" | "islamic";
  progress?: string;
  label?: string;
}

export function GeneratingOverlay({
  register = "neutral",
  progress,
  label,
}: GeneratingOverlayProps) {
  const messages = register === "islamic" ? ISLAMIC_MESSAGES : NEUTRAL_MESSAGES;
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 3500);
    return () => clearInterval(id);
  }, [messages.length]);

  const headline = register === "islamic" ? "Bismillah…" : "Magic happening…";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border-4 border-primary/30 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-400/20 border-4 border-primary/40 flex items-center justify-center shadow-lg">
            <BookOpen className="w-9 h-9 text-primary" />
          </div>
          <div className="absolute -top-3 -right-3 text-2xl animate-bounce">✨</div>
          <div className="absolute -bottom-2 -left-3 text-xl animate-bounce" style={{ animationDelay: "0.3s" }}>⭐</div>
          <div className="absolute -top-2 -left-4 text-lg animate-bounce" style={{ animationDelay: "0.6s" }}>🌟</div>
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-xl font-extrabold text-primary">{headline}</p>
          {label && <p className="text-xs text-primary/60 font-semibold uppercase tracking-wide">{label}</p>}
          <p className="text-sm text-muted-foreground font-medium min-h-[40px] transition-all duration-500">
            {messages[msgIdx]}
          </p>
          {progress && (
            <p className="text-xs text-primary/70 font-semibold">{progress}</p>
          )}
        </div>

        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 via-primary to-purple-500 rounded-full animate-pulse"
            style={{ width: "70%" }}
          />
        </div>

        <p className="text-xs text-muted-foreground">This may take a minute or two 🕐</p>
      </div>
    </div>
  );
}
