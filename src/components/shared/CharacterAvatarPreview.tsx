// ── Image maps (mirrors picker options) ──────────────────────────────────────

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
  "feathered crest on head": "/head-texture/feather crest.png",
  "no hair (feathers)":      "/head-texture/feathers.png",
  "frill crest":             "/head-texture/frill crest.png",
  "no hair (fur)":           "/head-texture/fur.png",
  "mane":                    "/head-texture/mane.png",
  "spikes on head":          "/head-texture/spikes.png",
  "none":                    "/head-texture/none.png",
};

const FUR_FEATHER_IMG: Record<string, string> = {
  "golden fur":      "/fur-feather/golden fur.png",
  "brown fur":       "/fur-feather/brown fur.png",
  "white feathers":  "/fur-feather/white feathers.png",
  "orange feathers": "/fur-feather/orange features.png",
  "green scales":    "/fur-feather/green scales.png",
  "blue scales":     "/fur-feather/blue scales.png",
};

const HEAD_SNOUT_IMG: Record<string, string> = {
  "round beak":          "/head-snout-shape/round beak.png",
  "flat beak":           "/head-snout-shape/flat beak.png",
  "short snout":         "/head-snout-shape/short snout.png",
  "pointed snout":       "/head-snout-shape/pointed snout.png",
  "wide muzzle":         "/head-snout-shape/wide muzzle.png",
  "square muzzle":       "/head-snout-shape/square muzzle.png",
  "big friendly muzzle": "/head-snout-shape/big friendly muzzle.png",
  "soft rounded head":   "/head-snout-shape/soft rounded head.png",
};

const OUTFIT_ACC_IMG: Record<string, string> = {
  "red cape":       "/outfit-accesories/red cape.png",
  "small backpack": "/outfit-accesories/small backpack.png",
  "flower crown":   "/outfit-accesories/flower crown.png",
  "simple vest":    "/outfit-accesories/simple vest.png",
  "scarf":          "/outfit-accesories/scarf.png",
  "bow tie":        "/outfit-accesories/bow tie.png",
  "none":           "/outfit-accesories/none.png",
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
  jeans:  "/trousers/jeans.png",
  shorts: "/trousers/shorts.png",
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
  "ballerina flats":  "/shoes/balleria.png",
  "heels":            "/shoes/heels.png",
  "pumps":            "/shoes/pumps.png",
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

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Small attribute cell ───────────────────────────────────────────────────────

function AttrCell({
  src,
  label,
  empty,
}: {
  src?: string;
  label: string;
  empty?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-full aspect-square rounded-xl overflow-hidden border border-border/40 bg-gradient-to-b from-[#FFF8F2] to-[#F5EBE0] flex items-center justify-center">
        {src ? (
          <img src={src} alt={label} className="w-full h-full object-contain" draggable={false} />
        ) : (
          <span className="text-xl opacity-20 select-none">{empty ? "—" : "?"}</span>
        )}
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground leading-none text-center truncate w-full">
        {label}
      </span>
    </div>
  );
}

// ── Chip helper ───────────────────────────────────────────────────────────────

function Chip({ label, color = "slate" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    slate:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    blue:    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    orange:  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    purple:  "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${colors[color] ?? colors.slate}`}>
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CharacterAvatarPreview({ form }: { form: AvatarForm }) {
  const isGirl  = form.gender === "girl";
  const isBoy   = form.gender === "boy";
  const isOther = form.gender === "animal" || form.gender === "other";

  // Gender base image — always the stable hero
  const genderSrc = GENDER_IMG[form.gender] ?? GENDER_IMG.girl;

  // Derive attribute images
  const faceImg = isOther
    ? HEAD_SNOUT_IMG[form.faceShape]
    : isGirl && form.faceShape ? GIRL_FACE_IMG[form.faceShape] : undefined;

  const hairImg = !form.wearHijab && form.hairStyle
    ? isGirl  ? GIRL_HAIR_IMG[form.hairStyle]
    : isBoy   ? BOY_HAIR_IMG[form.hairStyle]
    : isOther ? CREATURE_HAIR_IMG[form.hairStyle]
    : undefined
    : undefined;

  const eyeImg    = !isOther && form.eyeColor ? EYE_IMG[form.eyeColor] : undefined;
  const furImg    = isOther && form.skinTone  ? FUR_FEATHER_IMG[form.skinTone] : undefined;
  const topImg    = isOther
    ? OUTFIT_ACC_IMG[form.topGarmentType]
    : isGirl ? GIRL_TOP_IMG[form.topGarmentType] : undefined;
  const bottomImg = isGirl
    ? GIRL_BOTTOM_IMG[form.bottomGarmentType]
    : BOY_BOTTOM_IMG[form.bottomGarmentType];
  const shoeImg  = form.shoeType      ? SHOE_IMG[form.shoeType]         : undefined;
  const bodyImg  = form.bodyBuild     ? BODY_IMG[form.bodyBuild]        : undefined;

  // Chips for the info strip
  const chips: Array<{ label: string; color: string }> = [];
  if (form.gender)         chips.push({ label: form.gender,                       color: "blue" });
  if (form.skinTone)       chips.push({ label: form.skinTone.replace(/-/g, " "),  color: "orange" });
  if (form.wearHijab)      chips.push({ label: "Hijab",                           color: "emerald" });
  if (form.topGarmentType) chips.push({ label: form.topGarmentType,               color: "purple" });
  if (form.longSleeves !== undefined && (form as any).longSleeves)
                           chips.push({ label: "Long sleeves",                    color: "emerald" });
  if (form.bodyBuild)      chips.push({ label: form.bodyBuild.replace(/ and /gi, " & "), color: "amber" });

  const anySelected = !!(form.skinTone || form.eyeColor || form.faceShape || form.hairStyle || form.topGarmentType);

  return (
    <div className="w-full h-full flex flex-col gap-0 overflow-hidden">

      {/* ── CHARACTER PORTRAIT ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 bg-gradient-to-b from-amber-50 via-orange-50/60 to-stone-100/80 dark:from-stone-900/60 dark:to-stone-800/40 flex items-center justify-center">

        {/* Soft radial glow behind character */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 rounded-full bg-amber-100/60 dark:bg-amber-900/10 blur-2xl" />
        </div>

        <img
          src={genderSrc}
          alt={form.gender}
          className="relative z-10 h-full w-full object-contain drop-shadow-md transition-all duration-300"
          draggable={false}
        />

        {/* Name badge */}
        {form.name && (
          <div className="absolute top-2 left-2 right-2 z-20 flex justify-center">
            <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full max-w-[90%] truncate shadow">
              {form.name}
            </div>
          </div>
        )}

        {/* Age look badge */}
        {form.ageLook && (
          <div className="absolute bottom-2 right-2 z-20 bg-white/80 dark:bg-black/50 backdrop-blur-sm text-foreground dark:text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow border border-white/40 capitalize">
            {form.ageLook.split(" ").slice(0, 3).join(" ")}
          </div>
        )}

        {/* "No selections" hint */}
        {!anySelected && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center z-20">
            <span className="text-[10px] text-muted-foreground/60 bg-white/70 dark:bg-black/40 px-3 py-1 rounded-full">
              Select options to customise
            </span>
          </div>
        )}
      </div>

      {/* ── DESIGN SUMMARY ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border/60 bg-card">

        {/* Section title */}
        <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
            Design Summary
          </span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Attribute grid — 3 columns × 2 rows */}
        <div className="grid grid-cols-3 gap-1.5 px-2 pb-2">
          {isOther ? (
            <>
              <AttrCell src={faceImg}  label="Snout"   empty={!faceImg} />
              <AttrCell src={hairImg}  label="Texture"  empty={!hairImg} />
              <AttrCell src={furImg}   label="Fur/Scale" empty={!furImg} />
              <AttrCell src={topImg}   label="Outfit"   empty={!topImg} />
              <AttrCell src={bodyImg}  label="Build"    empty={!bodyImg} />
              <AttrCell src={undefined} label="" empty />
            </>
          ) : (
            <>
              <AttrCell src={faceImg}   label="Face"   empty={!faceImg} />
              <AttrCell src={hairImg}   label="Hair"   empty={!hairImg} />
              <AttrCell src={eyeImg}    label="Eyes"   empty={!eyeImg} />
              <AttrCell src={topImg}    label="Top"    empty={!topImg} />
              <AttrCell src={bottomImg} label="Bottom" empty={!bottomImg} />
              <AttrCell src={shoeImg ?? bodyImg} label={shoeImg ? "Shoes" : bodyImg ? "Build" : "Shoes"} empty={!shoeImg && !bodyImg} />
            </>
          )}
        </div>

        {/* Attribute chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 px-2 pb-2.5">
            {chips.slice(0, 5).map((c) => (
              <Chip key={c.label} label={c.label} color={c.color} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
