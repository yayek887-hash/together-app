import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGroups, joinGroup, leaveGroup, sendJoinRequest, fetchNearbyGroups } from "../lib/api.js";

const CATEGORIES = ["All","Friendship","School","Anxiety","Gaming","Art","Sports","Study","Mental Health","Music","Books","LGBTQ+","Other"];
const CATEGORY_EMOJI = { Friendship:"🤝",School:"📚",Anxiety:"💜",Gaming:"🎮",Art:"🎨",Sports:"⚽",Study:"📖","Mental Health":"🌱",Music:"🎵",Books:"📕","LGBTQ+":"🌈",Other:"✨" };

function GroupCard({ group, isMember, isOwner, onJoin, onView, busy }) {
  const cat   = CATEGORY_EMOJI[group.category] || "✨";
  const count = group.group_members?.length || 0;
  const isPrivate = group.privacy === "private";

  return (
    <div onClick={onView} style={{ background: "#fff", borderRadius: 22, boxShadow: "0 2px 12px rgba(91,60,221,0.07)", marginBottom: 14, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ height: 64, background: group.color || "var(--color-primary)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.12)" }} />
        <div style={{ position: "absolute", top: 10, left: 14, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
          {cat} {group.category}{isPrivate ? " · 🔒" : ""}
        </div>
        {group.city && (
          <div style={{ position: "absolute", top: 10, right: 14, fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
            📍 {group.city}
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 3 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginBottom: 6 }}>{count} {count === 1 ? "member" : "members"}{group.min_age ? ` · Ages ${group.min_age}–${group.max_age}` : ""}</div>
            {group.description && (
              <div style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {group.description}
              </div>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onJoin(); }}
            disabled={busy}
            style={{ flexShrink: 0, background: isMember ? "var(--color-primary-fixed)" : "var(--color-primary)", color: isMember ? "var(--color-primary)" : "#fff", border: isMember ? "1.5px solid var(--color-primary)" : "none", borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", transition: "all 0.15s", opacity: busy ? 0.6 : 1 }}>
            {isOwner ? "Owner" : isMember ? "Joined ✓" : isPrivate ? "Request 🔒" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupportGroupsPage() {
  const [query, setQuery]           = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [groups, setGroups]         = useState([]);
  const [nearby, setNearby]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busyId, setBusyId]         = useState(null);
  const { user, profile }           = useAuth();
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
      if (isJoined(group)) { await leaveGroup(group.id, user.id); }
      else if (group.privacy === "private") { await sendJoinRequest(group.id, user.id); }
      else { await joinGroup(group.id, user.id); }
      await load();
    } catch {}
    finally { setBusyId(null); }
  };

  const filtered = groups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === "All" || g.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>
      <TopBar title="Communities" />

      {/* Create banner */}
      <div style={{ padding: "0 16px 16px" }}>
        <div onClick={() => navigate("/create-group")}
          style={{ background: "linear-gradient(135deg, #5b3cdd 0%, #7c5ce9 100%)", borderRadius: 20, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>add</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Create your own community 🌱</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Build a safe space for people like you</div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "rgba(255,255,255,0.7)", marginLeft: "auto" }}>arrow_forward</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "0 16px 12px", position: "relative" }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-text-soft)" }}>search</span>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search communities…"
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 14px 9px 38px", borderRadius: 999, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none" }}
          onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
          onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px", overflowX: "auto" }} className="scrollbar-none">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveFilter(c)}
            style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, whiteSpace: "nowrap", border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif", background: activeFilter === c ? "var(--color-primary)" : "#fff", color: activeFilter === c ? "#fff" : "var(--color-text-soft)", boxShadow: "0 2px 6px rgba(108,99,255,0.06)" }}>
            {c === "All" ? "All" : `${CATEGORY_EMOJI[c]} ${c}`}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {/* Nearby groups */}
        {!loading && nearby.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
              📍 Near you
            </div>
            {nearby.slice(0, 3).map(g => (
              <GroupCard key={g.id} group={g} isMember={isJoined(g)} isOwner={isOwner(g)}
                onJoin={() => handleJoin(g)} onView={() => navigate(`/groups/${g.id}`)} busy={busyId === g.id} />
            ))}
            <div style={{ borderTop: "1.5px solid var(--color-outline-variant)", margin: "8px 0 18px" }} />
          </>
        )}

        {/* All groups */}
        {!loading && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
              🫂 All communities
            </div>
            {filtered.map(g => (
              <GroupCard key={g.id} group={g} isMember={isJoined(g)} isOwner={isOwner(g)}
                onJoin={() => handleJoin(g)} onView={() => navigate(`/groups/${g.id}`)} busy={busyId === g.id} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
                <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.7 }}>
                  No communities match your search.<br />
                  <span onClick={() => navigate("/create-group")} style={{ color: "var(--color-primary)", fontWeight: 700, cursor: "pointer" }}>Create one! →</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
