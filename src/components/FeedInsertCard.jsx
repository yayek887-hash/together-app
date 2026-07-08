import { INTERESTS } from "../data/inspireContent.js";

function getAccent(topic) {
  return INTERESTS.find(i => i.key === topic) || { color: "#5b3cdd", bg: "#f5f3ff", emoji: "✨", label: topic };
}

/* ── Quote card ── full gradient, feels editorial */
export function QuoteCard({ card, topic }) {
  const { color, bg, emoji } = getAccent(topic);
  return (
    <div style={{
      borderRadius: 22, marginBottom: 12, overflow: "hidden",
      background: `linear-gradient(145deg, ${color}ee, ${color}99)`,
      padding: "24px 22px 20px",
      boxShadow: `0 6px 28px ${color}44`,
      position: "relative",
    }}>
      {/* big decorative quote mark */}
      <div style={{ position: "absolute", top: 10, right: 18, fontSize: 72, color: "rgba(255,255,255,0.18)", fontFamily: "Georgia, serif", lineHeight: 1, userSelect: "none" }}>"</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
        {emoji} {card.title}
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.55, fontStyle: "italic", maxWidth: 280 }}>
        {card.text}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 2 }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Daily inspiration</span>
      </div>
    </div>
  );
}

/* ── Tip card ── clean white with accent left bar */
export function TipCard({ card, topic }) {
  const { color, bg, emoji, label } = getAccent(topic);
  return (
    <div style={{
      borderRadius: 20, marginBottom: 12, overflow: "hidden",
      background: "#fff",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      display: "flex",
      border: `1.5px solid ${color}22`,
    }}>
      {/* colored left bar */}
      <div style={{ width: 5, background: `linear-gradient(180deg, ${color}, ${color}66)`, flexShrink: 0 }} />
      <div style={{ padding: "16px 16px 16px 14px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
            {card.emoji}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label} tip</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", marginTop: 1 }}>{card.title}</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "var(--color-text)", lineHeight: 1.6 }}>{card.text}</p>
      </div>
    </div>
  );
}

/* ── Challenge card ── bold CTA, darker feel */
export function ChallengeCard({ card, topic, onDone }) {
  const { color, emoji, label } = getAccent(topic);
  return (
    <div style={{
      borderRadius: 22, marginBottom: 12,
      background: `linear-gradient(145deg, #1a1035, #2d1b6e)`,
      padding: "20px 20px 18px",
      boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
      position: "relative", overflow: "hidden",
    }}>
      {/* subtle glow */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `${color}55`, filter: "blur(40px)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, position: "relative" }}>
        <div style={{ fontSize: 22 }}>{card.emoji}</div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: `${color}cc`, letterSpacing: "0.1em", textTransform: "uppercase" }}>Weekly challenge · {label}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 1 }}>{card.title}</div>
        </div>
      </div>

      <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, position: "relative" }}>
        {card.text}
      </p>

      <button
        onClick={onDone}
        style={{
          background: color, border: "none", borderRadius: 12,
          padding: "9px 18px", fontSize: 13, fontWeight: 700,
          color: "#fff", cursor: "pointer", fontFamily: "Rubik, sans-serif",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: `0 3px 14px ${color}66`, position: "relative",
        }}
      >
        ✓ I'll try this
      </button>
    </div>
  );
}
