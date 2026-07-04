export default function ChatBubble({ msg }) {
  const mine = msg.from === "me";
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 10 }}>
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: 18,
          borderBottomRightRadius: mine ? 4 : 18,
          borderBottomLeftRadius: mine ? 18 : 4,
          background: mine ? "var(--color-primary)" : "var(--color-secondary)",
          color: mine ? "#fff" : "var(--color-text)",
        }}
      >
        <div style={{ fontSize: 15 }}>{msg.text}</div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
      </div>
    </div>
  );
}
