import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "../components/MoodSelector.jsx";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchFeed, fetchGroups, joinGroup, leaveGroup } from "../lib/api.js";

const DAILY_QUOTES = [
  { text: "You belong here, exactly as you are.", sub: "This community is glad you showed up today 💜" },
  { text: "Every kind word you share makes someone's day better.", sub: "Your words have more power than you think 🌟" },
  { text: "You are braver than you believe.", sub: "Asking for support takes real courage 🦋" },
  { text: "Small steps still move you forward.", sub: "Progress doesn't have to be perfect 🌱" },
  { text: "Today is a new beginning.", sub: "Whatever happened yesterday — today is yours ☀️" },
  { text: "Your feelings are always valid.", sub: "You don't need to explain why you feel the way you do 💙" },
  { text: "Be the kindness you wish to see.", sub: "One kind message can change someone's whole day 🤝" },
  { text: "You are never truly alone.", sub: "There are people here who understand 🫂" },
  { text: "One day at a time.", sub: "You don't have to figure everything out right now 🌈" },
  { text: "Your voice matters here.", sub: "What you share helps others feel less alone 🕊️" },
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

/* ── Hero welcome section ─────────────────────── */
function HeroWelcome({ name, hour, onReport, onHelp }) {
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const subtext = hour < 12
    ? "Starting the day here is always a good idea 🌤️"
    : hour < 17
    ? "How are you doing right now? You can always share here 💜"
    : "Evenings can be hard. You're not alone in this 🌙";

  return (
    <div style={{ position: "relative", padding: "18px 20px 22px", overflow: "hidden" }}>
      {/* Soft background blobs */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(91,60,221,0.07)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -10, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(91,60,221,0.05)", zIndex: 0 }} />

      {/* Top row: logo + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1, marginBottom: 18 }}>
        <span className="logo-gradient" style={{ fontSize: 22 }}>together</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onHelp} aria-label="Help" className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-primary)" }}>help</span>
          </button>
          <button onClick={onReport} aria-label="Report" className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "var(--color-error)" }}>flag</span>
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 4 }}>
          {greeting}, <strong style={{ color: "var(--color-primary)" }}>{name}</strong> 👋
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", lineHeight: 1.25, marginBottom: 8 }}>
          This is a safe place<br />where you belong. 💜
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.55 }}>
          {subtext}
        </div>
      </div>
    </div>
  );
}

/* ── Today's Thought (hero card) ──────────────── */
function TodaysThought() {
  const quote = getDailyQuote();
  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{
        background: "linear-gradient(135deg, #5b3cdd 0%, #7c5ce9 60%, #9b7ff4 100%)",
        borderRadius: 24,
        padding: "22px 20px 20px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blob */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
          ✦ Today's thought
        </div>

        {/* Big decorative quote mark */}
        <div style={{ fontSize: 56, lineHeight: 0.7, color: "rgba(255,255,255,0.2)", fontFamily: "Georgia, serif", marginBottom: 8, userSelect: "none" }}>"</div>

        <p style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1.4, position: "relative" }}>
          {quote.text}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, position: "relative" }}>
          {quote.sub}
        </p>
      </div>
    </div>
  );
}

/* ── Community Today ──────────────────────────── */
function CommunityToday({ posts, groups }) {
  const totalSupports = posts.reduce((sum, p) => sum + (p.post_supports?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const totalMembers  = groups.reduce((sum, g) => sum + (g.group_members?.length || 0), 0);

  const items = [
    { emoji: "🤝", value: totalSupports, label: "people supported" },
    { emoji: "💬", value: totalComments, label: "kind messages"    },
    { emoji: "🌱", value: totalMembers,  label: "community members" },
  ];

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
        🌟 Together today
      </div>
      <div style={{
        background: "linear-gradient(135deg, #f7f1ff 0%, #fff 100%)",
        borderRadius: 20,
        padding: "16px 18px",
        border: "1.5px solid rgba(91,60,221,0.08)",
        display: "flex",
        justifyContent: "space-around",
      }}>
        {items.map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-soft)", marginTop: 3, lineHeight: 1.3 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Write a Post banner ──────────────────────── */
function WritePostBanner({ onWrite }) {
  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div
        onClick={onWrite}
        style={{
          background: "linear-gradient(135deg, #f0ebff 0%, #e8f4ff 100%)",
          borderRadius: 20,
          padding: "18px 20px",
          border: "2px dashed rgba(91,60,221,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 14,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(91,60,221,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, #e8e0ff 0%, #ddf0ff 100%)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(91,60,221,0.2)"; e.currentTarget.style.background = "linear-gradient(135deg, #f0ebff 0%, #e8f4ff 100%)"; }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          background: "var(--color-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 4px 14px rgba(91,60,221,0.3)",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>edit</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)", marginBottom: 3 }}>
            Something on your mind? 💜
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)", lineHeight: 1.4 }}>
            Share how you're feeling — someone here will understand.
          </div>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)", flexShrink: 0 }}>arrow_forward</span>
      </div>
    </div>
  );
}

/* ── Wellness tip card ────────────────────────── */
function WellnessTip() {
  const tip = getWeeklyTip();
  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
        🌿 This week's self-care tip
      </div>
      <div style={{
        background: "linear-gradient(135deg, #d4f5f0 0%, #e8faf7 100%)",
        borderRadius: 20, padding: "16px 18px",
        display: "flex", gap: 14, alignItems: "flex-start",
        border: "1.5px solid #b2eeea",
      }}>
        <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{tip.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a8a88", marginBottom: 5 }}>{tip.title}</div>
          <div style={{ fontSize: 13, color: "#2d7a78", lineHeight: 1.6 }}>{tip.tip}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Support groups preview ───────────────────── */
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
    } finally { setBusy(null); }
  };

  if (!groups.length) return null;
  const preview = groups.slice(0, 3);

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.04em" }}>
          🫂 Support communities
        </div>
        <button onClick={() => navigate("/groups")} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
          See all →
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {preview.map((g) => {
          const isMember = g.group_members?.some((m) => m.user_id === currentUserId);
          const count = g.group_members?.length || 0;
          return (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 18, padding: "12px 14px", boxShadow: "0 2px 10px rgba(91,60,221,0.06)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: g.color || "var(--color-primary-fixed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "var(--color-primary)", flexShrink: 0 }}>
                {g.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>{count} {count === 1 ? "member" : "members"}</div>
              </div>
              <button onClick={() => handleToggle(g)} disabled={busy === g.id} style={{ flexShrink: 0, background: isMember ? "var(--color-primary-fixed)" : "var(--color-primary)", color: isMember ? "var(--color-primary)" : "#fff", border: isMember ? "1.5px solid var(--color-primary)" : "none", borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", transition: "all 0.15s" }}>
                {isMember ? "Joined ✓" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────── */
export default function HomePage() {
  const [mood, setMood]       = useState(null);
  const [posts, setPosts]     = useState([]);
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
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

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Hero welcome ──────────────────────────── */}
      <HeroWelcome
        name={displayName}
        hour={hour}
        onReport={() => navigate("/report")}
        onHelp={() => navigate("/help-center")}
      />

      {/* ── Today's thought (hero card) ───────────── */}
      <TodaysThought />

      {/* ── Mood check-in ─────────────────────────── */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
          🎨 How are you feeling right now?
        </div>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      {/* ── Write a post ──────────────────────────── */}
      <WritePostBanner onWrite={() => navigate("/new-post")} />

      {/* ── Community today ───────────────────────── */}
      {!loading && <CommunityToday posts={posts} groups={groups} />}

      {/* ── Support communities ───────────────────── */}
      {!loading && <GroupsPreview groups={groups} currentUserId={user?.id} onJoined={load} />}

      {/* ── Wellness tip ──────────────────────────── */}
      <WellnessTip />

      {/* ── Feed ─────────────────────────────────── */}
      <div style={{ padding: "24px 16px 8px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.04em" }}>
          💜 What your community shared
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 13, marginTop: 14 }}>Loading your community…</p>
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
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌱</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.7 }}>
              No posts yet —<br />be the first to share something.
            </p>
            <button onClick={() => navigate("/new-post")} className="btn btn-primary" style={{ marginTop: 20, width: "auto", padding: "0 28px" }}>
              Share something 💜
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
