// Image maps — mirrors the picker options in CharacterCreatePage
const GENDER_IMG: Record<string, string> = {
  girl:   "/characters/girl.png",
  boy:    "/characters/boy.png",
  animal: "/characters/animal.png",
  other:  "/characters/creaturefantasy.png",
};

const EYE_IMG: Record<string, string> = {
  amber:        "/eyes/amber.png",
  "dark-brown": "/eyes/deepbrown.png",
  brown:        "/eyes/brown.png",
  hazel:        "/eyes/hazel.png",
  green:        "/eyes/green.png",
  blue:         "/eyes/blue.png",
  gray:         "/eyes/gray.png",
  black:        "/eyes/black.png",
};

const GIRL_FACE_IMG: Record<string, string> = {
  "round-friendly":    "/girls E. Face Shape Cards/round.png",
  "oval-gentle":       "/girls E. Face Shape Cards/oval gentle.png",
  "heart-creative":    "/girls E. Face Shape Cards/heart.png",
  "square-determined": "/girls E. Face Shape Cards/square.png",
  "oval-balanced":     "/girls E. Face Shape Cards/oval.png",
  "round-youthful":    "/girls E. Face Shape Cards/round soft.png",
};

const GIRL_HAIR_IMG: Record<string, string> = {
  "long-black":        "/girls F. Hair Style Cards/long.png",
  "long-dark-brown":   "/girls F. Hair Style Cards/dark brown.png",
  "long-brown":        "/girls F. Hair Style Cards/brown.png",
  "shoulder-length":   "/girls F. Hair Style Cards/shoulder.png",
  "short-bob":         "/girls F. Hair Style Cards/short bob.png",
  "side-swept":        "/girls F. Hair Style Cards/side swept.png",
  "curly-long":        "/girls F. Hair Style Cards/long curly.png",
  "curly-short":       "/girls F. Hair Style Cards/short curly.png",
  "wavy-loose":        "/girls F. Hair Style Cards/loose wavy.png",
  "braided-long":      "/girls F. Hair Style Cards/braided.png",
  "two-braids":        "/girls F. Hair Style Cards/two braids.png",
  "ponytail-high":     "/girls F. Hair Style Cards/high ponytail.png",
  "ponytail-low":      "/girls F. Hair Style Cards/low ponytail.png",
  "bun-top":           "/girls F. Hair Style Cards/top bun.png",
  "half-up-half-down": "/girls F. Hair Style Cards/half up.png",
};

const BOY_HAIR_IMG: Record<string, string> = {
  "short-black":      "/boy hairs/short.png",
  "short-dark-brown": "/boy hairs/short brown.png",
  "curly-black":      "/boy hairs/curly.png",
  "wavy-dark":        "/boy hairs/wavy.png",
  "spiky-black":      "/boy hairs/spiky.png",
  "afro":             "/boy hairs/afro.png",
  "buzz-cut":         "/boy hairs/buzz-cut.png",
};

const CREATURE_HAIR_IMG: Record<string, string> = {
  "feathered crest on head": "/animal and fantasy hairs/feather crest.png",
  "no hair (feathers)":      "/animal and fantasy hairs/feathers.png",
  "no hair (fur)":           "/animal and fantasy hairs/fur.png",
  "mane":                    "/animal and fantasy hairs/mane.png",
  "spikes on head":          "/animal and fantasy hairs/spikes.png",
};

const GIRL_TOP_IMG: Record<string, string> = {
  "long-sleeve tunic":     "/girl top garments/tunic.png",
  "abaya":                 "/girl top garments/abaya.png",
  "modest blouse":         "/girl top garments/blouse.png",
  "salwar kameez top":     "/girl top garments/kameez.png",
  "long-sleeve dress":     "/girl top garments/dress.png",
  "school uniform blouse": "/girl top garments/uniform.png",
};

const GIRL_BOTTOM_IMG: Record<string, string> = {
  "wide-leg trousers":    "/girl bottom garments/wide leg.png",
  "long skirt":           "/girl bottom garments/long skirt.png",
  "maxi skirt":           "/girl bottom garments/maxi shirk.png",
  "school uniform skirt": "/girl bottom garments/uniform.png",
  "shalwar":              "/girl bottom garments/shalwar.png",
  "palazzo pants":        "/girl bottom garments/palazzo.png",
};

const BOY_BOTTOM_IMG: Record<string, string> = {
  jeans:   "/trousers/jeans.png",
  shorts:  "/trousers/shorts.png",
};

const SHOE_IMG: Record<string, string> = {
  "sneakers":         "/shoes/sneakers.png",
  "school shoes":     "/shoes/school.png",
  "mary jane flats":  "/shoes/mary-jane.png",
  "sandals":          "/shoes/sandals.png",
  "leather sandals":  "/shoes/leather.png",
  "boots":            "/shoes/boots.png",
  "slippers":         "/shoes/slippers.png",
  "oxford shoes":     "/shoes/oxford.png",
  "khussa":           "/shoes/khussa.png",
  "balgha slippers":  "/shoes/balga.png",
  "open-toe sandals": "/shoes/open-toe.png",
};

const BODY_IMG: Record<string, string> = {
  "slim and lean":             "/weight feel card/slim.png",
  "average build":             "/weight feel card/average.png",
  "soft and round":            "/weight feel card/soft.png",
  "athletic and fit":          "/weight feel card/atletic.png",
  "stocky and strong":         "/weight feel card/stocky.png",
  "petite and light":          "/weight feel card/petite.png",
  "small toddler round tummy": "/weight feel card/toddler.png",
  "round and full":            "/weight feel card/round.png",
};

interface AvatarForm {
  gender: "girl" | "boy" | "animal" | "other";
  skinTone: string;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  wearHijab: boolean;
  hijabStyle: string;
  hijabColor: string;
  topGarmentType: string;
  topGarmentColor: string;
  bottomGarmentType: string;
  bottomGarmentColor: string;
  shoeType: string;
  shoeColor: string;
  bodyBuild: string;
  ageLook: string;
  name?: string;
}

interface FeatureTile {
  src: string;
  label: string;
}

function ImgTile({ src, label, large }: { src: string; label: string; large?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${large ? "flex-1" : ""}`}>
      <div
        className={`overflow-hidden rounded-xl border border-black/8 bg-gradient-to-b from-[#FFF8F0] to-[#F5EDE0] shadow-sm ${
          large ? "w-full aspect-[3/4]" : "w-full aspect-square"
        }`}
      >
        <img src={src} alt={label} className="w-full h-full object-contain" draggable={false} />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground leading-none">{label}</span>
    </div>
  );
}

export function CharacterAvatarPreview({ form }: { form: AvatarForm }) {
  const isGirl    = form.gender === "girl";
  const isBoy     = form.gender === "boy";
  const isOther   = form.gender === "animal" || form.gender === "other";

  // ── Main "hero" image — most descriptive available ──────────────────────────
  let heroSrc: string | null = null;
  let heroLabel = "";

  // 1. Hair has head+face context — best for face/hair stage
  if (!form.wearHijab && form.hairStyle) {
    if (isGirl  && GIRL_HAIR_IMG[form.hairStyle])     { heroSrc = GIRL_HAIR_IMG[form.hairStyle];     heroLabel = "Hair"; }
    else if (isBoy   && BOY_HAIR_IMG[form.hairStyle]) { heroSrc = BOY_HAIR_IMG[form.hairStyle];      heroLabel = "Hair"; }
    else if (isOther && CREATURE_HAIR_IMG[form.hairStyle]) { heroSrc = CREATURE_HAIR_IMG[form.hairStyle]; heroLabel = "Texture"; }
  }

  // 2. Face shape card (girl only) if no hair chosen yet
  if (!heroSrc && isGirl && form.faceShape && GIRL_FACE_IMG[form.faceShape]) {
    heroSrc   = GIRL_FACE_IMG[form.faceShape];
    heroLabel = "Face Shape";
  }

  // 3. Gender character as fallback
  if (!heroSrc && GENDER_IMG[form.gender]) {
    heroSrc   = GENDER_IMG[form.gender];
    heroLabel = form.gender.charAt(0).toUpperCase() + form.gender.slice(1);
  }

  // ── Feature tiles ────────────────────────────────────────────────────────────
  const tiles: FeatureTile[] = [];

  // Eyes
  if (form.eyeColor && EYE_IMG[form.eyeColor])
    tiles.push({ src: EYE_IMG[form.eyeColor], label: "Eyes" });

  // Top garment
  const topSrc = isGirl ? GIRL_TOP_IMG[form.topGarmentType] : null;
  if (topSrc) tiles.push({ src: topSrc, label: "Top" });

  // Bottom garment
  const bottomSrc = isGirl
    ? GIRL_BOTTOM_IMG[form.bottomGarmentType]
    : BOY_BOTTOM_IMG[form.bottomGarmentType];
  if (bottomSrc) tiles.push({ src: bottomSrc, label: "Bottom" });

  // Shoes
  if (form.shoeType && SHOE_IMG[form.shoeType])
    tiles.push({ src: SHOE_IMG[form.shoeType], label: "Shoes" });

  // Body build (only if < 4 tiles so far)
  if (form.bodyBuild && BODY_IMG[form.bodyBuild] && tiles.length < 4)
    tiles.push({ src: BODY_IMG[form.bodyBuild], label: "Build" });

  const hasSelections = !!heroSrc && heroLabel !== form.gender.charAt(0).toUpperCase() + form.gender.slice(1);

  return (
    <div className="w-full h-full flex flex-col gap-2 p-1">
      {/* ── Hero image ─────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF0E5] to-[#F5E8D8] border border-black/8 shadow-sm">
        {heroSrc ? (
          <img
            src={heroSrc}
            alt="character preview"
            className="w-full h-full object-contain transition-all duration-300"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
            <svg viewBox="0 0 64 80" className="w-16 h-20 opacity-30" fill="currentColor">
              <ellipse cx="32" cy="20" rx="14" ry="16" />
              <rect x="16" y="36" width="32" height="30" rx="8" />
              <rect x="8"  y="38" width="10" height="22" rx="5" />
              <rect x="46" y="38" width="10" height="22" rx="5" />
            </svg>
            <span className="text-xs font-medium">Select options to preview</span>
          </div>
        )}

        {/* Name badge at top */}
        {form.name && (
          <div className="absolute top-2 left-2 right-2 bg-black/55 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold text-center truncate shadow">
            {form.name}
          </div>
        )}

        {/* Stage badge bottom-left */}
        {heroSrc && (
          <div className="absolute bottom-2 left-2 bg-black/45 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full font-semibold">
            {heroLabel}
          </div>
        )}

        {/* Age/gender chip bottom-right */}
        {(form.ageLook || form.gender) && (
          <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm text-foreground text-[10px] px-2.5 py-1 rounded-full font-semibold shadow-sm border border-white/50 capitalize">
            {form.ageLook
              ? form.ageLook.split(" ").slice(0, 2).join(" ")
              : form.gender}
          </div>
        )}
      </div>

      {/* ── Feature tile strip ───────────────────────────────────────────────── */}
      {tiles.length > 0 ? (
        <div className="flex gap-1.5 flex-shrink-0">
          {tiles.slice(0, 4).map((t) => (
            <ImgTile key={t.label} src={t.src} label={t.label} />
          ))}
          {/* Fill empties so the row stays stable */}
          {tiles.length < 4 && Array.from({ length: 4 - tiles.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1" />
          ))}
        </div>
      ) : (
        <div className="flex-shrink-0 h-16 flex items-center justify-center rounded-xl border border-dashed border-border/40">
          <span className="text-[10px] text-muted-foreground/50">outfit tiles appear here</span>
        </div>
      )}
    </div>
  );
}
