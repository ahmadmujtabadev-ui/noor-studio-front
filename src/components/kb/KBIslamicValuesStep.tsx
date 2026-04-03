import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ISLAMIC_VALUE_TILES } from "./KBIcons";

interface Props {
  items: string[];
  onSave: (values: string[]) => Promise<void>;
  isSaving: boolean;
}

export function KBIslamicValuesStep({ items, onSave, isSaving }: Props) {
  const [customInput, setCustomInput] = useState("");

  const toggle = (value: string) => {
    const next = items.includes(value)
      ? items.filter(v => v !== value)
      : [...items, value];
    onSave(next);
  };

  const addCustom = () => {
    const v = customInput.trim();
    if (!v || items.includes(v)) return;
    onSave([...items, v]);
    setCustomInput("");
  };

  const customItems = items.filter(v => !ISLAMIC_VALUE_TILES.some(t => t.value === v));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 pb-2">
        <h3 className="text-lg font-bold">Islamic Values</h3>
        <p className="text-sm text-muted-foreground">
          Tap a value to add it — these are woven into every story and illustration
        </p>
      </div>

      {/* Big illustrated tile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ISLAMIC_VALUE_TILES.map(tile => {
          const isSelected = items.includes(tile.value);
          const Icon = tile.icon;
          return (
            <button
              key={tile.value}
              type="button"
              onClick={() => toggle(tile.value)}
              disabled={isSaving}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg",
                isSelected
                  ? `${tile.bg} ${tile.ring} ring-2 ring-offset-2 shadow-md border-transparent`
                  : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
              )}
            >
              {/* Large icon */}
              <div className="w-16 h-16">
                <Icon />
              </div>
              {/* Label */}
              <span className={cn(
                "text-sm font-bold leading-tight",
                isSelected ? tile.text : "text-gray-700"
              )}>
                {tile.label}
              </span>
              {/* Selected checkmark */}
              {isSelected && (
                <span className={cn(
                  "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
                  tile.ring.replace("ring-", "bg-")
                )}>
                  <svg viewBox="0 0 12 12" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom values */}
      {customItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Custom Values</p>
          {customItems.map(v => (
            <div key={v} className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border border-violet-100">
              <span className="text-sm text-violet-800">{v}</span>
              <button onClick={() => onSave(items.filter(i => i !== v))} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add your own value…"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
          className="flex-1"
        />
        <Button variant="outline" onClick={addCustom} disabled={!customInput.trim() || isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
