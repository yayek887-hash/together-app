export default function ReportCard({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "10px 14px",
        borderRadius: 16,
        fontSize: 13,
        cursor: "pointer",
        border: active ? "2px solid var(--color-error)" : "2px solid transparent",
        background: active ? "#FFEDEB" : "#fff",
        color: active ? "var(--color-error)" : "var(--color-text)",
        boxShadow: "0 2px 6px rgba(108,99,255,0.06)",
      }}
    >
      {label}
    </button>
  );
}
