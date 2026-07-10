import UserAvatar from "./UserAvatar.jsx";

export default function ChatBubble({ msg, otherName, otherAvatarUrl }) {
  const mine = msg.from === "me";
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
      {!mine && (
        <UserAvatar name={otherName || "?"} size={30} avatarUrl={otherAvatarUrl || undefined} />
      )}
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: 18,
          borderBottomRightRadius: mine ? 4 : 18,
          borderBottomLeftRadius: mine ? 18 : 4,
          background: mine ? "var(--color-primary)" : "var(--color-surface-container)",
          color: mine ? "#fff" : "var(--color-text)",
        }}
      >
        <div style={{ fontSize: 15 }}>{msg.text}</div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
      </div>
    </div>
  );
}
