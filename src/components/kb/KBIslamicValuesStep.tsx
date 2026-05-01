import { useState } from "react";
import { Plus, Loader2, X, Check } from "lucide-react";
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
  const [customHow, setCustomHow] = useState("");

  const toggle = (value: string) => {
    const next = items.includes(value)
      ? items.filter(v => v !== value)
      : [...items, value];
    onSave(next);
  };

  const addCustom = () => {
    const v = customInput.trim();
    if (!v || items.includes(v)) return;
    const combined = customHow.trim() ? `${v} - ${customHow.trim()}` : v;
    onSave([...items, combined]);
    setCustomInput("");
    setCustomHow("");
  };

  const customItems = items.filter(v => !ISLAMIC_VALUE_TILES.some(t => t.value === v));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">Islamic Values</h3>
          <p className="text-sm text-muted-foreground">
            Choose the moral anchors that should appear across stories and illustrations.
          </p>
        </div>
        <span className="w-fit rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
          {items.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                "group relative flex min-h-[192px] flex-col items-center justify-between rounded-xl border p-3 text-center transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border bg-white shadow-sm hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
              )}
            >
              <div className="flex h-[138px] w-full items-center justify-center rounded-lg bg-white/70">
                <div className="h-[128px] w-full overflow-hidden rounded-xl">
                  {tile.image ? (
                    <img
                      src={tile.image}
                      alt={tile.label}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full p-3">
                      <Icon />
                    </div>
                  )}
                </div>
              </div>

              <span className={cn("mt-2 text-sm font-bold leading-tight", isSelected ? "text-primary" : "text-gray-700")}>
                {tile.label}
              </span>

              {isSelected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {customItems.length > 0 && (
        <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Custom Values</p>
          {customItems.map(v => (
            <div key={v} className="flex items-center justify-between rounded-lg border bg-background p-3">
              <span className="text-sm text-foreground">{v}</span>
              <button
                type="button"
                onClick={() => onSave(items.filter(i => i !== v))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[1fr_1.4fr_auto]">
          <Input
            placeholder="Value name - e.g. Generosity"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
          />
          <Input
            placeholder="How it should appear - e.g. Characters pause to thank Allah"
            value={customHow}
            onChange={e => setCustomHow(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
          />
          <Button variant="outline" onClick={addCustom} disabled={!customInput.trim() || isSaving} size="sm" className="h-10 justify-center">
            {isSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Add Value
          </Button>
        </div>
      </div>
    </div>
  );
}
