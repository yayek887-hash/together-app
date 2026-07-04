export const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
];

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="scrollbar-none">
      {MOODS.map((m) => {
        const active = selected === m.label;
        return (
          <button
            key={m.label}
            onClick={() => onSelect(m.label)}
            aria-pressed={active}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: active ? "var(--color-primary-fixed)" : "var(--color-card)",
              border: active ? "2px solid var(--color-primary)" : "2px solid transparent",
              borderRadius: 999,
              padding: "8px 14px",
              minWidth: 60,
              cursor: "pointer",
              boxShadow: active ? "var(--shadow-soft)" : "0 2px 8px rgba(91,60,221,0.05)",
              transition: "all 0.2s ease",
              transform: active ? "scale(1.06)" : "scale(1)",
            }}
          >
            <span style={{ fontSize: 22 }}>{m.emoji}</span>
            <span className="t-label-sm" style={{ color: active ? "var(--color-primary)" : "var(--color-text-soft)" }}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
