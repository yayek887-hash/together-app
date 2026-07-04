import { Heart } from "lucide-react";

export default function SupportButton({ active, count, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: active ? "#FFF0EE" : "transparent",
        border: "none",
        borderRadius: 20,
        padding: "6px 12px",
        cursor: "pointer",
      }}
    >
      <Heart
        size={18}
        fill={active ? "var(--color-error)" : "none"}
        color={active ? "var(--color-error)" : "var(--color-text-soft)"}
        style={active ? { animation: "pop 0.35s ease" } : {}}
      />
      <span style={{ fontSize: 13, color: active ? "var(--color-error)" : "var(--color-text-soft)" }}>
        {active ? "I'm here for you" : "Send Support"} · {count}
      </span>
    </button>
  );
}
