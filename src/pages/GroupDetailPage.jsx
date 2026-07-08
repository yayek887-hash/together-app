import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchGroup, joinGroup, leaveGroup, sendJoinRequest,
  fetchMyJoinRequest, fetchJoinRequests, approveJoinRequest,
  declineJoinRequest, removeGroupMember, updateGroup,
  fetchGroupMessages, sendGroupMessage, subscribeToGroupMessages,
} from "../lib/api.js";

const CATEGORY_EMOJI = {
  Friendship: "🤝", School: "📚", Anxiety: "💜", Gaming: "🎮", Art: "🎨",
  Sports: "⚽", Study: "📖", "Mental Health": "🌱", Music: "🎵",
  Books: "📕", "LGBTQ+": "🌈", Other: "✨",
};

function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (d < 1) return "now";
  if (d < 60) return `${d}m`;
  if (d < 1440) return `${Math.floor(d / 60)}h`;
  return `${Math.floor(d / 1440)}d`;
}

/* ── Group Chat ─────────────────────────────────── */
function GroupChat({ group, user, profile, isMember }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!isMember) return;
    fetchGroupMessages(group.id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
    const unsub = subscribeToGroupMessages(group.id, (msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });
    return unsub;
  }, [group.id, isMember]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText("");
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, sender_id: user.id, text: trimmed,
      created_at: new Date().toISOString(),
      sender: { id: user.id, username: "You" },
    }]);
    try {
      const sent = await sendGroupMessage(group.id, user.id, trimmed);
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  if (!isMember) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>Join to chat</div>
        <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
          Become a member to send and read messages in this group.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 4px" }} className="scrollbar-none">
        {loading && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
              No messages yet.<br />Be the first to say something!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.sender_id === user.id;
          const name = mine ? "You" : (msg.sender?.username || "?");
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
              {!mine && (
                <UserAvatar name={name} size={28} avatarUrl={msg.sender?.avatar_url || undefined} />
              )}
              <div style={{ maxWidth: "72%" }}>
                {!mine && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", marginBottom: 3, paddingLeft: 2 }}>
                    {name}
                  </div>
                )}
                <div style={{
                  padding: "9px 13px",
                  borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: mine ? "var(--color-primary)" : "#fff",
                  color: mine ? "#fff" : "var(--color-text)",
                  fontSize: 14, lineHeight: 1.5,
                  boxShadow: mine ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: "var(--color-text-soft)", marginTop: 3, textAlign: mine ? "right" : "left", paddingLeft: 2 }}>
                  {timeAgo(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 10, padding: "10px 14px 16px",
        background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}>
        <UserAvatar name={profile?.display_name || profile?.username || "Me"} size={34} avatarUrl={profile?.avatar_url || undefined} />
        <div style={{ flex: 1, display: "flex", gap: 8, background: "var(--color-surface-low)", borderRadius: 999, padding: "4px 6px 4px 14px", alignItems: "center" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Say something…"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, fontFamily: "Rubik, sans-serif", color: "var(--color-text)" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: text.trim() ? "var(--color-primary)" : "var(--color-surface-high)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: text.trim() ? "pointer" : "default", flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: text.trim() ? "#fff" : "var(--color-text-soft)" }}>send</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const { user, profile } = useAuth();

  const [group,     setGroup]    = useState(null);
  const [myRequest, setMyRequest]= useState(null);
  const [joinReqs,  setJoinReqs] = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [busy,      setBusy]     = useState(false);
  const [showRules, setShowRules]= useState(false);
  const [tab,       setTab]      = useState("chat");

  // Banner inline edit
  const [editingBanner, setEditingBanner] = useState(false);
  const [editName,      setEditName]      = useState("");
  const [editLocation,  setEditLocation]  = useState("");
  const [editSchedule,  setEditSchedule]  = useState("");
  const [savingBanner,  setSavingBanner]  = useState(false);

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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 80px)" }}>
      <TopBar title="" showBack />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    </div>
  );

  if (!group) return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 80px)" }}>
      <TopBar title="Not found" showBack />
      <p style={{ textAlign: "center", color: "var(--color-text-soft)", padding: 40 }}>This community doesn't exist.</p>
    </div>
  );

  const members  = group.group_members || [];
  const isMember = members.some(m => m.user_id === user?.id);
  const isOwner  = user?.id === group.owner_id;
  const catEmoji = CATEGORY_EMOJI[group.category] || "✨";

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

  const openBannerEdit = () => {
    setEditName(group.name || "");
    setEditLocation(group.meeting_location || "");
    setEditSchedule(group.meeting_schedule || "");
    setEditingBanner(true);
  };

  const saveBanner = async () => {
    setSavingBanner(true);
    try {
      await updateGroup(group.id, {
        name: editName.trim() || group.name,
        meeting_location: editLocation.trim() || null,
        meeting_schedule: editSchedule.trim() || null,
      });
      setGroup(g => ({ ...g, name: editName.trim() || g.name, meeting_location: editLocation.trim() || null, meeting_schedule: editSchedule.trim() || null }));
      setEditingBanner(false);
    } catch {}
    finally { setSavingBanner(false); }
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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 80px)", overflow: "hidden", background: "var(--color-bg)" }}>

      {/* ── Top bar ── */}
      <div style={{ flexShrink: 0 }}>
        <TopBar title="" showBack>
          {isOwner && (
            <button onClick={() => navigate(`/groups/${groupId}/manage`)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 10, color: "var(--color-primary)", fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif" }}>
              Manage ⚙️
            </button>
          )}
        </TopBar>

        {/* ── Banner ── */}
        <div style={{ background: group.color || "var(--color-primary)", position: "relative", padding: "14px 18px 14px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {catEmoji} {group.category} · {group.privacy === "private" ? "🔒 Private" : "🌍 Public"} · {members.length} members
              </div>
              {isOwner && !editingBanner && (
                <button onClick={openBannerEdit} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#fff" }}>edit</span>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: "Rubik, sans-serif" }}>Edit</span>
                </button>
              )}
            </div>

            {editingBanner ? (
              /* ── Edit mode ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Community name"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "Rubik, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
                <input
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  placeholder="📍 Meeting location (e.g. Central Park)"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
                <input
                  value={editSchedule}
                  onChange={e => setEditSchedule(e.target.value)}
                  placeholder="🕐 Schedule (e.g. Every Friday 6pm)"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button onClick={saveBanner} disabled={savingBanner} style={{ background: "#fff", color: group.color || "var(--color-primary)", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Rubik, sans-serif", opacity: savingBanner ? 0.7 : 1 }}>
                    {savingBanner ? "Saving…" : "Save ✓"}
                  </button>
                  <button onClick={() => setEditingBanner(false)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 8 }}>{group.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {group.meeting_location ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>location_on</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>{group.meeting_location}</span>
                    </div>
                  ) : isOwner && (
                    <button onClick={openBannerEdit} style={{ background: "rgba(255,255,255,0.15)", border: "1px dashed rgba(255,255,255,0.5)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                      + Add meeting location
                    </button>
                  )}
                  {group.meeting_schedule ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>schedule</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>{group.meeting_schedule}</span>
                    </div>
                  ) : isOwner && (
                    <button onClick={openBannerEdit} style={{ background: "rgba(255,255,255,0.15)", border: "1px dashed rgba(255,255,255,0.5)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                      + Add schedule
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {[
            { id: "chat", icon: "chat_bubble", label: "Group Chat" },
            { id: "info", icon: "info",        label: "Info & Members" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "12px 0", border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "var(--color-primary)" : "var(--color-text-soft)",
              borderBottom: tab === t.id ? "2.5px solid var(--color-primary)" : "2.5px solid transparent",
              transition: "color 0.15s",
            }}>
              <span className={`material-symbols-outlined ${tab === t.id ? "ms-filled" : ""}`} style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat tab ── */}
      {tab === "chat" && (
        <GroupChat group={group} user={user} profile={profile} isMember={isMember} />
      )}

      {/* ── Info tab ── */}
      {tab === "info" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }} className="scrollbar-none">

          {/* Description */}
          {group.description && (
            <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.7, marginBottom: 16 }}>{group.description}</p>
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

          {/* Join requests (owner) */}
          {isOwner && joinReqs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                📬 Join requests ({joinReqs.length})
              </div>
              {joinReqs.map(req => (
                <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e8f4ff 100%)", borderRadius: 18, padding: "12px 14px", marginBottom: 10, border: "1.5px solid var(--color-primary)" }}>
                  <UserAvatar name={req.profiles?.username || "?"} size={40} avatarUrl={req.profiles?.avatar_url || undefined} />
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

          {/* Members */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            🫂 Members · {members.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map(m => {
              const p = m.profiles || {};
              const name = p.username || "Member";
              const isThisOwner = p.id === group.owner_id;
              return (
                <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <UserAvatar name={name} size={38} avatarUrl={p.avatar_url || undefined} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{name}</span>
                    {isThisOwner && <span style={{ marginLeft: 8, fontSize: 10, background: "var(--color-primary-fixed)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>Owner</span>}
                  </div>
                  {isOwner && !isThisOwner && (
                    <button onClick={() => handleRemoveMember(p.id)} disabled={busy === p.id}
                      style={{ background: "none", border: "1.5px solid var(--color-outline-variant)", borderRadius: 999, padding: "5px 11px", fontSize: 11, color: "var(--color-text-soft)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
            {members.length === 0 && (
              <p style={{ color: "var(--color-text-soft)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No members yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
