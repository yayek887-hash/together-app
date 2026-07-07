import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchAllProfiles } from "../lib/api.js";

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchAllProfiles(user.id)
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = contacts.filter((c) =>
    (c.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-scroll scrollbar-none anim-in">
      {/* Header */}
      <div
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "14px 20px 12px",
          borderBottom: "1px solid rgba(91,60,221,0.07)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-primary)", marginBottom: 10 }}>
          Messages
        </div>
        {/* Search bar */}
        <div style={{ position: "relative" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "var(--color-text-soft)",
            }}
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "9px 14px 9px 38px",
              borderRadius: 999,
              border: "1.5px solid var(--color-outline-variant)",
              background: "var(--color-surface-low)",
              fontSize: 13,
              fontFamily: "Rubik, sans-serif",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--color-outline-variant)")}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.6 }}>
              {search ? "No one matches your search." : "No one else has joined yet — once a friend signs up, they'll appear here."}
            </p>
          </div>
        )}

        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => navigate(`/chat/${contact.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: "100%",
              background: "#fff",
              border: "none",
              borderRadius: 18,
              padding: "13px 14px",
              marginBottom: 10,
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
              transition: "box-shadow 0.15s, transform 0.15s",
              fontFamily: "Rubik, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(91,60,221,0.13)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(91,60,221,0.07)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <UserAvatar name={contact.username || "?"} size={46} avatarUrl={contact.avatar_url || undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                {contact.username || "Someone"}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 2 }}>
                Tap to send a message
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "var(--color-primary)", flexShrink: 0 }}
            >
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
