import { useNavigate } from "react-router-dom";

export default function TopBar({ title, showBack = false, right = null }) {
  const navigate = useNavigate();
  return (
    <div
      className="glass"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px 12px",
        gap: 10,
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid var(--color-surface-highest)",
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            background: "var(--color-surface-high)",
            border: "none",
            width: 38,
            height: 38,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-text)" }}>
            arrow_back
          </span>
        </button>
      )}
      <h2 className="t-h2" style={{ flex: 1 }}>{title}</h2>
      {right}
    </div>
  );
}
