import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "../components/MoodSelector.jsx";
import PostCard from "../components/PostCard.jsx";
import FloatingActionButton from "../components/FloatingActionButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchFeed, fetchGroups } from "../lib/api.js";

export default function HomePage() {
  const [mood, setMood] = useState(null);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(err.message || "Something went wrong loading your feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayName = profile?.username || user?.email?.split("@")[0] || "there";

  return (
    <div className="page-scroll scrollbar-none anim-in">

      {/* ── Header ────────────────────────────────────── */}
      <div
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "18px 20px 12px",
          borderBottom: "1px solid var(--color-surface-highest)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="t-h2" style={{ color: "var(--color-text)" }}>
            Good day, {displayName} 👋
          </div>
          <div className="t-label-sm" style={{ color: "var(--color-text-soft)", marginTop: 2 }}>
            How are you feeling today?
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate("/report")}
            aria-label="Report an issue"
            style={{
              background: "var(--color-surface-high)",
              border: "none",
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-error)" }}>
              flag
            </span>
          </button>
          <button
            onClick={() => navigate("/help-center")}
            aria-label="Help center"
            style={{
              background: "var(--color-surface-high)",
              border: "none",
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>
              help
            </span>
          </button>
        </div>
      </div>

      {/* ── Mood selector ──────────────────────────────── */}
      <div style={{ padding: "16px 20px 0" }}>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      {/* ── Groups strip ───────────────────────────────── */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="t-label" style={{ color: "var(--color-text-soft)", fontWeight: 600 }}>Active groups</span>
          <button
            onClick={() => navigate("/groups")}
            className="t-label"
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            See all
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto" }} className="scrollbar-none">
          {groups.slice(0, 4).map((g) => (
            <div
              key={g.id}
              onClick={() => navigate("/groups")}
              style={{
                minWidth: 120,
                background: g.color || "var(--color-surface-container)",
                borderRadius: 18,
                padding: "12px 14px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <div className="t-label" style={{ fontWeight: 600 }}>{g.name}</div>
              <div className="t-label-sm" style={{ color: "var(--color-text-soft)", marginTop: 3 }}>
                {g.group_members?.length || 0} members
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA banner ─────────────────────────────────── */}
      <div
        style={{
          margin: "20px 20px 0",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
          borderRadius: 24,
          padding: "20px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="t-h3" style={{ color: "#fff", marginBottom: 4 }}>Share your light ✨</div>
          <p className="t-label" style={{ color: "rgba(255,255,255,0.85)", marginBottom: 14 }}>
            Sometimes a simple "hello" can change someone's day.
          </p>
          <button
            onClick={() => navigate("/new-post")}
            style={{
              background: "#fff",
              color: "var(--color-primary)",
              border: "none",
              borderRadius: 999,
              padding: "8px 18px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Write a post
          </button>
        </div>
        <div style={{
          position: "absolute", right: -20, bottom: -20,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
      </div>

      {/* ── Feed ───────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 8px" }}>
        <span className="t-label" style={{ color: "var(--color-text-soft)", fontWeight: 600 }}>Your feed</span>
      </div>
      <div style={{ padding: "0 20px" }}>
        {loading && (
          <p className="t-body" style={{ color: "var(--color-text-soft)", textAlign: "center", marginTop: 24 }}>
            Loading your feed...
          </p>
        )}
        {error && (
          <div style={{ color: "var(--color-error)", textAlign: "center", marginTop: 24 }}>
            <p className="t-body">{error}</p>
            <button
              onClick={load}
              style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", marginTop: 8 }}
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && posts.length === 0 && (
          <p className="t-body" style={{ color: "var(--color-text-soft)", textAlign: "center", marginTop: 24 }}>
            No posts yet — be the first to share something 💜
          </p>
        )}
        {!loading && posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={user?.id} onChanged={load} />
        ))}
      </div>

      <FloatingActionButton onClick={() => navigate("/new-post")} />
    </div>
  );
}
