import { useState } from "react";
import UserAvatar from "./UserAvatar.jsx";
import CommentsPanel from "./CommentsPanel.jsx";
import { addReaction, removeReaction } from "../lib/api.js";

const MOOD_CHIP = {
  Happy: "mood-chip-happy", Calm: "mood-chip-calm", Sad: "mood-chip-sad",
  Anxious: "mood-chip-anxious", Angry: "mood-chip-angry", Tired: "mood-chip-tired",
};
const MOOD_EMOJI = {
  Happy: "😊", Calm: "😌", Sad: "😢",
  Anxious: "😰", Angry: "😡", Tired: "😴",
};

const REACTIONS = [
  { type: "here_for_you",  label: "Here for you",   emoji: "💜" },
  { type: "been_there",    label: "Been there",      emoji: "🤝" },
  { type: "you_got_this",  label: "You've got this", emoji: "✨" },
  { type: "sending_hug",   label: "Sending a hug",   emoji: "🫂" },
];

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function buildSupportMessage(reactions) {
  if (!reactions.length) return null;
  const supporters = new Set(reactions.map((r) => r.user_id)).size;
  const beenThere  = reactions.filter((r) => r.type === "been_there").length;
  let msg = `${supporters} ${supporters === 1 ? "person" : "people"} sent support 💜`;
  if (beenThere > 0) msg += ` · ${beenThere} ${beenThere === 1 ? "has" : "have"} been there too`;
  return msg;
}

export default function PostCard({ post, currentUserId, onChanged }) {
  const initial     = post.post_reactions || [];
  const [allRx, setAllRx]           = useState(initial);
  const [busy, setBusy]             = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(() => (post.comments || []).length);

  const myTypes  = new Set(allRx.filter((r) => r.user_id === currentUserId).map((r) => r.type));
  const isAuthor = currentUserId && currentUserId === post.author?.id;
  const displayName = post.is_anonymous ? "Anonymous 🎭" : post.author?.username || "Someone";

  const handleReaction = async (type) => {
    if (busy || !currentUserId) return;
    setBusy(true);
    const had = myTypes.has(type);
    setAllRx((prev) =>
      had
        ? prev.filter((r) => !(r.user_id === currentUserId && r.type === type))
        : [...prev, { user_id: currentUserId, type }]
    );
    try {
      if (had) await removeReaction(post.id, currentUserId, type);
      else     await addReaction(post.id, currentUserId, type);
    } catch {
      setAllRx(initial);
    } finally {
      setBusy(false);
    }
  };

  const supportMsg  = buildSupportMessage(allRx);

  return (
    <article
      style={{
        background: "var(--color-card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      {/* ── Author row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
        <UserAvatar name={displayName} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>{displayName}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 1 }}>{timeAgo(post.created_at)}</div>
        </div>
        {post.mood && (
          <span
            className={MOOD_CHIP[post.mood] || ""}
            style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: "1.5px solid", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
          >
            {MOOD_EMOJI[post.mood]} {post.mood}
          </span>
        )}
      </div>

      {/* ── Image ── */}
      {post.image_url && (
        <div style={{ width: "100%", height: 220, backgroundImage: `url(${post.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}

      {/* ── Text ── */}
      <div style={{ padding: "12px 16px 10px" }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--color-text)" }}>{post.text}</p>
      </div>

      {/* ── Support summary (public) ── */}
      {supportMsg && (
        <div style={{ margin: "0 16px 10px", background: "var(--color-surface-low)", borderRadius: 12, padding: "9px 14px", fontSize: 13, color: "var(--color-text-soft)", fontWeight: 600 }}>
          {supportMsg}
        </div>
      )}

      {/* ── 4 reaction buttons ── */}
      <div style={{ display: "flex", gap: 7, padding: "0 16px 12px", flexWrap: "wrap" }}>
        {REACTIONS.map((r) => {
          const active = myTypes.has(r.type);
          return (
            <button
              key={r.type}
              onClick={() => handleReaction(r.type)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: active ? "var(--color-primary-fixed)" : "var(--color-surface-low)",
                border: active ? "1.5px solid var(--color-primary)" : "1.5px solid transparent",
                borderRadius: 12, padding: "8px 13px",
                fontSize: 12, fontWeight: active ? 700 : 500,
                color: active ? "var(--color-primary)" : "var(--color-text-soft)",
                cursor: "pointer", fontFamily: "Rubik, sans-serif",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{r.emoji}</span>
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ── Comment button ── */}
      <div style={{ padding: "0 16px 14px" }}>
        <button
          onClick={() => setShowComments((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: showComments ? "var(--color-primary-fixed)" : "none",
            border: "none", cursor: "pointer", padding: "7px 12px",
            borderRadius: 12, fontSize: 13, fontFamily: "Rubik, sans-serif",
            color: showComments ? "var(--color-primary)" : "var(--color-text-soft)",
            fontWeight: showComments ? 700 : 500, transition: "background 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: showComments ? "var(--color-primary)" : "var(--color-outline)" }}>
            chat_bubble
          </span>
          Reply with support · {commentCount}
        </button>
      </div>

      {/* ── Author-only private panel ── */}
      {isAuthor && allRx.length > 0 && (
        <PrivatePanel reactions={allRx} />
      )}

      {/* ── Comments panel ── */}
      {showComments && (
        <CommentsPanel postId={post.id} onCountChange={setCommentCount} />
      )}
    </article>
  );
}

function PrivatePanel({ reactions }) {
  const counts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.type === r.type).length,
  })).filter((r) => r.count > 0);

  const total = new Set(reactions.map((r) => r.user_id)).size;

  return (
    <div style={{
      margin: "0 12px 14px",
      background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
      border: "1.5px solid #6ee7b7",
      borderRadius: 16,
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>
          Your post reached {total} {total === 1 ? "person" : "people"} 🌟
        </span>
        <span style={{ fontSize: 11, color: "#6ee7b7", background: "#d1fae5", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
          only you see this
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {counts.map((r) => (
          <div key={r.type} style={{ background: "#fff", borderRadius: 12, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6, border: "1px solid #a7f3d0" }}>
            <span style={{ fontSize: 16 }}>{r.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", lineHeight: 1 }}>{r.count}</div>
              <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.3, marginTop: 1 }}>{r.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
