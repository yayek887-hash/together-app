import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "../components/MoodSelector.jsx";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchFeed, fetchGroups, joinGroup, leaveGroup } from "../lib/api.js";

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

const WELLNESS_TIPS = [
  { icon: "🌬️", title: "Breathe it out", tip: "Take 3 slow, deep breaths when you feel overwhelmed. It really works." },
  { icon: "📓", title: "Write it down", tip: "Journaling for just 5 minutes can help you process big feelings." },
  { icon: "🚶", title: "Move your body", tip: "A short walk — even around the room — can shift your mood." },
  { icon: "💧", title: "Stay hydrated", tip: "Drinking water is a small act of self-care that adds up." },
  { icon: "🤗", title: "Reach out", tip: "Telling one person how you feel can make a big difference." },
  { icon: "🌙", title: "Rest matters", tip: "Good sleep is one of the best things you can do for your emotions." },
  { icon: "🎵", title: "Music helps", tip: "Put on a song that matches your mood, then slowly shift to something uplifting." },
];

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

function getWeeklyTip() {
  const week = Math.floor(Date.now() / (86400000 * 7));
  return WELLNESS_TIPS[week % WELLNESS_TIPS.length];
}

/* ── Community Stats strip ────────────────────── */
function CommunityStats({ posts, groups }) {
  const totalSupports = posts.reduce((sum, p) => sum + (p.post_supports?.length || 0), 0);
  const totalMembers  = groups.reduce((sum, g) => sum + (g.group_members?.length || 0), 0);

  const stats = [
    { icon: "edit_note",     value: posts.length,   label: "posts shared"  },
    { icon: "volunteer_activism", value: totalSupports, label: "supports given" },
    { icon: "group",         value: totalMembers,   label: "members"       },
  ];

  return (
    <div style={{ display: "flex", gap: 10, padding: "14px 16px 0", overflowX: "auto" }} className="scrollbar-none">
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            borderRadius: 16,
            padding: "10px 16px",
            boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
            minWidth: 130,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-soft)", marginTop: 2 }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Wellness tip card ────────────────────────── */
function WellnessTip() {
  const tip = getWeeklyTip();
  return (
    <div style={{ padding: "14px 16px 0" }}>
      <span className="section-label">Wellness tip</span>
      <div
        style={{
          marginTop: 10,
          background: "linear-gradient(135deg, #d4f5f0 0%, #e8faf7 100%)",
          borderRadius: 18,
          padding: "14px 16px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          border: "1.5px solid #b2eeea",
        }}
      >
        <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{tip.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a8a88", marginBottom: 4 }}>{tip.title}</div>
          <div style={{ fontSize: 13, color: "#2d7a78", lineHeight: 1.55 }}>{tip.tip}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Active Groups preview ────────────────────── */
function GroupsPreview({ groups, currentUserId, onJoined }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);

  const handleToggle = async (g) => {
    if (!currentUserId || busy) return;
    const isMember = g.group_members?.some((m) => m.user_id === currentUserId);
    setBusy(g.id);
    try {
      if (isMember) await leaveGroup(g.id, currentUserId);
      else          await joinGroup(g.id, currentUserId);
      onJoined?.();
    } finally {
      setBusy(null);
    }
  };

  if (!groups.length) return null;
  const preview = groups.slice(0, 3);

  return (
    <div style={{ padding: "14px 16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="section-label" style={{ marginBottom: 0 }}>Active groups</span>
        <button
          onClick={() => navigate("/groups")}
          style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}
        >
          See all →
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {preview.map((g) => {
          const isMember = g.group_members?.some((m) => m.user_id === currentUserId);
          const count = g.group_members?.length || 0;
          return (
            <div
              key={g.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fff",
                borderRadius: 18,
                padding: "12px 14px",
                boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: g.color || "var(--color-primary-fixed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  flexShrink: 0,
                }}
              >
                {g.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {g.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>
                  {count} {count === 1 ? "member" : "members"}
                </div>
              </div>
              <button
                onClick={() => handleToggle(g)}
                disabled={busy === g.id}
                style={{
                  flexShrink: 0,
                  background: isMember ? "var(--color-primary-fixed)" : "var(--color-primary)",
                  color: isMember ? "var(--color-primary)" : "#fff",
                  border: isMember ? "1.5px solid var(--color-primary)" : "none",
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Rubik, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {isMember ? "Joined ✓" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
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

      {/* ── Community stats ───────────────────────── */}
      {!loading && <CommunityStats posts={posts} groups={groups} />}

      {/* ── Mood selector (Pinterest chips) ──────── */}
      <div style={{ padding: "16px 16px 0" }}>
        <span className="section-label">How are you feeling?</span>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      {/* ── Active groups preview ─────────────────── */}
      {!loading && (
        <GroupsPreview groups={groups} currentUserId={user?.id} onJoined={load} />
      )}

      {/* ── Wellness tip ──────────────────────────── */}
      <WellnessTip />

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
