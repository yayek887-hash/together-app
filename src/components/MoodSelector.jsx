export const MOODS = [
  { emoji: "😊", label: "Happy",   chipClass: "mood-chip-happy"   },
  { emoji: "😌", label: "Calm",    chipClass: "mood-chip-calm"    },
  { emoji: "😢", label: "Sad",     chipClass: "mood-chip-sad"     },
  { emoji: "😰", label: "Anxious", chipClass: "mood-chip-anxious" },
  { emoji: "😡", label: "Angry",   chipClass: "mood-chip-angry"   },
  { emoji: "😴", label: "Tired",   chipClass: "mood-chip-tired"   },
];

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div
      style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}
      className="scrollbar-none"
    >
      {MOODS.map((m) => {
        const active = selected === m.label;
        return (
          <button
            key={m.label}
            onClick={() => onSelect(active ? null : m.label)}
            aria-pressed={active}
            className={active ? m.chipClass : ""}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              background: active ? undefined : "var(--color-card)",
              border: active ? "2px solid" : "2px solid var(--color-outline-variant)",
              borderRadius: 999,
              padding: "10px 14px",
              minWidth: 68,
              cursor: "pointer",
              boxShadow: active ? "0 3px 12px rgba(0,0,0,0.08)" : "0 2px 6px rgba(91,60,221,0.04)",
              transition: "all 0.22s ease",
              transform: active ? "scale(1.1) translateY(-3px)" : "scale(1)",
            }}
          >
            <span style={{ fontSize: 26, lineHeight: 1 }}>{m.emoji}</span>
            <span style={{
              fontSize: 11,
              fontWeight: active ? 700 : 500,
              color: active ? "inherit" : "var(--color-text-soft)",
            }}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
