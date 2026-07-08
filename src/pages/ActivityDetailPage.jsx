import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import {
  fetchActivity, joinActivity, leaveActivity, deleteActivity,
  fetchActivityMessages, sendActivityMessage, subscribeToActivityMessages,
} from "../lib/api.js";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} · ${time}`;
}

function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (d < 1) return "now";
  if (d < 60) return `${d}m`;
  if (d < 1440) return `${Math.floor(d / 60)}h`;
  return `${Math.floor(d / 1440)}d`;
}

export default function ActivityDetailPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(true);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [tab, setTab]           = useState("chat");
  const endRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setActivity(await fetchActivity(activityId)); }
    catch {} finally { setLoading(false); }
  }, [activityId]);

  useEffect(() => { load(); }, [load]);

  const participants = activity?.activity_participants || [];
  const isGoing     = participants.some(p => p.user_id === user?.id);
  const isCreator   = activity?.creator?.id === user?.id;
  const canChat     = isGoing || isCreator;
  const interest    = INTERESTS.find(i => i.key === activity?.topic);

  useEffect(() => {
    if (!canChat || !activityId) return;
    setMsgLoading(true);
    fetchActivityMessages(activityId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setMsgLoading(false));
    const unsub = subscribeToActivityMessages(activityId, (msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });
    return unsub;
  }, [activityId, canChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = async () => {
    if (busy || !user) return;
    setBusy(true);
    try {
      if (isGoing) await leaveActivity(activityId, user.id);
      else         await joinActivity(activityId, user.id);
      await load();
    } catch {} finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Cancel this activity?")) return;
    setBusy(true);
    try { await deleteActivity(activityId); navigate("/meet"); }
    catch {} finally { setBusy(false); }
  };

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
      const sent = await sendActivityMessage(activityId, user.id, trimmed);
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setText(trimmed);
    } finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 80px)" }}>
      <TopBar title="" showBack />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    </div>
  );

  if (!activity) return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 80px)" }}>
      <TopBar title="Not found" showBack />
      <p style={{ textAlign: "center", color: "var(--color-text-soft)", padding: 40 }}>Activity not found.</p>
    </div>
  );

  const accentColor = interest?.color || "var(--color-primary)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 80px)", overflow: "hidden", background: "var(--color-bg)" }}>

      {/* Top bar */}
      <div style={{ flexShrink: 0 }}>
        <TopBar title="" showBack />

        {/* Banner */}
        <div style={{ background: accentColor, padding: "14px 18px 16px", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
          <div style={{ position: "relative" }}>
            {interest && (
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                {interest.emoji} {interest.label}
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
              {activity.title}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>location_on</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>{activity.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>schedule</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>{formatDate(activity.activity_date)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>group</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>
                  {participants.length}{activity.max_participants ? `/${activity.max_participants}` : ""} going
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {[
            { id: "chat", icon: "chat_bubble", label: "Group Chat" },
            { id: "info", icon: "info",        label: "Info & People" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "12px 0", border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "Rubik, sans-serif", fontSize: 13,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? accentColor : "var(--color-text-soft)",
              borderBottom: tab === t.id ? `2.5px solid ${accentColor}` : "2.5px solid transparent",
            }}>
              <span className={`material-symbols-outlined ${tab === t.id ? "ms-filled" : ""}`} style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat tab ── */}
      {tab === "chat" && (
        <>
          {!canChat ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>Join to chat</div>
              <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6, marginBottom: 24 }}>
                Say you're going to see the group chat.
              </div>
              <button onClick={handleJoin} disabled={busy} style={{
                background: accentColor, color: "#fff", border: "none", borderRadius: 999,
                padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "Rubik, sans-serif", boxShadow: `0 4px 14px ${accentColor}44`,
              }}>
                I'm in 🙋
              </button>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 4px" }} className="scrollbar-none">
                {msgLoading && (
                  <div style={{ textAlign: "center", paddingTop: 40 }}>
                    <div className="loading-dots"><span /><span /><span /></div>
                  </div>
                )}
                {!msgLoading && messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                    <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
                      No messages yet.<br />Start the conversation!
                    </p>
                  </div>
                )}
                {messages.map((msg) => {
                  const mine = msg.sender_id === user?.id;
                  const name = mine ? "You" : (msg.sender?.username || "?");
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
                      {!mine && <UserAvatar name={name} size={28} avatarUrl={msg.sender?.avatar_url || undefined} />}
                      <div style={{ maxWidth: "72%" }}>
                        {!mine && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, marginBottom: 3, paddingLeft: 2 }}>{name}</div>
                        )}
                        <div style={{
                          padding: "9px 13px",
                          borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: mine ? accentColor : "#fff",
                          color: mine ? "#fff" : "var(--color-text)",
                          fontSize: 14, lineHeight: 1.5,
                          boxShadow: mine ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-text-soft)", marginTop: 3, textAlign: mine ? "right" : "left" }}>
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
                background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)", flexShrink: 0,
              }}>
                <UserAvatar name="Me" size={34} avatarUrl={undefined} />
                <div style={{ flex: 1, display: "flex", gap: 8, background: "var(--color-surface-low)", borderRadius: 999, padding: "4px 6px 4px 14px", alignItems: "center" }}>
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Say something…"
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, fontFamily: "Rubik, sans-serif", color: "var(--color-text)" }}
                  />
                  <button onClick={handleSend} disabled={!text.trim() || sending} style={{
                    width: 34, height: 34, borderRadius: "50%", border: "none",
                    background: text.trim() ? accentColor : "var(--color-surface-high)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: text.trim() ? "pointer" : "default", flexShrink: 0,
                    transition: "background 0.15s",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 17, color: text.trim() ? "#fff" : "var(--color-text-soft)" }}>send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Info tab ── */}
      {tab === "info" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }} className="scrollbar-none">

          {activity.description && (
            <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.7, marginBottom: 20 }}>
              {activity.description}
            </p>
          )}

          {/* Join / Leave / Delete */}
          <div style={{ marginBottom: 24 }}>
            {isCreator ? (
              <button onClick={handleDelete} disabled={busy} style={{
                width: "100%", padding: "13px 0", borderRadius: 14,
                background: "none", border: "1.5px solid var(--color-error)",
                color: "var(--color-error)", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "Rubik, sans-serif",
              }}>
                Cancel activity
              </button>
            ) : (
              <button onClick={handleJoin} disabled={busy} style={{
                width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                background: isGoing ? "var(--color-surface-high)" : accentColor,
                color: isGoing ? "var(--color-text-soft)" : "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "Rubik, sans-serif",
                boxShadow: isGoing ? "none" : `0 4px 14px ${accentColor}44`,
                transition: "all 0.15s",
              }}>
                {isGoing ? "Leave activity" : "I'm in 🙋"}
              </button>
            )}
          </div>

          {/* Participants */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            🙋 Who's going · {participants.length}
          </div>

          {/* Creator */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: "10px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <UserAvatar name={activity.creator?.username || "?"} size={38} avatarUrl={activity.creator?.avatar_url || undefined} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{activity.creator?.username || "Someone"}</span>
              <span style={{ marginLeft: 8, fontSize: 10, background: `${accentColor}22`, color: accentColor, padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>Organizer</span>
            </div>
          </div>

          {participants.filter(p => p.user_id !== activity.creator?.id).map(p => {
            const prof = p.profiles || {};
            return (
              <div key={p.user_id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: "10px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <UserAvatar name={prof.username || "?"} size={38} avatarUrl={prof.avatar_url || undefined} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{prof.username || "Someone"}</span>
              </div>
            );
          })}

          {participants.length === 0 && (
            <p style={{ color: "var(--color-text-soft)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              No one yet — be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
