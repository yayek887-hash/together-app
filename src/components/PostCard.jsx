import { useState } from "react";
import UserAvatar from "./UserAvatar.jsx";
import CommentsPanel from "./CommentsPanel.jsx";
import { toggleLike, toggleSupport } from "../lib/api.js";

const MOOD_CHIP = {
  Happy:   "mood-chip-happy",
  Calm:    "mood-chip-calm",
  Sad:     "mood-chip-sad",
  Anxious: "mood-chip-anxious",
  Angry:   "mood-chip-angry",
  Tired:   "mood-chip-tired",
};

const MOOD_EMOJI = {
  Happy: "😊", Calm: "😌", Sad: "😢",
  Anxious: "😰", Angry: "😡", Tired: "😴",
};

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

export default function PostCard({ post, currentUserId, onChanged }) {
  const [busy, setBusy]           = useState(false);
  const [liked, setLiked]         = useState(() => (post.post_likes || []).some((l) => l.user_id === currentUserId));
  const [heartAnim, setHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(() => (post.comments || []).length);

  const displayName  = post.is_anonymous ? "Anonymous 🎭" : post.author?.username || "Someone";
  const isSupported  = (post.post_supports || []).some((s) => s.user_id === currentUserId);
  const likeCount    = (post.post_likes    || []).length;
  const supportCount = (post.post_supports || []).length;

  const handleLike = async () => {
    if (busy || !currentUserId) return;
    setLiked((v) => !v);
    if (!liked) { setHeartAnim(true); setTimeout(() => setHeartAnim(false), 420); }
    setBusy(true);
    try {
      await toggleLike(post.id, currentUserId, liked);
      onChanged?.();
    } finally { setBusy(false); }
  };

  const handleSupport = async () => {
    if (busy || !currentUserId) return;
    setBusy(true);
    try {
      await toggleSupport(post.id, currentUserId, isSupported);
      onChanged?.();
    } finally { setBusy(false); }
  };

  return (
    <article
      style={{
        background: "var(--color-card)",
        borderRadius: 22,
        boxShadow: "var(--shadow-card)",
        marginBottom: 16,
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* ── Author row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
        <UserAvatar name={displayName} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>{displayName}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 1 }}>
            {timeAgo(post.created_at)}
          </div>
        </div>
        {post.mood && (
          <span
            className={MOOD_CHIP[post.mood] || ""}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1.5px solid",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {MOOD_EMOJI[post.mood]} {post.mood}
          </span>
        )}
      </div>

      {/* ── Image (full-bleed, Instagram-style) ── */}
      {post.image_url && (
        <div
          style={{
            width: "100%",
            height: 220,
            backgroundImage: `url(${post.image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* ── Text body ── */}
      <div style={{ padding: "12px 16px 4px" }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--color-text)" }}>
          {post.text}
        </p>
      </div>

      {/* ── Actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px 14px",
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex", gap: 2 }}>
          {/* Like (Instagram-style heart) */}
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: liked ? "rgba(232,69,69,0.08)" : "none",
              border: "none",
              cursor: "pointer",
              padding: "7px 12px",
              borderRadius: 12,
              transition: "background 0.15s",
            }}
          >
            <span
              className={`material-symbols-outlined ${liked ? "ms-filled" : ""} ${heartAnim ? "heart-pop" : ""}`}
              style={{ fontSize: 22, color: liked ? "#e84545" : "var(--color-outline)", transition: "color 0.15s" }}
            >
              favorite
            </span>
            <span style={{ fontSize: 13, fontWeight: liked ? 700 : 500, color: liked ? "#e84545" : "var(--color-text-soft)" }}>
              {likeCount}
            </span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: showComments ? "var(--color-primary-fixed)" : "none",
              border: "none",
              cursor: "pointer",
              padding: "7px 12px",
              borderRadius: 12,
              transition: "background 0.15s",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: showComments ? "var(--color-primary)" : "var(--color-outline)" }}
            >
              chat_bubble
            </span>
            <span style={{ fontSize: 13, color: showComments ? "var(--color-primary)" : "var(--color-text-soft)", fontWeight: showComments ? 700 : 500 }}>
              {commentCount}
            </span>
          </button>
        </div>

        {/* Support (WhatsApp-teal style) */}
        <button
          onClick={handleSupport}
          aria-pressed={isSupported}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: isSupported
              ? "linear-gradient(135deg, #d0f5f0 0%, #b2eeea 100%)"
              : "var(--color-surface-container)",
            border: isSupported ? "1.5px solid #4CC9C8" : "1.5px solid transparent",
            borderRadius: 999,
            padding: "7px 15px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: isSupported ? "scale(1.04)" : "scale(1)",
          }}
        >
          <span
            className={`material-symbols-outlined ${isSupported ? "ms-filled pulse-teal" : ""}`}
            style={{ fontSize: 18, color: "#2ab5b3" }}
          >
            support
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isSupported ? "#1a8a88" : "var(--color-text-soft)" }}>
            {isSupported ? "Supporting" : "Support"} · {supportCount}
          </span>
        </button>
      </div>

      {/* ── Comments panel (expandable) ── */}
      {showComments && (
        <CommentsPanel postId={post.id} onCountChange={setCommentCount} />
      )}
    </article>
  );
}
