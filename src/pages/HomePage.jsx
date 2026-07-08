import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
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
      <div style={{ padding: "32px 20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🌟</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", marginBottom: 10 }}>
          What inspires you?
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
          Pick at least 3 topics and we'll personalize your feed around what matters to you.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 16px 24px", justifyContent: "center" }}>
        {INTERESTS.map(i => {
          const active = selected.includes(i.key);
          return (
            <button
              key={i.key}
              onClick={() => toggle(i.key)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                background: active ? i.color : "#fff",
                color: active ? "#fff" : "var(--color-text)",
                boxShadow: active
                  ? `0 4px 14px ${i.color}44`
                  : "0 2px 8px rgba(0,0,0,0.06)",
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

      <div style={{ padding: "0 16px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginBottom: 16 }}>
          {selected.length < 3
            ? `Pick ${3 - selected.length} more to continue`
            : `${selected.length} selected — ready to go!`}
        </div>
        <button
          onClick={handleSave}
          disabled={selected.length < 3 || saving}
          style={{
            background: selected.length >= 3 ? "var(--color-primary)" : "var(--color-surface-high)",
            color: selected.length >= 3 ? "#fff" : "var(--color-text-soft)",
            border: "none", borderRadius: 999, padding: "14px 40px",
            fontSize: 15, fontWeight: 700, cursor: selected.length >= 3 ? "pointer" : "default",
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
function InspireCard({ topic }) {
  const interest = INTERESTS.find(i => i.key === topic);
  const card = getDailyCard(topic);
  if (!interest || !card) return null;

  // Bold solid poster — feels like a challenge notice on a corkboard
  if (card.type === "challenge") {
    return (
      <div style={{
        background: interest.color,
        borderRadius: 22, padding: "22px 20px", marginBottom: 14,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 50, bottom: -50, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          {interest.emoji} {interest.label} · Today's challenge
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.02em" }}>
          {card.title}
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 1.65 }}>
          {card.text}
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "8px 14px" }}>
          <span style={{ fontSize: 18 }}>{card.emoji}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>Try it today</span>
        </div>
      </div>
    );
  }

  // Editorial quote — magazine pull-quote feel
  if (card.type === "quote") {
    return (
      <div style={{
        background: interest.bg,
        borderRadius: 22, padding: "24px 20px", marginBottom: 14,
        position: "relative", overflow: "hidden",
        border: `1px solid ${interest.color}22`,
      }}>
        <div style={{
          position: "absolute", right: 10, top: -16,
          fontSize: 130, fontWeight: 900, color: interest.color,
          opacity: 0.08, lineHeight: 1, userSelect: "none",
          fontFamily: "Georgia, 'Times New Roman', serif",
          pointerEvents: "none",
        }}>
          "
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: interest.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
          {interest.emoji} {interest.label}
        </div>
        <p style={{
          margin: "0 0 18px", fontSize: 18, fontWeight: 700,
          color: "var(--color-text)", lineHeight: 1.45,
          letterSpacing: "-0.01em", fontStyle: "italic",
        }}>
          "{card.text}"
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 3, background: interest.color, borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: interest.color, fontWeight: 700 }}>{card.title}</span>
        </div>
      </div>
    );
  }

  // Tip: horizontal layout, icon block on left, left accent border
  return (
    <div style={{
      background: "#fff",
      borderRadius: 22, padding: "18px 18px", marginBottom: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.07)",
      display: "flex", alignItems: "flex-start", gap: 14,
      borderLeft: `4px solid ${interest.color}`,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
        background: interest.bg, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26,
      }}>
        {card.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: interest.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          {interest.label} · Quick tip
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)", marginBottom: 6, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {card.title}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.65 }}>
          {card.text}
        </p>
      </div>
    </div>
  );
}

/* ── Write post banner ───────────────────────────── */
function WritePostBanner({ onWrite }) {
  return (
    <div
      onClick={onWrite}
      style={{
        background: "#1a1523",
        borderRadius: 22, padding: "18px 18px",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
        marginBottom: 14, position: "relative", overflow: "hidden",
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ position: "absolute", right: -20, top: -20, width: 110, height: 110, borderRadius: "50%", background: "rgba(91,60,221,0.25)", pointerEvents: "none" }} />
      <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(91,60,221,0.4)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>edit</span>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3, letterSpacing: "-0.01em" }}>Share something today</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Your words might be exactly what someone needs</div>
      </div>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.35)", flexShrink: 0, position: "relative" }}>arrow_forward</span>
    </div>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { totalNotifCount } = useNotifications();

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

  // Sync when profile loads (async)
  useEffect(() => {
    if (profile?.interests?.length) setInterests(profile.interests);
  }, [profile]);

  const displayName = profile?.username || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Active interests to show (chips + cards)
  const myInterests = INTERESTS.filter(i => interests.includes(i.key));
  const cardTopics  = activeTopic === "all" ? interests.slice(0, 2) : [activeTopic];

  /* No interests yet → onboarding */
  if (!interests.length) {
    return <InterestOnboarding onDone={(selected) => setInterests(selected)} />;
  }

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: "22px 18px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 5 }}>
            {greeting}, <strong style={{ color: "var(--color-primary)" }}>{displayName}</strong> 👋
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            What inspires<br />you today?
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, paddingTop: 2 }}>
          <button onClick={() => navigate("/notifications")} className="icon-btn" aria-label="Notifications" style={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-primary)" }}>notifications</span>
            {totalNotifCount > 0 && (
              <span style={{
                position: "absolute", top: 3, right: 3,
                width: 8, height: 8, borderRadius: "50%",
                background: "#e84545", border: "1.5px solid var(--color-bg)",
              }} />
            )}
          </button>
          <button onClick={() => navigate("/help-center")} className="icon-btn" aria-label="Help">
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-primary)" }}>help</span>
          </button>
          <button onClick={() => navigate("/report")} className="icon-btn" aria-label="Report">
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-error)" }}>flag</span>
          </button>
        </div>
      </div>

      {/* ── Category chips ── */}
      <div style={{ display: "flex", gap: 8, padding: "0 18px 16px", overflowX: "auto" }} className="scrollbar-none">
        <button
          onClick={() => setActiveTopic("all")}
          style={{
            padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
            background: activeTopic === "all" ? "var(--color-primary)" : "#fff",
            color: activeTopic === "all" ? "#fff" : "var(--color-text)",
            boxShadow: activeTopic === "all" ? "0 4px 12px rgba(91,60,221,0.3)" : "0 1px 3px rgba(0,0,0,0.08)",
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
              padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
              background: activeTopic === i.key ? i.color : "#fff",
              color: activeTopic === i.key ? "#fff" : "var(--color-text)",
              boxShadow: activeTopic === i.key ? `0 4px 12px ${i.color}44` : "0 1px 3px rgba(0,0,0,0.08)",
              transition: "all 0.15s",
            }}
          >
            {i.emoji} {i.label}
          </button>
        ))}
        <button
          onClick={() => setInterests([])}
          style={{ padding: "8px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", background: "transparent", color: "var(--color-text-soft)" }}
        >
          Edit ✏️
        </button>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ── Inspire cards ── */}
        {cardTopics.map(t => <InspireCard key={t} topic={t} />)}

        {/* ── Write post ── */}
        <WritePostBanner onWrite={() => navigate("/new-post")} />

        {/* ── Community posts ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            💜 Community
          </div>
          <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-error)" }}>
            <p style={{ fontSize: 14 }}>{error}</p>
            <button onClick={load} style={{ marginTop: 10, background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
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
