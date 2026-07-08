import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";
import { fetchFeed, updateInterests } from "../lib/api.js";
import { INTERESTS, getDailyCard } from "../data/inspireContent.js";

/* ── Interest onboarding ─────────────────────────── */
function InterestOnboarding({ onDone }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving]     = useState(false);
  const { user } = useAuth();

  const toggle = (key) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (selected.length < 3) return;
    setSaving(true);
    await updateInterests(user.id, selected).catch(() => {});
    onDone(selected);
  };

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <div style={{ padding: "40px 20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🌟</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", marginBottom: 10 }}>
          What inspires you?
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.65 }}>
          Pick at least 3 topics and we'll personalize<br />your feed around what matters to you.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 20px 28px", justifyContent: "center" }}>
        {INTERESTS.map(i => {
          const active = selected.includes(i.key);
          return (
            <button
              key={i.key}
              onClick={() => toggle(i.key)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                background: active ? i.color : "#fff",
                color: active ? "#fff" : "var(--color-text)",
                boxShadow: active ? `0 4px 14px ${i.color}44` : "0 2px 8px rgba(0,0,0,0.06)",
                transform: active ? "scale(1.04)" : "scale(1)",
                transition: "all 0.15s",
              }}
            >
              <span>{i.emoji}</span>
              {i.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "0 20px 40px" }}>
        <button
          onClick={handleSave}
          disabled={selected.length < 3 || saving}
          style={{
            width: "100%", padding: "16px", borderRadius: 999,
            background: selected.length >= 3 ? "var(--color-primary)" : "var(--color-surface-high)",
            color: selected.length >= 3 ? "#fff" : "var(--color-text-soft)",
            border: "none", fontSize: 16, fontWeight: 700, cursor: selected.length >= 3 ? "pointer" : "default",
            fontFamily: "Rubik, sans-serif", transition: "all 0.2s",
            boxShadow: selected.length >= 3 ? "var(--shadow-button)" : "none",
          }}
        >
          {saving ? "Saving…" : "Let's go 🚀"}
        </button>
      </div>
    </div>
  );
}

/* ── Daily inspire card ──────────────────────────── */
function InspireCard({ topic, featured }) {
  const interest = INTERESTS.find(i => i.key === topic);
  const card = getDailyCard(topic);
  if (!interest || !card) return null;

  if (card.type === "challenge") {
    return (
      <div style={{
        background: interest.color,
        borderRadius: 22,
        padding: featured ? "26px 22px" : "18px 18px",
        marginBottom: 12,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          {interest.emoji} {interest.label} · Today's challenge
        </div>
        <div style={{ fontSize: featured ? 24 : 18, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.02em" }}>
          {card.title}
        </div>
        {featured && (
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.65 }}>
            {card.text}
          </p>
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.14)", borderRadius: 20, padding: "7px 13px" }}>
          <span style={{ fontSize: 16 }}>{card.emoji}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>Try it today</span>
        </div>
      </div>
    );
  }

  if (card.type === "quote") {
    return (
      <div style={{
        background: interest.bg,
        borderRadius: 22,
        padding: featured ? "26px 22px" : "18px 18px",
        marginBottom: 12,
        position: "relative", overflow: "hidden",
        border: `1px solid ${interest.color}22`,
      }}>
        <div style={{
          position: "absolute", right: 10, top: -16,
          fontSize: featured ? 130 : 90, fontWeight: 900, color: interest.color,
          opacity: 0.08, lineHeight: 1, userSelect: "none",
          fontFamily: "Georgia, 'Times New Roman', serif",
          pointerEvents: "none",
        }}>
          "
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: interest.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          {interest.emoji} {interest.label}
        </div>
        <p style={{
          margin: "0 0 14px", fontSize: featured ? 18 : 15, fontWeight: 700,
          color: "var(--color-text)", lineHeight: 1.45,
          letterSpacing: "-0.01em", fontStyle: "italic",
        }}>
          "{card.text}"
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 3, background: interest.color, borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: interest.color, fontWeight: 700 }}>{card.title}</span>
        </div>
      </div>
    );
  }

  // Tip
  return (
    <div style={{
      background: "#fff",
      borderRadius: 22,
      padding: featured ? "20px 18px" : "14px 16px",
      marginBottom: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.06)",
      display: "flex", alignItems: "flex-start", gap: 14,
      borderLeft: `4px solid ${interest.color}`,
    }}>
      <div style={{
        width: featured ? 52 : 40, height: featured ? 52 : 40,
        borderRadius: 14, flexShrink: 0,
        background: interest.bg, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: featured ? 26 : 20,
      }}>
        {card.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: interest.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          {interest.label} · Quick tip
        </div>
        <div style={{ fontSize: featured ? 15 : 13, fontWeight: 800, color: "var(--color-text)", marginBottom: featured ? 6 : 0, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {card.title}
        </div>
        {featured && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.65 }}>
            {card.text}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Compose card ────────────────────────────────── */
function ComposeCard({ userName, avatarUrl, onWrite }) {
  return (
    <div
      onClick={onWrite}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff", borderRadius: 20,
        padding: "10px 12px", marginBottom: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",
        cursor: "pointer",
      }}
    >
      <UserAvatar name={userName} size={36} avatarUrl={avatarUrl || undefined} />
      <div style={{
        flex: 1, background: "var(--color-surface-low)", borderRadius: 999,
        padding: "9px 14px", fontSize: 14, color: "var(--color-text-soft)",
      }}>
        What's on your heart today?
      </div>
      <div style={{
        width: 34, height: 34, borderRadius: 12, flexShrink: 0,
        background: "var(--color-primary-fixed)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: "var(--color-primary)" }}>add_photo_alternate</span>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { totalNotifCount, unreadCount } = useNotifications();

  const [interests, setInterests] = useState(() => profile?.interests || []);
  const [activeTopic, setActiveTopic]   = useState("all");
  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const topic = activeTopic === "all" ? null : activeTopic;
      setPosts(await fetchFeed(topic));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [activeTopic]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (profile?.interests?.length) setInterests(profile.interests);
  }, [profile]);

  const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const myInterests = INTERESTS.filter(i => interests.includes(i.key));
  const featuredTopic = activeTopic === "all" ? interests[0] : activeTopic;

  if (!interests.length) {
    return <InterestOnboarding onDone={(selected) => setInterests(selected)} />;
  }

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: "20px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 3 }}>
            {greeting}, <strong style={{ color: "var(--color-primary)" }}>{displayName}</strong>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            What inspires<br />you today?
          </div>
        </div>

        {/* Top-right action icons */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => navigate("/connect", { state: { tab: "messages" } })}
            className="icon-btn"
            aria-label="Messages"
            style={{ position: "relative" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>chat_bubble</span>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 3, right: 3,
                width: 8, height: 8, borderRadius: "50%",
                background: "#e84545", border: "1.5px solid #fff",
              }} />
            )}
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="icon-btn"
            aria-label="Notifications"
            style={{ position: "relative" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>notifications</span>
            {totalNotifCount > 0 && (
              <span style={{
                position: "absolute", top: 3, right: 3,
                width: 8, height: 8, borderRadius: "50%",
                background: "#e84545", border: "1.5px solid #fff",
              }} />
            )}
          </button>
        </div>
      </div>

      {/* ── Category chips (horizontal scroll) ── */}
      <div style={{ display: "flex", gap: 6, padding: "6px 18px 14px", overflowX: "auto" }} className="scrollbar-none">
        <button
          onClick={() => setActiveTopic("all")}
          style={{
            padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
            background: activeTopic === "all" ? "var(--color-primary)" : "rgba(0,0,0,0.06)",
            color: activeTopic === "all" ? "#fff" : "var(--color-text-soft)",
            transition: "all 0.15s",
          }}
        >
          ✨ For you
        </button>
        {myInterests.map(i => (
          <button
            key={i.key}
            onClick={() => setActiveTopic(i.key)}
            style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
              background: activeTopic === i.key ? i.color : "rgba(0,0,0,0.06)",
              color: activeTopic === i.key ? "#fff" : "var(--color-text-soft)",
              transition: "all 0.15s",
            }}
          >
            {i.emoji} {i.label}
          </button>
        ))}
        <button
          onClick={() => setInterests([])}
          style={{
            padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
            background: "transparent", color: "var(--color-text-soft)",
          }}
        >
          Edit ✏️
        </button>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ── Featured inspire card ── */}
        {featuredTopic && <InspireCard topic={featuredTopic} featured />}

        {/* ── Compose card ── */}
        <ComposeCard
          userName={displayName}
          avatarUrl={profile?.avatar_url}
          onWrite={() => navigate("/new-post")}
        />

        {/* ── Community divider ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            💜 Community
          </span>
          <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 14, color: "var(--color-error)", marginBottom: 10 }}>{error}</p>
            <button onClick={load} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              Try again ↻
            </button>
          </div>
        )}
        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.7 }}>
              No posts yet in this topic.<br />Be the first to share something!
            </p>
          </div>
        )}
        {!loading && posts.map(p => (
          <PostCard key={p.id} post={p} currentUserId={user?.id} onChanged={load} />
        ))}

      </div>
    </div>
  );
}
