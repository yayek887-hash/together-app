import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import { fetchActivities, joinActivity, leaveActivity, deleteActivity } from "../lib/api.js";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today · ${time}`;
  const tom = new Date(now); tom.setDate(now.getDate() + 1);
  if (d.toDateString() === tom.toDateString()) return `Tomorrow · ${time}`;
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const diff = Math.ceil((d - now) / 86400000);
  if (diff < 7) return `${days[d.getDay()]} · ${time}`;
  return `${months[d.getMonth()]} ${d.getDate()} · ${time}`;
}

function ActivityCard({ activity, userId, onChanged }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const interest = INTERESTS.find(i => i.key === activity.topic);
  const participants = activity.activity_participants || [];
  const isGoing    = participants.some(p => p.user_id === userId);
  const isCreator  = activity.creator?.id === userId;
  const isFull     = activity.max_participants && participants.length >= activity.max_participants;

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (isGoing) await leaveActivity(activity.id, userId);
      else         await joinActivity(activity.id, userId);
      onChanged();
    } catch {}
    finally { setBusy(false); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this activity?")) return;
    setBusy(true);
    try { await deleteActivity(activity.id); onChanged(); }
    catch {} finally { setBusy(false); }
  };

  return (
    <div
      onClick={() => navigate(`/meet/${activity.id}`)}
      style={{
        background: "#fff", borderRadius: 22, marginBottom: 14,
        boxShadow: "0 2px 12px rgba(91,60,221,0.08)",
        overflow: "hidden", cursor: "pointer",
        border: interest ? `1.5px solid ${interest.color}22` : "1.5px solid var(--color-outline-variant)",
      }}
    >
      {/* Color top bar */}
      <div style={{
        height: 5,
        background: interest
          ? `linear-gradient(90deg, ${interest.color} 0%, ${interest.color}88 100%)`
          : "var(--color-primary)",
      }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Topic chip + date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          {interest ? (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px",
              borderRadius: 999, background: interest.bg, color: interest.color,
            }}>
              {interest.emoji} {interest.label}
            </span>
          ) : <span />}
          <span style={{ fontSize: 11, color: "var(--color-text-soft)", fontWeight: 500 }}>
            📅 {formatDate(activity.activity_date)}
          </span>
        </div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text)", marginBottom: 6 }}>
          {activity.title}
        </div>

        {/* Description */}
        {activity.description && (
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginBottom: 8, lineHeight: 1.5 }}>
            {activity.description}
          </div>
        )}

        {/* Location */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--color-primary)" }}>location_on</span>
          <span style={{ fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500 }}>{activity.location}</span>
        </div>

        {/* Footer: creator + participants + button */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserAvatar name={activity.creator?.username || "?"} size={28} avatarUrl={activity.creator?.avatar_url || undefined} />
          <span style={{ fontSize: 12, color: "var(--color-text-soft)", flex: 1 }}>
            {activity.creator?.username || "Someone"}
            {participants.length > 0 && (
              <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                {" "}· {participants.length}{activity.max_participants ? `/${activity.max_participants}` : ""} going
              </span>
            )}
          </span>

          {isCreator ? (
            <button onClick={handleDelete} disabled={busy} style={{
              background: "none", border: "1.5px solid var(--color-outline-variant)",
              borderRadius: 999, padding: "6px 12px", fontSize: 12,
              color: "var(--color-error)", cursor: "pointer", fontFamily: "Rubik, sans-serif",
            }}>
              Cancel
            </button>
          ) : (
            <button onClick={handleJoin} disabled={busy || (isFull && !isGoing)} style={{
              background: isGoing ? "var(--color-surface-high)" : (interest?.color || "var(--color-primary)"),
              color: isGoing ? "var(--color-text-soft)" : "#fff",
              border: "none", borderRadius: 999, padding: "7px 16px",
              fontSize: 12, fontWeight: 700, cursor: busy || (isFull && !isGoing) ? "default" : "pointer",
              fontFamily: "Rubik, sans-serif", opacity: busy ? 0.6 : 1,
              boxShadow: isGoing ? "none" : "0 4px 10px rgba(91,60,221,0.25)",
              transition: "all 0.15s",
            }}>
              {isGoing ? "Going ✓" : isFull ? "Full" : "I'm in 🙋"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MeetPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTopic, setActiveTopic] = useState("all");
  const myInterests = INTERESTS.filter(i => (profile?.interests || []).includes(i.key));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const topic = activeTopic === "all" ? null : activeTopic;
      setActivities(await fetchActivities(topic));
    } catch {}
    finally { setLoading(false); }
  }, [activeTopic]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: "18px 16px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 2 }}>Meet pillar</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)" }}>Meet IRL 📍</div>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginTop: 4, lineHeight: 1.5 }}>
            Real activities, real people, real life.
          </div>
        </div>
        <button
          onClick={() => navigate("/create-activity")}
          style={{
            background: "var(--color-primary)", color: "#fff",
            border: "none", borderRadius: 999, padding: "10px 18px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "Rubik, sans-serif",
            boxShadow: "var(--shadow-button)", display: "flex", alignItems: "center", gap: 6,
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Create
        </button>
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px", overflowX: "auto" }} className="scrollbar-none">
        <button onClick={() => setActiveTopic("all")} style={{
          padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
          border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
          background: activeTopic === "all" ? "var(--color-primary)" : "#fff",
          color: activeTopic === "all" ? "#fff" : "var(--color-text-soft)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          📍 All
        </button>
        {myInterests.map(i => (
          <button key={i.key} onClick={() => setActiveTopic(i.key)} style={{
            padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap",
            background: activeTopic === i.key ? i.color : "#fff",
            color: activeTopic === i.key ? "#fff" : "var(--color-text-soft)",
            boxShadow: activeTopic === i.key ? `0 4px 12px ${i.color}44` : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.15s",
          }}>
            {i.emoji} {i.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📍</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>
              No activities yet
            </div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Be the first to create something!<br />Invite people to meet in real life.
            </p>
            <button
              onClick={() => navigate("/create-activity")}
              style={{
                background: "var(--color-primary)", color: "#fff",
                border: "none", borderRadius: 999, padding: "13px 28px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "Rubik, sans-serif", boxShadow: "var(--shadow-button)",
              }}
            >
              Create first activity 🚀
            </button>
          </div>
        )}

        {!loading && activities.map(a => (
          <ActivityCard key={a.id} activity={a} userId={user?.id} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
