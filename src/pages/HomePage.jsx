import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "../components/MoodSelector.jsx";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchFeed, fetchGroups } from "../lib/api.js";

const DAILY_QUOTES = [
  "You belong here 💜",
  "Every kind word matters 🌟",
  "You are braver than you believe 🦋",
  "Small steps still move you forward 🌱",
  "Today is a new beginning ☀️",
  "Your feelings are always valid 💙",
  "Be the kindness you wish to see 🤝",
  "You are never truly alone 🫂",
  "One day at a time 🌈",
  "Your voice matters 🕊️",
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

/* ── Stories / groups bar ─────────────────────── */
function StoriesBar({ groups, onNewPost, onGroupClick }) {
  return (
    <div className="stories-bar">
      {/* New post circle */}
      <div className="story-item" onClick={onNewPost}>
        <div className="story-new">
          <span className="material-symbols-outlined story-new-icon" style={{ fontSize: 28, color: "var(--color-primary)" }}>
            add
          </span>
        </div>
        <span className="story-item-label">Your post</span>
      </div>

      {/* Group circles */}
      {groups.map((g) => (
        <div key={g.id} className="story-item" onClick={onGroupClick}>
          <div className="story-ring">
            <div className="story-ring-inner" style={{ background: g.color || "var(--color-primary-fixed)" }}>
              {g.name.charAt(0)}
            </div>
          </div>
          <span className="story-item-label">{g.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [mood, setMood]     = useState(null);
  const [posts, setPosts]   = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feed, groupList] = await Promise.all([fetchFeed(), fetchGroups()]);
      setPosts(feed);
      setGroups(groupList);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayName = profile?.username || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Hey" : "Evening";

  return (
    <div className="page-scroll scrollbar-none anim-in">

      {/* ── Top bar (Instagram-style) ─────────────── */}
      <div
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "14px 20px 12px",
          borderBottom: "1px solid rgba(91,60,221,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span className="logo-gradient">together</span>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 1 }}>
            {greeting}, {displayName} 👋
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate("/report")} aria-label="Report" className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-error)" }}>flag</span>
          </button>
          <button onClick={() => navigate("/help-center")} aria-label="Help" className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-primary)" }}>help</span>
          </button>
        </div>
      </div>

      {/* ── Daily encouragement ───────────────────── */}
      <div style={{ padding: "14px 16px 0" }}>
        <div className="encourage-card">
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)" }}>
            Today's thought
          </span>
          <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 500, color: "var(--color-text)", lineHeight: 1.5 }}>
            {getDailyQuote()}
          </p>
        </div>
      </div>

      {/* ── Stories bar (Instagram groups) ───────── */}
      <div style={{ padding: "16px 0 0" }}>
        <StoriesBar
          groups={groups}
          onNewPost={() => navigate("/new-post")}
          onGroupClick={() => navigate("/groups")}
        />
      </div>

      {/* ── Mood selector (Pinterest chips) ──────── */}
      <div style={{ padding: "16px 16px 0" }}>
        <span className="section-label">How are you feeling?</span>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      {/* ── Feed ─────────────────────────────────── */}
      <div style={{ padding: "22px 16px 8px" }}>
        <span className="section-label">Your feed</span>
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 13, marginTop: 14 }}>Loading your feed…</p>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-error)" }}>
            <p style={{ fontSize: 14 }}>{error}</p>
            <button
              onClick={load}
              style={{ marginTop: 10, background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
            >
              Try again ↻
            </button>
          </div>
        )}
        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>💜</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.6 }}>
              No posts yet —<br />be the first to share something!
            </p>
            <button
              onClick={() => navigate("/new-post")}
              className="btn btn-primary"
              style={{ marginTop: 20, width: "auto", padding: "0 28px" }}
            >
              Write a post ✨
            </button>
          </div>
        )}
        {!loading && posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={user?.id} onChanged={load} />
        ))}
      </div>

    </div>
  );
}
