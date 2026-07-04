import { useState } from "react";
import { Smile, Send } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderTop: "1px solid #F0EEFA",
        background: "var(--color-bg)",
      }}
    >
      <button style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Add emoji">
        <Smile size={22} color="var(--color-text-soft)" />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Type something kind..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "#F4F2FF",
          borderRadius: 20,
          padding: "10px 16px",
          fontSize: 14,
        }}
      />
      <button
        onClick={send}
        aria-label="Send message"
        style={{
          background: "var(--color-primary)",
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
        <Send size={16} color="#fff" />
      </button>
    </div>
  );
}
