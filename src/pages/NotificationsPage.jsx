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
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: "var(--color-outline-variant)" }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "var(--color-outline-variant)" }} />
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount, clearUnread, decrementPending } = useNotifications();

  const [requests, setRequests] = useState([]);
  const [comments, setComments] = useState([]);
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const isEmpty = !loading && requests.length === 0 && comments.length === 0 && unreadCount === 0;

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: "22px 18px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary)" }}>arrow_back</span>
        </button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em" }}>Activity</div>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)" }}>What's been happening</div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {isEmpty && (
          <div style={{ textAlign: "center", padding: "64px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>You're all caught up!</div>
            <div style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
              No new notifications right now.<br />Come back after making some connections!
            </div>
          </div>
        )}

        {/* ── Unread messages ── */}
        {unreadCount > 0 && (
          <>
            <Divider label="Messages" />
            <div
              onClick={() => { clearUnread(); navigate("/connect"); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#fff", borderRadius: 18, padding: "14px 16px", marginBottom: 10,
                boxShadow: "0 2px 10px rgba(91,60,221,0.07)", cursor: "pointer",
                border: "1.5px solid var(--color-primary)",
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>chat_bubble</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
                  {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 2 }}>Tap to open your messages</div>
              </div>
              <span style={{
                background: "#e84545", color: "#fff",
                borderRadius: 999, padding: "3px 9px", fontSize: 12, fontWeight: 800,
              }}>{unreadCount}</span>
            </div>
          </>
        )}

        {/* ── Friend requests ── */}
        {requests.length > 0 && (
          <>
            <Divider label={`Friend requests · ${requests.length}`} />
            {requests.map(req => {
              const name = req.profiles?.username || "Someone";
              const avatarUrl = req.profiles?.avatar_url || undefined;
              return (
                <div
                  key={req.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#fff", borderRadius: 18, padding: "12px 14px", marginBottom: 10,
                    boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
                    border: "1.5px solid var(--color-primary)",
                    background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e8f4ff 100%)",
                  }}
                >
                  <UserAvatar name={name} size={46} avatarUrl={avatarUrl} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 2 }}>wants to connect with you 🤝</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleAccept(req)}
                      disabled={busy === req.id}
                      style={{
                        background: "var(--color-primary)", color: "#fff",
                        border: "none", borderRadius: 999, padding: "8px 16px",
                        fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(req)}
                      disabled={busy === req.id}
                      style={{
                        background: "none", color: "var(--color-text-soft)",
                        border: "1.5px solid var(--color-outline-variant)",
                        borderRadius: 999, padding: "8px 12px",
                        fontSize: 12, cursor: "pointer", fontFamily: "Rubik, sans-serif",
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Comments on my posts ── */}
        {comments.length > 0 && (
          <>
            <Divider label="On your posts" />
            {comments.map(c => {
              const name = c.author?.username || "Someone";
              const avatarUrl = c.author?.avatar_url || undefined;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    background: "#fff", borderRadius: 18, padding: "12px 14px", marginBottom: 10,
                    boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
                  }}
                >
                  <UserAvatar name={name} size={40} avatarUrl={avatarUrl} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>{name}</span>
                      {" commented on your post"}
                    </div>
                    <div style={{
                      fontSize: 12, color: "var(--color-text-soft)", marginTop: 4,
                      background: "var(--color-surface-low)", borderRadius: 10,
                      padding: "6px 10px", lineHeight: 1.5,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      "{c.text}"
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 6 }}>
                      {timeAgo(c.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

      </div>
    </div>
  );
}
