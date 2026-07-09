import { useState, useRef, useEffect } from "react";
import { Smile, Send } from "lucide-react";

const EMOJIS = ["😊","😂","❤️","🙏","🔥","✨","😍","🥰","😢","😭","💜","🤝","👏","💪","🎉","😅","🤔","😌","💡","🌟","😎","🫂","👋","💬","🙌"];

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {showEmojis && (
        <div ref={panelRef} style={{
          position: "absolute", bottom: "100%", left: 0, right: 0,
          background: "#fff", border: "1px solid var(--color-outline-variant)",
          borderRadius: 16, padding: "10px 12px", marginBottom: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          display: "flex", flexWrap: "wrap", gap: 6,
          zIndex: 100,
        }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => insertEmoji(e)} style={{
              background: "none", border: "none", fontSize: 22,
              cursor: "pointer", padding: "2px 4px", borderRadius: 8,
              transition: "background 0.1s",
            }}
            onMouseEnter={el => el.currentTarget.style.background = "var(--color-surface-low)"}
            onMouseLeave={el => el.currentTarget.style.background = "none"}
            >{e}</button>
          ))}
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px",
        borderTop: "1px solid #F0EEFA",
        background: "var(--color-bg)",
      }}>
        <button
          onClick={() => setShowEmojis(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
          aria-label="Add emoji"
        >
          <Smile size={22} color={showEmojis ? "var(--color-primary)" : "var(--color-text-soft)"} />
        </button>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type something kind..."
          style={{
            flex: 1, border: "none", outline: "none",
            background: "#F4F2FF", borderRadius: 20,
            padding: "10px 16px", fontSize: 14,
            fontFamily: "Rubik, sans-serif",
          }}
        />
        <button
          onClick={send}
          aria-label="Send message"
          style={{
            background: "var(--color-primary)", border: "none",
            width: 38, height: 38, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}
