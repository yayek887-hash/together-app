export default function AchievementBadge({ badge }) {
  return (
    <div style={{ textAlign: "center", width: 90 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          margin: "0 auto 6px",
        }}
      >
        {badge.icon}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500 }}>{badge.name}</div>
    </div>
  );
}
