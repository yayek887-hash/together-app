import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import { updateInterests } from "../lib/api.js";

const PILLARS = [
  { emoji: "🔥", title: "Inspire",  desc: "A feed that actually excites you" },
  { emoji: "🤝", title: "Connect", desc: "People who get you" },
  { emoji: "📍", title: "Meet",    desc: "Turn online into real life" },
  { emoji: "💜", title: "Support", desc: "Safe space for anything" },
];

export default function OnboardingPage() {
  const navigate  = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep]           = useState(0); // 0=welcome, 1=interests, 2=done
  const [selected, setSelected]   = useState([]);
  const [saving, setSaving]       = useState(false);

  const toggle = (key) =>
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const handleSave = async () => {
    if (selected.length < 3 || saving) return;
    setSaving(true);
    await updateInterests(user.id, selected).catch(() => {});
    await refreshProfile();
    setStep(2);
  };

  const handleDone = () => navigate("/home", { replace: true });

  /* ── Step 0: Welcome ── */
  if (step === 0) return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #1a1035 0%, #2d1b6e 50%, #1a1035 100%)",
      padding: "0 0 40px",
    }}>
      {/* Logo */}
      <div style={{ padding: "52px 28px 0", fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
        <span style={{ background: "linear-gradient(90deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>together</span>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.18, letterSpacing: "-0.03em", marginBottom: 16 }}>
          Grow with people<br />
          <span style={{ background: "linear-gradient(90deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            who get you.
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 300 }}>
          Real connections, daily inspiration, and safe spaces — built for people who want more.
        </p>

        {/* Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 44 }}>
          {PILLARS.map(p => (
            <div key={p.title} style={{
              background: "rgba(255,255,255,0.07)", borderRadius: 18,
              padding: "16px 14px", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{p.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 28px" }}>
        <button onClick={() => setStep(1)} style={{
          width: "100%", padding: "17px", borderRadius: 999,
          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
          border: "none", fontSize: 16, fontWeight: 800,
          color: "#fff", cursor: "pointer", fontFamily: "Rubik, sans-serif",
          boxShadow: "0 6px 28px rgba(124,58,237,0.5)",
        }}>
          Get started →
        </button>
      </div>
    </div>
  );

  /* ── Step 1: Pick interests ── */
  if (step === 1) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>

      {/* Header */}
      <div style={{ padding: "52px 24px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-primary)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Step 1 of 1
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 10 }}>
          What inspires you?
        </div>
        <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Pick at least 3 topics — your feed, communities,<br />and activities will be built around these.
        </p>
      </div>

      {/* Grid of interests */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {INTERESTS.map(i => {
            const active = selected.includes(i.key);
            return (
              <button key={i.key} onClick={() => toggle(i.key)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 700,
                border: active ? "none" : "1.5px solid var(--color-outline-variant)",
                cursor: "pointer", fontFamily: "Rubik, sans-serif",
                background: active ? i.color : "#fff",
                color: active ? "#fff" : "var(--color-text)",
                boxShadow: active ? `0 4px 16px ${i.color}44` : "0 1px 4px rgba(0,0,0,0.05)",
                transform: active ? "scale(1.05)" : "scale(1)",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 18 }}>{i.emoji}</span>
                {i.label}
                {active && <span style={{ fontSize: 13 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter + CTA */}
      <div style={{ padding: "16px 24px 40px", borderTop: "1px solid var(--color-surface-high)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-soft)" }}>
            {selected.length < 3
              ? `Choose ${3 - selected.length} more`
              : `${selected.length} selected ✓`}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {selected.slice(0, 5).map(k => {
              const i = INTERESTS.find(x => x.key === k);
              return i ? <span key={k} style={{ fontSize: 18 }}>{i.emoji}</span> : null;
            })}
            {selected.length > 5 && <span style={{ fontSize: 12, color: "var(--color-text-soft)", lineHeight: "28px" }}>+{selected.length - 5}</span>}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={selected.length < 3 || saving}
          style={{
            width: "100%", padding: "16px", borderRadius: 999,
            background: selected.length >= 3 ? "var(--color-primary)" : "var(--color-surface-high)",
            color: selected.length >= 3 ? "#fff" : "var(--color-text-soft)",
            border: "none", fontSize: 16, fontWeight: 800,
            cursor: selected.length >= 3 ? "pointer" : "default",
            fontFamily: "Rubik, sans-serif", transition: "all 0.2s",
            boxShadow: selected.length >= 3 ? "0 6px 24px rgba(91,60,221,0.35)" : "none",
          }}
        >
          {saving ? "Setting up your space…" : "Build my feed →"}
        </button>
      </div>
    </div>
  );

  /* ── Step 2: Done ── */
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #1a1035 0%, #2d1b6e 100%)",
      padding: "40px 28px", textAlign: "center",
    }}>
      <div style={{ fontSize: 72, marginBottom: 24, animation: "pulse 1s ease-in-out" }}>🚀</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 14 }}>
        Your space is ready!
      </div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 280 }}>
        We built your feed around {selected.length} interests. It gets better the more you use it.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
        {selected.map(k => {
          const i = INTERESTS.find(x => x.key === k);
          return i ? (
            <span key={k} style={{ background: `${i.color}33`, border: `1px solid ${i.color}66`, color: "#fff", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>
              {i.emoji} {i.label}
            </span>
          ) : null;
        })}
      </div>
      <button onClick={handleDone} style={{
        width: "100%", maxWidth: 320, padding: "17px",
        borderRadius: 999, background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
        border: "none", fontSize: 16, fontWeight: 800,
        color: "#fff", cursor: "pointer", fontFamily: "Rubik, sans-serif",
        boxShadow: "0 6px 28px rgba(124,58,237,0.5)",
      }}>
        Let's go 🔥
      </button>
    </div>
  );
}
