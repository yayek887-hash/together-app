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
  const cat   = CATEGORY_EMOJI[group.category] || "✨";
  const count = group.group_members?.length || 0;
  const isPrivate = group.privacy === "private";
  const accent = CATEGORY_COLOR[group.category] || group.color || "var(--color-primary)";

  return (
    <div
      onClick={onView}
      style={{
        background: "#fff", borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        marginBottom: 12, overflow: "hidden", cursor: "pointer",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: `${accent}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>
            {cat}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2 }}>{group.name}</div>
              {isPrivate && <span style={{ fontSize: 11 }}>🔒</span>}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: accent, marginBottom: 5 }}>
              {group.category}{group.min_age ? ` · Ages ${group.min_age}–${group.max_age}` : ""}{group.city ? ` · 📍 ${group.city}` : ""}
            </div>
            {group.description && (
              <div style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {group.description}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500 }}>
            {count} {count === 1 ? "member" : "members"}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onJoin(); }}
            disabled={busy || isOwner}
            style={{
              background: isOwner
                ? "var(--color-surface-low)"
                : isMember
                  ? "var(--color-primary-fixed)"
                  : "var(--color-primary)",
              color: isOwner
                ? "var(--color-text-soft)"
                : isMember
                  ? "var(--color-primary)"
                  : "#fff",
              border: isMember && !isOwner ? "1.5px solid var(--color-primary)" : "none",
              borderRadius: 12, padding: "9px 20px",
              fontSize: 12, fontWeight: 700,
              cursor: isOwner || busy ? "default" : "pointer",
              fontFamily: "Rubik, sans-serif",
              transition: "all 0.15s", opacity: busy ? 0.6 : 1,
              boxShadow: (!isMember && !isOwner) ? "0 4px 12px rgba(91,60,221,0.28)" : "none",
            }}
          >
            {isOwner ? "Owner 👑" : isMember ? "Joined ✓" : isPrivate ? "Request 🔒" : "Join"}
          </button>
        </div>
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
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveFilter(c)}
              style={{
                padding: "8px 14px", borderRadius: 12, fontSize: 13, whiteSpace: "nowrap",
                border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", fontWeight: 700,
                background: activeFilter === c ? "var(--color-primary)" : "#fff",
                color: activeFilter === c ? "#fff" : "var(--color-text)",
                boxShadow: activeFilter === c ? "0 4px 12px rgba(91,60,221,0.3)" : "0 1px 3px rgba(0,0,0,0.08)",
                transition: "all 0.15s",
              }}
            >
              {c === "All" ? "All" : `${CATEGORY_EMOJI[c]} ${c}`}
            </button>
          ))}
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

        {/* ── My spaces ── */}
        {!loading && myGroups.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>My spaces</div>
              <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
            </div>
            {myGroups.map(g => (
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
