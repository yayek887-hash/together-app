import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import { QuoteCard, TipCard, ChallengeCard } from "../components/FeedInsertCard.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";
import {
  fetchFeed, updateInterests,
  fetchUpcomingActivities, fetchRecommendedGroups, fetchTrendingPosts,
} from "../lib/api.js";
import { INTERESTS, getDailyCard } from "../data/inspireContent.js";

/* ── Interest onboarding ─────────────────────────── */
function InterestOnboarding({ onDone }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const toggle = (key) => setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const handleSave = async () => {
    if (selected.length < 3) return;
    setSaving(true);
    await updateInterests(user.id, selected).catch(() => {});
    onDone(selected);
  };
  return (
    <div className="page-scroll scrollbar-none anim-in">
      <div style={{ padding: "48px 20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 18 }}>🌟</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", marginBottom: 12 }}>
          What inspires you?
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.7 }}>
          Pick at least 3 topics — we'll personalize<br />your feed around what matters to you.
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 20px 28px", justifyContent: "center" }}>
        {INTERESTS.map(i => {
          const active = selected.includes(i.key);
          return (
            <button key={i.key} onClick={() => toggle(i.key)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
              background: active ? i.color : "#fff", color: active ? "#fff" : "var(--color-text)",
              boxShadow: active ? `0 4px 14px ${i.color}44` : "0 2px 8px rgba(0,0,0,0.06)",
              transform: active ? "scale(1.04)" : "scale(1)", transition: "all 0.15s",
            }}>
              <span>{i.emoji}</span>{i.label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "0 20px 40px" }}>
        <button onClick={handleSave} disabled={selected.length < 3 || saving} style={{
          width: "100%", padding: "16px", borderRadius: 999,
          background: selected.length >= 3 ? "var(--color-primary)" : "var(--color-surface-high)",
          color: selected.length >= 3 ? "#fff" : "var(--color-text-soft)",
          border: "none", fontSize: 16, fontWeight: 700, cursor: selected.length >= 3 ? "pointer" : "default",
          fontFamily: "Rubik, sans-serif", transition: "all 0.2s",
          boxShadow: selected.length >= 3 ? "var(--shadow-button)" : "none",
        }}>
          {saving ? "Saving…" : "Let's go 🚀"}
        </button>
      </div>
    </div>
  );
}

/* ── Daily inspire card ──────────────────────────── */
function InspireCard({ topic, featured, small }) {
  const interest = INTERESTS.find(i => i.key === topic);
  const card = getDailyCard(topic);
  if (!interest || !card) return null;

  if (card.type === "challenge") return (
    <div style={{
      background: interest.color, borderRadius: small ? 18 : 22,
      padding: featured ? "26px 22px" : small ? "14px 14px" : "18px 18px",
      position: "relative", overflow: "hidden", flexShrink: small ? 0 : undefined,
      width: small ? 180 : undefined,
    }}>
      <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
      <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
        {interest.emoji} {interest.label} · Challenge
      </div>
      <div style={{ fontSize: featured ? 22 : small ? 14 : 17, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: small ? 0 : 8, letterSpacing: "-0.02em" }}>
        {card.title}
      </div>
      {featured && <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{card.text}</p>}
      {!small && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", borderRadius: 20, padding: "6px 12px" }}>
          <span style={{ fontSize: 14 }}>{card.emoji}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>Try it today</span>
        </div>
      )}
    </div>
  );

  if (card.type === "quote") return (
    <div style={{
      background: interest.bg, borderRadius: small ? 18 : 22,
      padding: featured ? "26px 22px" : small ? "14px 14px" : "18px 18px",
      border: `1.5px solid ${interest.color}22`,
      position: "relative", overflow: "hidden",
      flexShrink: small ? 0 : undefined, width: small ? 180 : undefined,
    }}>
      <div style={{ position: "absolute", right: 8, top: -14, fontSize: small ? 70 : 110, fontWeight: 900, color: interest.color, opacity: 0.07, lineHeight: 1, userSelect: "none", fontFamily: "Georgia, serif", pointerEvents: "none" }}>"</div>
      <div style={{ fontSize: 9, fontWeight: 800, color: interest.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{interest.emoji} {interest.label}</div>
      <p style={{ margin: "0 0 12px", fontSize: featured ? 17 : small ? 12 : 14, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.45, letterSpacing: "-0.01em", fontStyle: "italic" }}>
        "{small ? card.text.slice(0, 60) + (card.text.length > 60 ? "…" : "") : card.text}"
      </p>
      {!small && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 20, height: 3, background: interest.color, borderRadius: 2 }} />
        <span style={{ fontSize: 11, color: interest.color, fontWeight: 700 }}>{card.title}</span>
      </div>}
    </div>
  );

  return (
    <div style={{
      background: "#fff", borderRadius: small ? 18 : 22,
      padding: featured ? "20px 18px" : small ? "14px 14px" : "14px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.06)",
      display: "flex", alignItems: "flex-start", gap: 12,
      borderLeft: `4px solid ${interest.color}`,
      flexShrink: small ? 0 : undefined, width: small ? 200 : undefined,
    }}>
      <div style={{ width: small ? 36 : 44, height: small ? 36 : 44, borderRadius: 12, flexShrink: 0, background: interest.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: small ? 18 : 22 }}>
        {card.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: interest.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{interest.label}</div>
        <div style={{ fontSize: small ? 12 : featured ? 15 : 13, fontWeight: 800, color: "var(--color-text)", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{card.title}</div>
        {featured && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.6 }}>{card.text}</p>}
      </div>
    </div>
  );
}

/* ── Activity pill (horizontal scroll) ──────────── */
function ActivityPill({ activity, onClick }) {
  const interest = INTERESTS.find(i => i.key === activity.topic);
  const color = interest?.color || "var(--color-primary)";
  const d = new Date(activity.activity_date);
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateLabel = `${days[d.getDay()]} · ${time}`;
  const going = activity.activity_participants?.length || 0;
  return (
    <div onClick={onClick} style={{
      flexShrink: 0, width: 200, borderRadius: 20, overflow: "hidden",
      background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      cursor: "pointer", border: `1.5px solid ${color}18`,
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${color}22`; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 6, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
          {interest?.emoji} {interest?.label || activity.topic}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)", lineHeight: 1.25, marginBottom: 8 }}>
          {activity.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-text-soft)" }}>location_on</span>
          <span style={{ fontSize: 11, color: "var(--color-text-soft)", fontWeight: 500 }}>{activity.location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "var(--color-text-soft)" }}>schedule</span>
          <span style={{ fontSize: 11, color: "var(--color-text-soft)", fontWeight: 500 }}>{dateLabel}</span>
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--color-text-soft)" }}>{going} going</span>
          <div style={{ background: color, color: "#fff", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>Join</div>
        </div>
      </div>
    </div>
  );
}

/* ── Recommended community card ──────────────────── */
function CommunityCard({ group, onClick }) {
  const EMOJI = { Friendship:"🤝", School:"📚", Anxiety:"💜", Gaming:"🎮", Art:"🎨", Sports:"⚽", Study:"📖", "Mental Health":"🌱", Music:"🎵", Books:"📕", "LGBTQ+":"🌈", Other:"✨", General:"✨" };
  const emoji = EMOJI[group.category] || "✨";
  const count = group.group_members?.length || 0;
  const accent = group.color || "var(--color-primary)";
  return (
    <div onClick={onClick} style={{
      flexShrink: 0, width: 168, borderRadius: 20,
      background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      cursor: "pointer", overflow: "hidden", border: `1.5px solid rgba(0,0,0,0.05)`,
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 22px ${accent}22`; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 52, background: `linear-gradient(135deg, ${accent}dd, ${accent}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
        {emoji}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text)", lineHeight: 1.25, marginBottom: 4 }}>{group.name}</div>
        <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
          {group.description || group.category}
        </div>
        <div style={{ fontSize: 10, color: "var(--color-text-soft)", fontWeight: 600 }}>{count} members</div>
      </div>
    </div>
  );
}

/* ── Section header ──────────────────────────────── */
function SectionHeader({ emoji, title, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 2 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 6 }}>
        <span>{emoji}</span> {title}
      </div>
      {action && (
        <button onClick={onAction} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-primary)", fontWeight: 700, fontFamily: "Rubik, sans-serif", padding: 0 }}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ── Mini inspire cards with expand on click ─────── */
function MiniInspireCards({ topics }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ marginBottom: 20 }}>
      {expanded !== null && (
        <div style={{ marginBottom: 12 }}>
          <InspireCard topic={topics[expanded]} featured />
          <button onClick={() => setExpanded(null)} style={{
            marginTop: 8, background: "none", border: "none",
            fontSize: 12, color: "var(--color-text-soft)", cursor: "pointer",
            fontFamily: "Rubik, sans-serif", padding: "4px 0",
          }}>✕ Close</button>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, overflowX: "auto" }} className="scrollbar-none">
        {topics.map((t, i) => (
          <div key={t} onClick={() => setExpanded(expanded === i ? null : i)} style={{ cursor: "pointer" }}>
            <InspireCard topic={t} small />
          </div>
        ))}
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
  const [activeTopic, setActiveTopic] = useState("all");
  const [posts, setPosts]         = useState([]);
  const [trending, setTrending]   = useState([]);
  const [activities, setActivities] = useState([]);
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const topic = activeTopic === "all" ? null : activeTopic;
      const [feedData, trendData, actData, grpData] = await Promise.allSettled([
        fetchFeed(topic),
        activeTopic === "all" ? fetchTrendingPosts(3) : Promise.resolve([]),
        activeTopic === "all" ? fetchUpcomingActivities(4) : Promise.resolve([]),
        activeTopic === "all" ? fetchRecommendedGroups(interests, 4) : Promise.resolve([]),
      ]);
      setPosts(feedData.status === "fulfilled" ? feedData.value : []);
      setTrending(trendData.status === "fulfilled" ? trendData.value : []);
      setActivities(actData.status === "fulfilled" ? actData.value : []);
      setGroups(grpData.status === "fulfilled" ? grpData.value : []);
    } catch {}
    finally { setLoading(false); }
  }, [activeTopic, interests]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (profile?.interests?.length) setInterests(profile.interests); }, [profile]);

  const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const myInterests = INTERESTS.filter(i => interests.includes(i.key));
  const featuredTopic = activeTopic === "all" ? interests[0] : activeTopic;
  const secondaryTopics = activeTopic === "all" ? interests.slice(1, 3) : [];

  // Onboarding handled by ProtectedRoute redirect; just render empty state if no interests yet
  if (!interests.length) return null;

  return (
    <div className="page-scroll scrollbar-none anim-in">

      {/* ── Header ── */}
      <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 3 }}>
            {greeting}, <strong style={{ color: "var(--color-primary)" }}>{displayName}</strong>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            What inspires<br />you today?
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => navigate("/connect", { state: { tab: "messages" } })} className="icon-btn" style={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>chat_bubble</span>
            {unreadCount > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: "var(--color-notification)", border: "1.5px solid var(--color-bg)" }} />}
          </button>
          <button onClick={() => navigate("/notifications")} className="icon-btn" style={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>notifications</span>
            {totalNotifCount > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: "var(--color-notification)", border: "1.5px solid var(--color-bg)" }} />}
          </button>
        </div>
      </div>

      {/* ── Category chips ── */}
      <div style={{ position: "relative", marginBottom: 4 }}>
        <div style={{ display: "flex", gap: 6, padding: "4px 0 10px 16px", overflowX: "auto" }} className="scrollbar-none">
          <button onClick={() => setActiveTopic("all")} style={{
            padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
            background: activeTopic === "all" ? "var(--color-primary)" : "rgba(0,0,0,0.06)",
            color: activeTopic === "all" ? "#fff" : "var(--color-text-soft)", transition: "all 0.15s",
          }}>✨ For you</button>
          {myInterests.map(i => (
            <button key={i.key} onClick={() => setActiveTopic(i.key)} style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
              background: activeTopic === i.key ? i.color : "rgba(0,0,0,0.06)",
              color: activeTopic === i.key ? "#fff" : "var(--color-text-soft)", transition: "all 0.15s",
            }}>{i.emoji} {i.label}</button>
          ))}
          <button onClick={() => navigate("/onboarding")} style={{
            padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
            background: "transparent", color: "var(--color-text-soft)",
          }}>Edit ✏️</button>
          <div style={{ flexShrink: 0, width: 18 }} />
        </div>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 48, background: "linear-gradient(to right, transparent, var(--color-bg))", pointerEvents: "none" }} />
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ── Featured inspire card ── */}
        {featuredTopic && (
          <div style={{ marginBottom: 16 }}>
            <InspireCard topic={featuredTopic} featured />
          </div>
        )}

        {/* ── Mini inspire cards (secondary interests) ── */}
        {secondaryTopics.length > 0 && (
          <MiniInspireCards topics={secondaryTopics} />
        )}

        {/* ── Compose card ── */}
        <div onClick={() => navigate("/new-post")} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#fff", borderRadius: 20, padding: "11px 14px", marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)",
          cursor: "pointer", border: "1.5px solid rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(91,60,221,0.12)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)"}
        >
          <UserAvatar name={displayName} size={36} avatarUrl={profile?.avatar_url || undefined} />
          <div style={{ flex: 1, background: "var(--color-surface-low)", borderRadius: 999, padding: "9px 16px", fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1 }}>
            What's on your heart today?
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(91,60,221,0.3)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#fff" }}>edit</span>
          </div>
        </div>

        {/* ── Upcoming activities ── */}
        {activities.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="📍" title="Happening this week" action="See all" onAction={() => navigate("/meet")} />
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }} className="scrollbar-none">
              {activities.map(a => (
                <ActivityPill key={a.id} activity={a} onClick={() => navigate(`/meet/${a.id}`)} />
              ))}
              <div style={{ flexShrink: 0, width: 4 }} />
            </div>
          </div>
        )}

        {/* ── Recommended communities ── */}
        {groups.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader emoji="💜" title="Communities for you" action="See all" onAction={() => navigate("/groups")} />
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }} className="scrollbar-none">
              {groups.map(g => (
                <CommunityCard key={g.id} group={g} onClick={() => navigate(`/groups/${g.id}`)} />
              ))}
              <div style={{ flexShrink: 0, width: 4 }} />
            </div>
          </div>
        )}

        {/* ── Trending posts ── */}
        {trending.length > 0 && activeTopic === "all" && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader emoji="🔥" title="Trending this week" />
            {trending.map((p, i) => (
              <div key={p.id} style={{ position: "relative" }}>
                {i === 0 && (
                  <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1, background: "var(--accent-meet)", color: "#fff", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 800 }}>
                    🔥 Trending
                  </div>
                )}
                <PostCard post={p} currentUserId={user?.id} onChanged={load} />
              </div>
            ))}
          </div>
        )}

        {/* ── Community divider ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>💜 Community</span>
          <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
        </div>

        {loading && <div style={{ textAlign: "center", padding: "40px 0" }}><div className="loading-dots"><span /><span /><span /></div></div>}

        {!loading && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.7 }}>
              No posts yet in this topic.<br />Be the first to share something!
            </p>
          </div>
        )}

        {!loading && (() => {
          const topic1 = interests[0] || "motivation";
          const topic2 = interests[1] || "wellness";
          const topic3 = interests[2] || "creativity";
          const items = [];
          posts.forEach((p, i) => {
            items.push(
              <PostCard key={p.id} post={p} currentUserId={user?.id} onChanged={load} featured={i === 0 && activeTopic !== "all"} />
            );
            if (activeTopic === "all") {
              if (i === 0 && getDailyCard(topic1))
                items.push(<QuoteCard key="insert-quote" card={getDailyCard(topic1)} topic={topic1} />);
              if (i === 2 && getDailyCard(topic2))
                items.push(<TipCard key="insert-tip" card={getDailyCard(topic2)} topic={topic2} />);
              if (i === 4 && getDailyCard(topic3))
                items.push(<ChallengeCard key="insert-challenge" card={getDailyCard(topic3)} topic={topic3} onDone={() => {}} />);
            }
          });
          return items;
        })()}

      </div>
    </div>
  );
}
