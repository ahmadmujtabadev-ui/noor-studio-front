import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Check, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const plans = [
  {
    name: "Creator",
    price: 29,
    desc: "For families getting started",
    features: [
      { text: "5 books per month",         tip: "Generate up to 5 complete books monthly" },
      { text: "10 character designs",       tip: "Create up to 10 unique characters" },
      { text: "5 knowledge bases",          tip: "Up to 5 content knowledge bases" },
      { text: "Standard PDF export",        tip: "High-quality PDF downloads" },
      { text: "100 AI credits / month",     tip: "Used for generation tasks" },
      { text: "Email support",              tip: "Response within 48 hours" },
    ],
    locked: ["KDP-ready export", "Commercial license"],
    popular: false,
    cta: "Get started",
  },
  {
    name: "Author",
    price: 79,
    desc: "For serious creators",
    features: [
      { text: "Unlimited books",            tip: "No monthly book limit" },
      { text: "Unlimited characters",       tip: "No limit on character creation" },
      { text: "Unlimited knowledge bases",  tip: "No limit on knowledge bases" },
      { text: "KDP-ready export",           tip: "Files formatted for Amazon KDP" },
      { text: "300 AI credits / month",     tip: "Used for generation tasks" },
      { text: "Priority support",           tip: "Response within 24 hours" },
      { text: "Commercial license",         tip: "Sell books you create" },
    ],
    locked: ["Team collaboration"],
    popular: true,
    cta: "Get started",
  },
  {
    name: "Studio",
    price: 199,
    desc: "For publishers & schools",
    features: [
      { text: "Everything in Author",       tip: "Includes all Author plan features" },
      { text: "Team collaboration",         tip: "Invite team members with role-based access" },
      { text: "Bulk export tools",          tip: "Export multiple books at once" },
      { text: "API access",                 tip: "Integrate with your workflows" },
      { text: "1000 AI credits / month",    tip: "Used for generation tasks" },
      { text: "Dedicated support",          tip: "Direct access to our team" },
      { text: "Commercial license",         tip: "Sell books you create" },
    ],
    locked: [],
    popular: false,
    cta: "Get started",
  },
];

const faqs = [
  { q: "Can I upgrade or downgrade anytime?", a: "Yes — change your plan at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle." },
  { q: "Is there a free trial?", a: "All new accounts start with a 7-day free trial of the Author plan. No credit card required." },
  { q: "Do unused credits roll over?", a: "On Author and Studio plans, unused credits roll over for up to 3 months. Creator plan credits refresh each month." },
  { q: "Can I sell the books I make?", a: "Author and Studio plans include a full commercial license. Royalties are 100% yours." },
  { q: "What happens if I run out of credits?", a: "You can purchase additional credit packs from your billing page, or wait for your monthly refresh." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: "#FBF7EF",
        color: "#1B1A17",
      }}>

        {/* ── HERO ── */}
        <section style={{ padding: "80px 40px 64px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 500, letterSpacing: "1.6px", textTransform: "uppercase", color: "#0B5C46", opacity: .75, marginBottom: 18 }}>
            Pricing
          </p>
          <h1 style={{ fontFamily: "'Source Serif 4','Georgia',serif", fontWeight: 600, fontSize: "clamp(40px,5vw,64px)", lineHeight: 1.04, letterSpacing: "-1.2px", color: "#0E4938", marginBottom: 18 }}>
            Simple, transparent <em style={{ fontStyle: "italic", fontWeight: 500 }}>pricing</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#3A382F", maxWidth: 520, margin: "0 auto 36px" }}>
            Choose the plan that fits your publishing goals. All plans include a 7-day free trial — no credit card required.
          </p>
        </section>

        {/* ── PLANS ── */}
        <section style={{ padding: "0 40px 100px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.popular ? "#0E4938" : "#FFFFFF",
                  color: plan.popular ? "#FBF7EF" : "#1B1A17",
                  border: plan.popular ? "1px solid #0E4938" : "1px solid rgba(27,26,23,.08)",
                  borderRadius: 24,
                  padding: "36px 28px",
                  position: "relative",
                  transition: "transform .3s, box-shadow .3s",
                  transform: plan.popular ? "scale(1.03)" : "scale(1)",
                  boxShadow: plan.popular
                    ? "0 24px 60px -16px rgba(7,59,45,.35)"
                    : "0 8px 24px -8px rgba(7,59,45,.10)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {plan.popular && (
                  <span style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: "#E8B340", color: "#0E4938",
                    fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    padding: "4px 16px", borderRadius: 999,
                  }}>
                    Most Popular
                  </span>
                )}

                {/* Plan name */}
                <div style={{ marginBottom: 6 }}>
                  <p style={{
                    fontFamily: "'Source Serif 4','Georgia',serif",
                    fontWeight: 600, fontSize: 21,
                    color: plan.popular ? "#F4E2A8" : "#0E4938",
                    letterSpacing: "-.2px",
                  }}>{plan.name}</p>
                  <p style={{ fontSize: 13, color: plan.popular ? "rgba(251,247,239,.6)" : "#6E6A5E", marginTop: 2 }}>
                    {plan.desc}
                  </p>
                </div>

                {/* Price */}
                <div style={{ margin: "20px 0 28px" }}>
                  <span style={{
                    fontFamily: "'Source Serif 4','Georgia',serif",
                    fontWeight: 500, fontSize: 54, lineHeight: 1,
                    color: plan.popular ? "#FBF7EF" : "#1B1A17",
                    letterSpacing: "-1.4px",
                  }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: plan.popular ? "rgba(251,247,239,.5)" : "#6E6A5E", fontWeight: 500 }}> /month</span>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", fontSize: 14 }}>
                      <span style={{ color: plan.popular ? "#E8B340" : "#0B5C46", flexShrink: 0, marginTop: 2 }}>{CHECK}</span>
                      <span style={{ flex: 1, color: plan.popular ? "rgba(251,247,239,.85)" : "#3A382F" }}>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span style={{ cursor: "help", flexShrink: 0 }}>
                            <HelpCircle style={{ width: 14, height: 14, color: plan.popular ? "rgba(251,247,239,.3)" : "rgba(27,26,23,.25)" }} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent><p style={{ maxWidth: 220 }}>{f.tip}</p></TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                  {plan.locked.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 14, opacity: .4 }}>
                      <span style={{ fontSize: 13, flexShrink: 0 }}>🔒</span>
                      <span style={{ color: plan.popular ? "#FBF7EF" : "#3A382F" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to="/auth"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: plan.popular ? "#E8B340" : "transparent",
                    color: plan.popular ? "#0E4938" : "#0E4938",
                    border: plan.popular ? "1px solid #E8B340" : "1px solid rgba(14,73,56,.25)",
                    borderRadius: 999,
                    padding: "14px 24px",
                    fontSize: 14, fontWeight: 600,
                    textDecoration: "none",
                    transition: "all .2s",
                  }}
                >
                  {plan.cta} {ARROW}
                </Link>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "#6E6A5E" }}>
            All plans include a 7-day free trial. No credit card required to start.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: "80px 40px 100px", maxWidth: 780, margin: "0 auto" }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 500, letterSpacing: "1.6px", textTransform: "uppercase", color: "#0B5C46", opacity: .75, marginBottom: 18, textAlign: "center" }}>FAQ</p>
          <h2 style={{ fontFamily: "'Source Serif 4','Georgia',serif", fontWeight: 600, fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.04, letterSpacing: "-1.2px", color: "#0E4938", marginBottom: 40, textAlign: "center" }}>
            Common questions
          </h2>
          <div style={{ borderTop: "1px solid rgba(27,26,23,.08)" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(27,26,23,.08)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", background: "transparent", border: 0,
                    padding: "22px 0", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    textAlign: "left",
                    fontFamily: "'Source Serif 4','Georgia',serif",
                    fontWeight: 500, fontSize: 19, color: "#0E4938",
                    letterSpacing: "-.2px",
                  }}
                >
                  {faq.q}
                  <span style={{
                    fontSize: 22, color: "#C9A24F", flexShrink: 0, marginLeft: 24,
                    transition: "transform .3s",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                    display: "block",
                  }}>+</span>
                </button>
                <div style={{
                  maxHeight: openFaq === i ? 200 : 0,
                  overflow: "hidden", transition: "max-height .4s ease",
                }}>
                  <p style={{ fontSize: 15, color: "#3A382F", lineHeight: 1.65, paddingBottom: 24, maxWidth: 680 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{
          padding: "100px 40px", background: "#0E4938", color: "#FBF7EF",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ maxWidth: 660, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 32, color: "#E8B340", display: "block", marginBottom: 20 }}>✦</span>
            <h2 style={{
              fontFamily: "'Source Serif 4','Georgia',serif",
              fontWeight: 600, fontSize: "clamp(36px,5vw,56px)",
              lineHeight: 1.04, letterSpacing: "-1.2px", marginBottom: 18,
            }}>
              Start your 7-day free trial
            </h2>
            <p style={{ fontSize: 18, color: "rgba(251,247,239,.75)", marginBottom: 36, maxWidth: 460, margin: "0 auto 36px" }}>
              Try the full Author plan free. No credit card required.
            </p>
            <Link
              to="/auth"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E8B340", color: "#0E4938",
                border: "1px solid #E8B340", borderRadius: 999,
                padding: "16px 32px", fontSize: 15, fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get started free {ARROW}
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
