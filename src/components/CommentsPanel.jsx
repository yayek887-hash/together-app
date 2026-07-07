import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchComments, createComment } from "../lib/api.js";
import UserAvatar from "./UserAvatar.jsx";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function CommentsPanel({ postId, onCountChange }) {
  const { user, profile } = useAuth();
  const [comments, setComments]   = useState([]);
  const [text, setText]           = useState("");
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchComments(postId)
      .then((data) => {
        setComments(data);
        onCountChange?.(data.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSend = async () => {
    if (!text.trim() || submitting || !user) return;
    setSubmitting(true);
    try {
      const comment = await createComment(postId, user.id, text.trim());
      const updated = [...comments, comment];
      setComments(updated);
      onCountChange?.(updated.length);
      setText("");
    } catch {
      // silent — comment list stays unchanged
    } finally {
      setSubmitting(false);
    }
  };

  const myName = profile?.username || user?.email?.split("@")[0] || "You";

  return (
    <div style={{ borderTop: "1px solid var(--color-surface-highest)", padding: "12px 16px 14px", background: "var(--color-surface-low)", borderRadius: "0 0 22px 22px" }}>

      {loading && (
        <div className="loading-dots" style={{ margin: "8px 0" }}><span /><span /><span /></div>
      )}

      {!loading && comments.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--color-text-soft)", textAlign: "center", margin: "4px 0 10px" }}>
          No comments yet — say something kind 💜
        </p>
      )}

      {/* Comment list */}
      {comments.map((c) => (
        <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
          <UserAvatar name={c.author?.username || "?"} size={30} avatarUrl={c.author?.avatar_url || undefined} />
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 14,
              padding: "8px 12px",
              boxShadow: "0 1px 4px rgba(91,60,221,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>
                {c.author?.username || "Someone"}
              </span>
              <span style={{ fontSize: 10, color: "var(--color-text-soft)" }}>
                {timeAgo(c.created_at)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>
              {c.text}
            </p>
          </div>
        </div>
      ))}

      {/* Input row */}
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <UserAvatar name={myName} size={30} avatarUrl={profile?.avatar_url || undefined} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Say something kind…"
          style={{
            flex: 1,
            border: "1.5px solid var(--color-outline-variant)",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 13,
            outline: "none",
            fontFamily: "Rubik, sans-serif",
            background: "#fff",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e)  => (e.target.style.borderColor = "var(--color-outline-variant)")}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || submitting}
          style={{
            background: text.trim() ? "var(--color-primary)" : "var(--color-surface-high)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            cursor: text.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
            boxShadow: text.trim() ? "0 3px 10px rgba(91,60,221,0.3)" : "none",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, color: text.trim() ? "#fff" : "var(--color-text-soft)" }}
          >
            send
          </span>
        </button>
      </div>
    </div>
  );
}
