import { useState } from "react";
import UserAvatar from "./UserAvatar.jsx";
import { toggleLike, toggleSupport } from "../lib/api.js";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function PostCard({ post, currentUserId, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState(false);

  const displayName = post.is_anonymous ? "Anonymous" : post.author?.username || "Someone";
  const isSupported = (post.post_supports || []).some((s) => s.user_id === currentUserId);
  const likeCount = (post.post_likes || []).length + (liked ? 1 : 0);
  const supportCount = (post.post_supports || []).length;
  const commentCount = (post.comments || []).length;

  const handleLike = async () => {
    if (busy || !currentUserId) return;
    setLiked((v) => !v);
    setBusy(true);
    try {
      await toggleLike(post.id, currentUserId, liked);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  const handleSupport = async () => {
    if (busy || !currentUserId) return;
    setBusy(true);
    try {
      await toggleSupport(post.id, currentUserId, isSupported);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className="card"
      style={{ marginBottom: 16 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <UserAvatar name={displayName} size={46} />
        <div style={{ flex: 1 }}>
          <div className="t-label" style={{ fontWeight: 700, color: "var(--color-text)" }}>{displayName}</div>
          <div className="t-label-sm" style={{ color: "var(--color-text-soft)", marginTop: 1 }}>
            {timeAgo(post.created_at)}
            {post.mood && <span style={{ marginLeft: 6 }}>{post.mood}</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <p className="t-body-lg" style={{ color: "var(--color-text)", lineHeight: 1.6, marginBottom: 14 }}>
        {post.text}
      </p>

      {post.image_url && (
        <div
          style={{
            height: 160,
            borderRadius: 16,
            backgroundImage: `url(${post.image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginBottom: 14,
          }}
        />
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid var(--color-surface-highest)",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {/* Like */}
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 12,
              transition: "background 0.15s",
            }}
          >
            <span
              className={`material-symbols-outlined ${liked ? "ms-filled" : ""}`}
              style={{
                fontSize: 20,
                color: liked ? "var(--color-primary)" : "var(--color-text-soft)",
                transition: "all 0.2s ease",
                animation: liked ? "pop 0.35s ease" : "none",
              }}
            >
              favorite
            </span>
            <span className="t-label-sm" style={{ color: "var(--color-text-soft)" }}>{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 12,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-text-soft)" }}>
              chat_bubble
            </span>
            <span className="t-label-sm" style={{ color: "var(--color-text-soft)" }}>{commentCount}</span>
          </button>
        </div>

        {/* Support */}
        <button
          onClick={handleSupport}
          aria-pressed={isSupported}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: isSupported ? "var(--color-primary-fixed)" : "var(--color-secondary-fixed)",
            border: "none",
            borderRadius: 999,
            padding: "7px 14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <span
            className={`material-symbols-outlined pulse-teal ${isSupported ? "ms-filled" : ""}`}
            style={{ fontSize: 18, color: "#4CC9C8" }}
          >
            support
          </span>
          <span className="t-label-sm" style={{ fontWeight: 700 }}>
            {isSupported ? "Supporting" : "Support"} · {supportCount}
          </span>
        </button>
      </div>
    </article>
  );
}
