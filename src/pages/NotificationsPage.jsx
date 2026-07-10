import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";
import {
  fetchPendingRequests, acceptFriendRequest, removeFriendship,
  fetchCommentsOnMyPosts,
} from "../lib/api.js";

function timeAgo(dateStr) {
  const m = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  const d = Math.floor(m / 1440);
  return d === 1 ? "Yesterday" : `${d}d ago`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount, clearUnread, decrementPending } = useNotifications();

  const [requests, setRequests] = useState([]);
  const [comments, setComments] = useState([]);
  const [busy, setBusy]         = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [reqs, cmts] = await Promise.all([
        fetchPendingRequests(user.id),
        fetchCommentsOnMyPosts(user.id),
      ]);
      setRequests(reqs || []);
      setComments(cmts || []);
    } catch {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (req) => {
    setBusy(req.id);
    try {
      await acceptFriendRequest(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      decrementPending();
    } catch {}
    finally { setBusy(null); }
  };

  const handleDecline = async (req) => {
    setBusy(req.id);
    try {
      await removeFriendship(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      decrementPending();
    } catch {}
    finally { setBusy(null); }
  };

  const total = requests.length + comments.length + (unreadCount > 0 ? 1 : 0);
  const isEmpty = !loading && total === 0;

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: "22px 18px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} className="icon-btn" style={{ cursor: "pointer" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary)" }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em" }}>Activity</div>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)" }}>What's been happening</div>
        </div>
        {total > 0 && (
          <div style={{ background: "var(--color-notification)", color: "#fff", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>
            {total}
          </div>
        )}
      </div>

      <div style={{ padding: "0 16px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {isEmpty && (
          <div style={{ textAlign: "center", padding: "64px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>You're all caught up!</div>
            <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.7, margin: 0 }}>
              No new notifications.<br />Make some connections and share posts!
            </p>
          </div>
        )}

        {/* ── Unread messages ── */}
        {!loading && unreadCount > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>💬 Messages</SectionLabel>
            <div
              onClick={() => { clearUnread(); navigate("/connect", { state: { tab: "messages" } }); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
                borderRadius: 20, padding: "16px 16px",
                cursor: "pointer", boxShadow: "0 6px 20px rgba(91,60,221,0.35)",
              }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>chat_bubble</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Tap to open messages</div>
              </div>
              <div style={{ background: "#fff", color: "#5b3cdd", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {unreadCount}
              </div>
            </div>
          </div>
        )}

        {/* ── Friend requests ── */}
        {!loading && requests.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>🤝 Connection requests · {requests.length}</SectionLabel>
            {requests.map(req => {
              const name = req.profiles?.display_name || req.profiles?.username || "Someone";
              return (
                <div key={req.id} style={{
                  background: "#fff", borderRadius: 20, overflow: "hidden",
                  marginBottom: 10, boxShadow: "0 2px 14px rgba(91,60,221,0.10)",
                  border: "1.5px solid rgba(91,60,221,0.12)",
                }}>
                  <div style={{ height: 4, background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-container))" }} />
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <UserAvatar name={name} size={46} avatarUrl={req.profiles?.avatar_url || undefined} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-primary)", marginTop: 2, fontWeight: 600 }}>wants to connect with you</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => handleAccept(req)}
                        disabled={busy === req.id}
                        style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", opacity: busy === req.id ? 0.6 : 1 }}
                      >
                        Accept ✓
                      </button>
                      <button
                        onClick={() => handleDecline(req)}
                        disabled={busy === req.id}
                        style={{ background: "none", color: "var(--color-text-soft)", border: "1.5px solid var(--color-outline-variant)", borderRadius: 12, padding: "8px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Comments on my posts ── */}
        {!loading && comments.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>💜 Replies on your posts</SectionLabel>
            {comments.map(c => {
              const name = c.author?.display_name || c.author?.username || "Someone";
              return (
                <div key={c.id} style={{
                  background: "#fff", borderRadius: 20, padding: "14px 16px",
                  marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.05)",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(91,60,221,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <UserAvatar name={name} size={40} avatarUrl={c.author?.avatar_url || undefined} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{name}</span>
                      <span style={{ color: "var(--color-text-soft)" }}> replied with support</span>
                    </div>
                    <div style={{
                      fontSize: 12, color: "var(--color-text-soft)",
                      background: "var(--color-surface-low)", borderRadius: 10,
                      padding: "8px 12px", lineHeight: 1.55,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      borderLeft: "3px solid var(--color-primary)",
                    }}>
                      "{c.text}"
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 6, fontWeight: 500 }}>
                      {timeAgo(c.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}
