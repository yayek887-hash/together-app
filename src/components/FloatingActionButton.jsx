export default function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Create new post"
      style={{
        position: "fixed",
        bottom: 90,
        right: "max(20px, calc(50vw - 220px))",
        width: 58,
        height: 58,
        borderRadius: "50%",
        background: "var(--color-primary)",
        border: "none",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 24px rgba(91,60,221,0.40), 0 2px 8px rgba(91,60,221,0.20)",
        cursor: "pointer",
        zIndex: 20,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
    </button>
  );
}
