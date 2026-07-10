import { useState } from "react";
import UserAvatar from "./UserAvatar.jsx";
import CommentsPanel from "./CommentsPanel.jsx";
import { addReaction, removeReaction } from "../lib/api.js";
import { INTERESTS } from "../data/inspireContent.js";

const MOOD_EMOJI = { Happy:"😊", Calm:"😌", Sad:"😢", Anxious:"😰", Angry:"😡", Tired:"😴" };
const MOOD_COLOR = {
  Happy:"#f59e0b", Calm:"#06b6d4", Sad:"#6366f1",
  Anxious:"#8b5cf6", Angry:"#ef4444", Tired:"#64748b",
};

const REACTIONS = [
  { type: "here_for_you",  label: "Here for you",   emoji: "💜" },
  { type: "been_there",    label: "Been there",      emoji: "🤝" },
  { type: "you_got_this",  label: "You've got this", emoji: "✨" },
  { type: "sending_hug",   label: "Sending a hug",   emoji: "🫂" },
];

function timeAgo(dateStr) {
  const m = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function buildSupportMessage(reactions) {
  if (!reactions.length) return null;
  const n = new Set(reactions.map(r => r.user_id)).size;
  const bt = reactions.filter(r => r.type === "been_there").length;
  let msg = `${n} ${n === 1 ? "person" : "people"} sent support 💜`;
  if (bt > 0) msg += ` · ${bt} ${bt === 1 ? "has" : "have"} been there`;
  return msg;
}

export default function PostCard({ post, currentUserId, onChanged, featured }) {
  const [allRx, setAllRx]             = useState(post.post_reactions || []);
  const [busy, setBusy]               = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState((post.comments || []).length);

  const myTypes  = new Set(allRx.filter(r => r.user_id === currentUserId).map(r => r.type));
  const isAuthor = currentUserId && currentUserId === post.author?.id;
  const displayName = post.is_anonymous ? "Anonymous 🎭" : (post.author?.display_name || post.author?.username || "Someone");

  const interest = INTERESTS.find(i => i.key === post.topic);
  const accent   = interest?.color || (post.mood ? MOOD_COLOR[post.mood] : null);
  const hasMedia = !!post.image_url;

  const handleReaction = async (type) => {
    if (busy || !currentUserId) return;
    setBusy(true);
    const had = myTypes.has(type);
    setAllRx(prev => had
      ? prev.filter(r => !(r.user_id === currentUserId && r.type === type))
      : [...prev, { user_id: currentUserId, type }]
    );
    try {
      if (had) await removeReaction(post.id, currentUserId, type);
      else     await addReaction(post.id, currentUserId, type);
    } catch { setAllRx(post.post_reactions || []); }
    finally  { setBusy(false); }
  };

  const supportMsg = buildSupportMessage(allRx);

  return (
    <article style={{
      background: "#fff",
      borderRadius: featured ? 24 : 20,
      boxShadow: featured
        ? "0 4px 24px rgba(0,0,0,0.10)"
        : "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.06)",
      marginBottom: featured ? 20 : 12,
      overflow: "hidden",
      border: accent ? `1.5px solid ${accent}18` : "1.5px solid rgba(0,0,0,0.04)",
      transition: "box-shadow 0.22s ease, transform 0.22s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = featured ? "0 4px 24px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >

      {/* ── Accent top bar ── */}
      {accent && (
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}66)` }} />
      )}

      {/* ── Author row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: featured ? "16px 18px 10px" : "12px 14px 8px" }}>
        <UserAvatar name={displayName} size={featured ? 42 : 36} avatarUrl={post.author?.avatar_url || undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: featured ? 15 : 13, color: "var(--color-text)" }}>{displayName}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 1 }}>{timeAgo(post.created_at)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {interest && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${interest.color}18`, color: interest.color, display: "flex", alignItems: "center", gap: 4 }}>
              {interest.emoji} {interest.label}
            </span>
          )}
          {post.mood && !interest && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: `${MOOD_COLOR[post.mood]}18`, color: MOOD_COLOR[post.mood], display: "flex", alignItems: "center", gap: 4 }}>
              {MOOD_EMOJI[post.mood]} {post.mood}
            </span>
          )}
        </div>
      </div>

      {/* ── Media ── */}
      {hasMedia && (
        /\.(mp4|mov|webm|ogg)$/i.test(post.image_url) ? (
          <video src={post.image_url} controls style={{ width: "100%", maxHeight: featured ? 360 : 260, display: "block", objectFit: "cover", background: "#000" }} />
        ) : (
          <div style={{ width: "100%", height: featured ? 260 : 200, backgroundImage: `url(${post.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )
      )}

      {/* ── Text ── */}
      <div style={{ padding: featured ? "14px 18px 10px" : "10px 14px 8px" }}>
        <p style={{
          margin: 0, lineHeight: 1.65, color: "var(--color-text)",
          fontSize: featured ? 16 : 14,
          fontWeight: featured && !hasMedia ? 500 : 400,
        }}>
          {post.text}
        </p>
      </div>

      {/* ── Support summary ── */}
      {supportMsg && (
        <div style={{ margin: "0 14px 8px", background: "var(--color-surface-low)", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: "var(--color-text-soft)", fontWeight: 600 }}>
          {supportMsg}
        </div>
      )}

      {/* ── Reactions ── */}
      <div style={{ display: "flex", gap: 6, padding: featured ? "0 18px 12px" : "0 14px 10px", flexWrap: "wrap" }}>
        {REACTIONS.map(r => {
          const active = myTypes.has(r.type);
          return (
            <button key={r.type} onClick={() => handleReaction(r.type)} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: active ? `${accent || "var(--color-primary)"}18` : "var(--color-surface-low)",
              border: `1.5px solid ${active ? (accent || "var(--color-primary)") : "transparent"}`,
              borderRadius: 10, padding: "7px 11px",
              fontSize: 11, fontWeight: active ? 700 : 500,
              color: active ? (accent || "var(--color-primary)") : "var(--color-text-soft)",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 13, lineHeight: 1 }}>{r.emoji}</span>
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ── Comment button ── */}
      <div style={{ padding: featured ? "0 18px 14px" : "0 14px 12px" }}>
        <button onClick={() => setShowComments(v => !v)} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: showComments ? "var(--color-primary-fixed)" : "none",
          border: "none", cursor: "pointer", padding: "6px 10px",
          borderRadius: 10, fontSize: 12,
          color: showComments ? "var(--color-primary)" : "var(--color-text-soft)",
          fontWeight: showComments ? 700 : 500, transition: "background 0.15s",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: showComments ? "var(--color-primary)" : "var(--color-outline)" }}>chat_bubble</span>
          Reply with support · {commentCount}
        </button>
      </div>

      {isAuthor && allRx.length > 0 && <PrivatePanel reactions={allRx} />}
      {showComments && <CommentsPanel postId={post.id} onCountChange={setCommentCount} />}
    </article>
  );
}

function PrivatePanel({ reactions }) {
  const counts = REACTIONS.map(r => ({ ...r, count: reactions.filter(rx => rx.type === r.type).length })).filter(r => r.count > 0);
  const total = new Set(reactions.map(r => r.user_id)).size;
  return (
    <div style={{ margin: "0 12px 14px", background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", border: "1.5px solid #6ee7b7", borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>Your post reached {total} {total === 1 ? "person" : "people"} 🌟</span>
        <span style={{ fontSize: 10, color: "#6ee7b7", background: "#d1fae5", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>only you see this</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {counts.map(r => (
          <div key={r.type} style={{ background: "#fff", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, border: "1px solid #a7f3d0" }}>
            <span style={{ fontSize: 14 }}>{r.emoji}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", lineHeight: 1 }}>{r.count}</div>
              <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.3, marginTop: 1 }}>{r.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
