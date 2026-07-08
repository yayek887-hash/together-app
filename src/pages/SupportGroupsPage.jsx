import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGroups, joinGroup, leaveGroup, sendJoinRequest, fetchNearbyGroups } from "../lib/api.js";

const CATEGORIES = ["All","Friendship","School","Anxiety","Gaming","Art","Sports","Study","Mental Health","Music","Books","LGBTQ+","Other"];
const CATEGORY_EMOJI = {
  Friendship:"🤝", School:"📚", Anxiety:"💜", Gaming:"🎮", Art:"🎨",
  Sports:"⚽", Study:"📖", "Mental Health":"🌱", Music:"🎵",
  Books:"📕", "LGBTQ+":"🌈", Other:"✨",
};
const CATEGORY_COLOR = {
  Friendship:"#f59e0b", School:"#3b82f6", Anxiety:"#8b5cf6", Gaming:"#10b981",
  Art:"#ec4899", Sports:"#f97316", Study:"#06b6d4", "Mental Health":"#5b3cdd",
  Music:"#a855f7", Books:"#84cc16", "LGBTQ+":"#ef4444", Other:"#6b7280",
};

function GroupCard({ group, isMember, isOwner, onJoin, onView, busy }) {
  const cat       = CATEGORY_EMOJI[group.category] || "✨";
  const count     = group.group_members?.length || 0;
  const isPrivate = group.privacy === "private";
  const accent    = CATEGORY_COLOR[group.category] || group.color || "#5b3cdd";

  return (
    <div onClick={onView} style={{
      background: "#fff", borderRadius: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      marginBottom: 12, overflow: "hidden", cursor: "pointer",
      border: `1.5px solid ${accent}18`,
    }}>
      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}66)` }} />

      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}22, ${accent}11)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, border: `1px solid ${accent}22`,
          }}>
            {cat}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)", lineHeight: 1.2 }}>{group.name}</div>
              {isPrivate && <span style={{ fontSize: 10, background: `${accent}18`, color: accent, borderRadius: 999, padding: "1px 6px", fontWeight: 700 }}>🔒 Private</span>}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{group.category}</span>
              {group.city && <span style={{ color: "var(--color-text-soft)", fontWeight: 500 }}>📍 {group.city}</span>}
              {group.min_age && <span style={{ color: "var(--color-text-soft)", fontWeight: 500 }}>Ages {group.min_age}–{group.max_age}</span>}
            </div>
            {group.description && (
              <div style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {group.description}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-soft)", fontWeight: 600 }}>
            <span style={{ background: `${accent}14`, color: accent, borderRadius: 999, padding: "3px 10px", fontWeight: 700 }}>
              👥 {count} {count === 1 ? "member" : "members"}
            </span>
            {group.meeting_schedule && (
              <span style={{ fontSize: 11, color: "var(--color-text-soft)" }}>· {group.meeting_schedule}</span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onJoin(); }}
            disabled={busy || isOwner}
            style={{
              background: isOwner ? "var(--color-surface-low)" : isMember ? `${accent}18` : accent,
              color: isOwner ? "var(--color-text-soft)" : isMember ? accent : "#fff",
              border: isMember && !isOwner ? `1.5px solid ${accent}` : "none",
              borderRadius: 12, padding: "8px 18px",
              fontSize: 12, fontWeight: 700,
              cursor: isOwner || busy ? "default" : "pointer",
              fontFamily: "Rubik, sans-serif",
              transition: "all 0.15s", opacity: busy ? 0.6 : 1,
              boxShadow: (!isMember && !isOwner) ? `0 4px 12px ${accent}44` : "none",
            }}
          >
            {isOwner ? "Owner 👑" : isMember ? "Joined ✓" : isPrivate ? "Request 🔒" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── My space mini card (carousel) ─────────────────── */
function MySpaceCard({ group, onView }) {
  const cat    = CATEGORY_EMOJI[group.category] || "✨";
  const accent = CATEGORY_COLOR[group.category] || "#5b3cdd";
  const count  = group.group_members?.length || 0;

  return (
    <div onClick={onView} style={{
      flexShrink: 0, width: 160,
      background: "#fff", borderRadius: 20, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      border: `1.5px solid ${accent}22`,
      cursor: "pointer",
    }}>
      <div style={{
        height: 64,
        background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 30,
      }}>
        {cat}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text)", marginBottom: 4, lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {group.name}
        </div>
        <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginBottom: 6 }}>{group.category}</div>
        <div style={{ fontSize: 11, color: "var(--color-text-soft)" }}>👥 {count} members</div>
      </div>
    </div>
  );
}

export default function SupportGroupsPage() {
  const [query, setQuery]               = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [groups, setGroups]             = useState([]);
  const [nearby, setNearby]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busyId, setBusyId]             = useState(null);
  const { user, profile }               = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchGroups();
      setGroups(all);
      if (profile?.city || profile?.region) {
        const near = await fetchNearbyGroups(profile.city, profile.region);
        setNearby(near.filter(g => g.id !== undefined));
      }
    } catch {}
    finally { setLoading(false); }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const isJoined = g => (g.group_members || []).some(m => m.user_id === user?.id);
  const isOwner  = g => g.owner_id === user?.id;

  const handleJoin = async (group) => {
    if (!user || busyId) return;
    setBusyId(group.id);
    try {
      if (isJoined(group))           { await leaveGroup(group.id, user.id); }
      else if (group.privacy === "private") { await sendJoinRequest(group.id, user.id); }
      else                           { await joinGroup(group.id, user.id); }
      await load();
    } catch {}
    finally { setBusyId(null); }
  };

  const myGroups   = groups.filter(g => isJoined(g) || isOwner(g));
  const myGroupIds = new Set(myGroups.map(g => g.id));
  const filtered   = groups.filter(g => {
    if (myGroupIds.has(g.id)) return false;
    const matchSearch = g.name.toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === "All" || g.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: "22px 18px 16px" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 5 }}>
          Support · 💜
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 6 }}>
          Find your<br />people
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
          Safe spaces for every kind of teen.
        </div>
      </div>

      {/* ── Create community CTA ── */}
      <div style={{ padding: "0 18px 18px" }}>
        <div
          onClick={() => navigate("/create-group")}
          style={{
            background: "#1a1523",
            borderRadius: 22, padding: "18px 18px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: -20, top: -20, width: 110, height: 110, borderRadius: "50%", background: "rgba(91,60,221,0.25)", pointerEvents: "none" }} />
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(91,60,221,0.4)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>add</span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3, letterSpacing: "-0.01em" }}>Start your own community</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Build a safe space for people like you</div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.35)", flexShrink: 0, position: "relative" }}>arrow_forward</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: "0 18px 12px", position: "relative" }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: 32, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-text-soft)" }}>search</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search communities…"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px 10px 40px",
            borderRadius: 14,
            border: "1.5px solid var(--color-outline-variant)",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
          onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
        />
      </div>

      {/* ── Category chips ── */}
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8, padding: "0 0 0 18px", overflowX: "auto" }} className="scrollbar-none">
          {CATEGORIES.map(c => {
            const active = activeFilter === c;
            const color  = CATEGORY_COLOR[c] || "#5b3cdd";
            return (
              <button
                key={c}
                onClick={() => setActiveFilter(c)}
                style={{
                  padding: "8px 14px", borderRadius: 12, fontSize: 13, whiteSpace: "nowrap",
                  border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", fontWeight: 700,
                  background: active ? (c === "All" ? "var(--color-primary)" : color) : "#fff",
                  color: active ? "#fff" : "var(--color-text)",
                  boxShadow: active ? `0 4px 12px ${color}44` : "0 1px 3px rgba(0,0,0,0.08)",
                  transition: "all 0.15s",
                }}
              >
                {c === "All" ? "🌍 All" : `${CATEGORY_EMOJI[c]} ${c}`}
              </button>
            );
          })}
          <div style={{ flexShrink: 0, width: 18 }} />
        </div>
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
          background: "linear-gradient(to right, transparent, var(--color-bg))",
          pointerEvents: "none",
        }} />
      </div>

      <div style={{ padding: "0 18px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {/* ── My spaces carousel ── */}
        {!loading && myGroups.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.07em", textTransform: "uppercase" }}>💜 My spaces</div>
              <span style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 600 }}>{myGroups.length} joined</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollSnapType: "x mandatory" }} className="scrollbar-none">
                {myGroups.map(g => (
                  <div key={g.id} style={{ scrollSnapAlign: "start" }}>
                    <MySpaceCard group={g} onView={() => navigate(`/groups/${g.id}`)} />
                  </div>
                ))}
                <div style={{ flexShrink: 0, width: 4 }} />
              </div>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(to left, var(--color-bg), transparent)", pointerEvents: "none" }} />
            </div>
          </div>
        )}

        {/* ── Nearby ── */}
        {!loading && nearby.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Near you</div>
              <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
            </div>
            {nearby.slice(0, 3).map(g => (
              <GroupCard key={g.id} group={g}
                isMember={isJoined(g)} isOwner={isOwner(g)}
                onJoin={() => handleJoin(g)}
                onView={() => navigate(`/groups/${g.id}`)}
                busy={busyId === g.id}
              />
            ))}
            <div style={{ height: 6 }} />
          </>
        )}

        {/* ── All communities ── */}
        {!loading && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>All communities</div>
              <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
            </div>
            {filtered.map(g => (
              <GroupCard key={g.id} group={g}
                isMember={isJoined(g)} isOwner={isOwner(g)}
                onJoin={() => handleJoin(g)}
                onView={() => navigate(`/groups/${g.id}`)}
                busy={busyId === g.id}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
                <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  No communities match your search.<br />
                  <span
                    onClick={() => navigate("/create-group")}
                    style={{ color: "var(--color-primary)", fontWeight: 700, cursor: "pointer" }}
                  >
                    Create one →
                  </span>
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
