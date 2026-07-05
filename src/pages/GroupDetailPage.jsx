import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGroup, joinGroup, leaveGroup, sendJoinRequest, fetchMyJoinRequest, fetchJoinRequests, approveJoinRequest, declineJoinRequest, removeGroupMember } from "../lib/api.js";

const CATEGORY_EMOJI = {
  Friendship: "🤝", School: "📚", Anxiety: "💜", Gaming: "🎮", Art: "🎨",
  Sports: "⚽", Study: "📖", "Mental Health": "🌱", Music: "🎵", Books: "📕", "LGBTQ+": "🌈", Other: "✨",
};

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup]         = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [joinReqs, setJoinReqs]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState(false);
  const [showRules, setShowRules] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, req] = await Promise.all([
        fetchGroup(groupId),
        user ? fetchMyJoinRequest(groupId, user.id) : null,
      ]);
      setGroup(g);
      setMyRequest(req);
      if (user && g.owner_id === user.id) {
        const reqs = await fetchJoinRequests(groupId);
        setJoinReqs(reqs);
      }
    } catch {}
    finally { setLoading(false); }
  }, [groupId, user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="" showBack />
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    </div>
  );

  if (!group) return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="Not found" showBack />
      <p style={{ textAlign: "center", color: "var(--color-text-soft)", padding: 40 }}>This community doesn't exist.</p>
    </div>
  );

  const members   = group.group_members || [];
  const isMember  = members.some(m => m.user_id === user?.id);
  const isOwner   = user?.id === group.owner_id;
  const catEmoji  = CATEGORY_EMOJI[group.category] || "✨";

  const handleJoin = async () => {
    if (busy || !user) return;
    setBusy(true);
    try {
      if (isMember) {
        await leaveGroup(group.id, user.id);
      } else if (group.privacy === "private") {
        await sendJoinRequest(group.id, user.id);
        setMyRequest({ status: "pending" });
      } else {
        await joinGroup(group.id, user.id);
      }
      await load();
    } catch {}
    finally { setBusy(false); }
  };

  const handleApprove = async (req) => {
    setBusy(req.id);
    try { await approveJoinRequest(req.id, group.id, req.user_id); await load(); }
    catch {} finally { setBusy(false); }
  };

  const handleDecline = async (req) => {
    setBusy(req.id);
    try { await declineJoinRequest(req.id); await load(); }
    catch {} finally { setBusy(false); }
  };

  const handleRemoveMember = async (memberId) => {
    setBusy(memberId);
    try { await removeGroupMember(group.id, memberId); await load(); }
    catch {} finally { setBusy(false); }
  };

  const joinLabel = () => {
    if (isOwner) return null;
    if (isMember) return { label: "Leave community", variant: "outline" };
    if (myRequest?.status === "pending") return { label: "Request sent ⏳", variant: "outline", disabled: true };
    if (group.privacy === "private") return { label: "Request to join 🔒", variant: "primary" };
    return { label: "Join community 🌱", variant: "primary" };
  };
  const btnInfo = joinLabel();

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>
      <TopBar title="" showBack>
        {isOwner && (
          <button onClick={() => navigate(`/groups/${groupId}/manage`)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 10, color: "var(--color-primary)", fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif" }}>
            Manage ⚙️
          </button>
        )}
      </TopBar>

      {/* Hero banner */}
      <div style={{ background: group.color || "var(--color-primary)", height: 120, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
        <div style={{ position: "absolute", bottom: 16, left: 18, right: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {catEmoji} {group.category} · {group.privacy === "private" ? "🔒 Private" : "🌍 Public"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{group.name}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[
            { value: members.length, label: members.length === 1 ? "member" : "members" },
            { value: `${group.min_age || 10}–${group.max_age || 18}`, label: "age range" },
            ...(group.city ? [{ value: group.city, label: group.region || "city" }] : []),
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--color-surface-low)", borderRadius: 14, padding: "10px 14px", textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-soft)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {group.description && (
          <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.65, marginBottom: 16 }}>{group.description}</p>
        )}

        {/* Rules */}
        {group.rules && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowRules(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 700, color: "var(--color-primary)", fontFamily: "Rubik, sans-serif" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>shield</span>
              Community rules {showRules ? "▲" : "▼"}
            </button>
            {showRules && (
              <div style={{ marginTop: 10, background: "var(--color-surface-low)", borderRadius: 14, padding: "12px 14px", fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {group.rules}
              </div>
            )}
          </div>
        )}

        {/* Join button */}
        {btnInfo && (
          <div style={{ marginBottom: 20 }}>
            <PrimaryButton variant={btnInfo.variant} disabled={btnInfo.disabled || busy} onClick={handleJoin}>
              {btnInfo.label}
            </PrimaryButton>
          </div>
        )}

        {/* Owner: pending join requests */}
        {isOwner && joinReqs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
              📬 Join requests ({joinReqs.length})
            </div>
            {joinReqs.map(req => (
              <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e8f4ff 100%)", borderRadius: 18, padding: "12px 14px", marginBottom: 10, border: "1.5px solid var(--color-primary)" }}>
                <UserAvatar name={req.profiles?.username || "?"} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{req.profiles?.username || "Someone"}</div>
                  {req.message && <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 2 }}>{req.message}</div>}
                </div>
                <button onClick={() => handleApprove(req)} disabled={busy === req.id}
                  style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                  Accept
                </button>
                <button onClick={() => handleDecline(req)} disabled={busy === req.id}
                  style={{ background: "none", color: "var(--color-text-soft)", border: "1.5px solid var(--color-outline-variant)", borderRadius: 999, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                  Decline
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Members list */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 12, letterSpacing: "0.04em" }}>
          🫂 Members
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {members.map(m => {
            const profile = m.profiles || {};
            const name = profile.username || "Member";
            const isThisOwner = profile.id === group.owner_id;
            return (
              <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: "10px 14px", boxShadow: "0 2px 8px rgba(91,60,221,0.06)" }}>
                <UserAvatar name={name} size={38} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{name}</span>
                  {isThisOwner && <span style={{ marginLeft: 8, fontSize: 11, background: "var(--color-primary-fixed)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>Owner</span>}
                </div>
                {isOwner && !isThisOwner && (
                  <button onClick={() => handleRemoveMember(profile.id)} disabled={busy === profile.id}
                    style={{ background: "none", border: "1.5px solid var(--color-outline-variant)", borderRadius: 999, padding: "5px 11px", fontSize: 11, color: "var(--color-text-soft)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <p style={{ color: "var(--color-text-soft)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No members yet — be the first to join!</p>
          )}
        </div>
      </div>
    </div>
  );
}
