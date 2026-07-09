import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchPeopleWithFriendStatus,
  fetchPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
} from "../lib/api.js";

export default function PeoplePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople]   = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [busy, setBusy]       = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, req] = await Promise.all([
        fetchPeopleWithFriendStatus(user.id),
        fetchPendingRequests(user.id),
      ]);
      setPeople(p);
      setPending(req);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleSendRequest = async (personId) => {
    setBusy(personId);
    try { await sendFriendRequest(user.id, personId); await load(); }
    catch {} finally { setBusy(null); }
  };

  const handleAccept = async (friendshipId) => {
    setBusy(friendshipId);
    try { await acceptFriendRequest(friendshipId); await load(); }
    catch {} finally { setBusy(null); }
  };

  const handleRemove = async (friendshipId) => {
    setBusy(friendshipId);
    try { await removeFriendship(friendshipId); await load(); }
    catch {} finally { setBusy(null); }
  };

  const filtered = people.filter((p) =>
    (p.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const friends     = filtered.filter((p) => p.friendship?.status === "accepted");
  const sentPending = filtered.filter((p) => p.friendship?.status === "pending" && p.friendship?.requester_id === user.id);
  const newPeople   = filtered.filter((p) => !p.friendship);

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="Find Friends" showBack />

      {/* Pending requests banner */}
      {pending.length > 0 && (
        <div style={{ padding: "0 16px 4px" }}>
          <span className="section-label">Friend requests 💜</span>
          {pending.map((req) => (
            <div
              key={req.id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e8f4ff 100%)",
                borderRadius: 18, padding: "12px 14px", marginBottom: 10,
                border: "1.5px solid var(--color-primary)",
              }}
            >
              <UserAvatar name={req.profiles?.display_name || req.profiles?.username || "?"} size={42} avatarUrl={req.profiles?.avatar_url || undefined} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
                  {req.profiles?.display_name || req.profiles?.username || "Someone"}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>
                  wants to be your friend
                </div>
              </div>
              <button
                onClick={() => handleAccept(req.id)}
                disabled={busy === req.id}
                style={{
                  background: "var(--color-primary)", color: "#fff",
                  border: "none", borderRadius: 999, padding: "7px 14px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Rubik, sans-serif",
                }}
              >
                Accept 🤝
              </button>
              <button
                onClick={() => handleRemove(req.id)}
                disabled={busy === req.id}
                style={{
                  background: "none", color: "var(--color-text-soft)",
                  border: "1.5px solid var(--color-outline-variant)",
                  borderRadius: 999, padding: "7px 12px",
                  fontSize: 12, cursor: "pointer", fontFamily: "Rubik, sans-serif",
                }}
              >
                Decline
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-text-soft)" }}>
          search
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people…"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "9px 14px 9px 38px", borderRadius: 999,
            border: "1.5px solid var(--color-outline-variant)",
            background: "var(--color-surface-low)",
            fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e)  => (e.target.style.borderColor = "var(--color-outline-variant)")}
        />
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "44px 0" }}>
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      )}

      {!loading && (
        <div style={{ padding: "0 16px" }}>

          {/* Friends */}
          {friends.length > 0 && (
            <>
              <span className="section-label">Your friends 🤝</span>
              {friends.map((p) => (
                <PersonCard
                  key={p.id} person={p} type="friend"
                  busy={busy}
                  onMessage={() => navigate(`/chat/${p.id}`)}
                  onRemove={() => handleRemove(p.friendship.id)}
                />
              ))}
            </>
          )}

          {/* Sent pending */}
          {sentPending.length > 0 && (
            <>
              <span className="section-label" style={{ marginTop: friends.length ? 18 : 0 }}>
                Request sent ⏳
              </span>
              {sentPending.map((p) => (
                <PersonCard
                  key={p.id} person={p} type="pending"
                  busy={busy}
                  onRemove={() => handleRemove(p.friendship.id)}
                />
              ))}
            </>
          )}

          {/* New people */}
          {newPeople.length > 0 && (
            <>
              <span className="section-label" style={{ marginTop: (friends.length || sentPending.length) ? 18 : 0 }}>
                People on Together 🌟
              </span>
              {newPeople.map((p) => (
                <PersonCard
                  key={p.id} person={p} type="new"
                  busy={busy}
                  onAdd={() => handleSendRequest(p.id)}
                />
              ))}
            </>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
              <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.6 }}>
                {search ? "No one matches your search." : "No other members yet — you'll be the first to welcome someone!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, type, busy, onMessage, onAdd, onRemove }) {
  const memberSince = person.created_at
    ? new Date(person.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "#fff", borderRadius: 18, padding: "13px 14px",
      marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(91,60,221,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <UserAvatar name={person.display_name || person.username || "?"} size={46} avatarUrl={person.avatar_url || undefined} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
          {person.display_name || person.username || "Someone"}
        </div>
        {memberSince && (
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>
            Member since {memberSince}
          </div>
        )}
      </div>

      {type === "friend" && (
        <>
          <button onClick={onMessage} style={{ background: "var(--color-primary-fixed)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: "var(--color-primary)" }}>chat_bubble</span>
          </button>
          <button onClick={onRemove} disabled={busy} style={{ background: "none", border: "1.5px solid var(--color-outline-variant)", borderRadius: 999, padding: "7px 12px", fontSize: 12, color: "var(--color-text-soft)", cursor: "pointer", fontFamily: "Rubik, sans-serif", flexShrink: 0 }}>
            Friends ✓
          </button>
        </>
      )}

      {type === "pending" && (
        <span style={{ fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500, flexShrink: 0 }}>
          Pending…
        </span>
      )}

      {type === "new" && (
        <button
          onClick={onAdd}
          disabled={busy === person.id}
          style={{
            background: "var(--color-primary)", color: "#fff",
            border: "none", borderRadius: 999, padding: "7px 16px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "Rubik, sans-serif", flexShrink: 0,
            opacity: busy === person.id ? 0.6 : 1,
          }}
        >
          + Add
        </button>
      )}
    </div>
  );
}
