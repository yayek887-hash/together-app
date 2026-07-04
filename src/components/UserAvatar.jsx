const AVATAR_COLORS = [
  "#5b3cdd", "#7459f7", "#006766", "#b8a7ff", "#ffb77d", "#c9bfff",
];

export function avatarColor(seed) {
  const i = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

export default function UserAvatar({ name, size = 46, color }) {
  const isAnon = name === "Anonymous";
  const initials = isAnon ? "?" : name.slice(0, 1).toUpperCase();
  const bg = isAnon ? "var(--color-surface-highest)" : (color || avatarColor(name));

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {isAnon ? (
        <span className="material-symbols-outlined" style={{ fontSize: size * 0.42, color: "var(--color-text-soft)" }}>
          visibility_off
        </span>
      ) : initials}
    </div>
  );
}

export { AVATAR_COLORS };
