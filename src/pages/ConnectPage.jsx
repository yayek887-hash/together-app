import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import {
  fetchPeopleWithFriendStatus,
  fetchPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
} from "../lib/api.js";

/* ── Shared interest chips ─────────────────────── */
function InterestChips({ shared }) {
  if (!shared.length) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
      {shared.slice(0, 3).map((i) => (
        <span
          key={i.key}
          style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px",
            borderRadius: 999, background: i.bg, color: i.color,
          }}
        >
          {i.emoji} {i.label}
        </span>
      ))}
      {shared.length > 3 && (
        <span style={{ fontSize: 11, color: "var(--color-text-soft)", padding: "2px 4px" }}>
          +{shared.length - 3} more
        </span>
      )}
    </div>
  );
}

/* ── Person card ────────────────────────────────── */
function PersonCard({ person, type, myInterests, busy, onMessage, onAdd, onRemove }) {
  const sharedKeys  = (person.interests || []).filter(k => myInterests.includes(k));
  const sharedItems = sharedKeys.map(k => INTERESTS.find(i => i.key === k)).filter(Boolean);

  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "14px 14px",
      marginBottom: 10, boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <UserAvatar name={person.username || "?"} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
            {person.username || "Someone"}
          </div>
          {sharedItems.length > 0 ? (
            <InterestChips shared={sharedItems} />
          ) : (
            <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 3 }}>
              New to Together
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {type === "friend" && (
            <>
              <button
                onClick={onMessage}
                style={{
                  background: "var(--color-primary-fixed)", border: "none",
                  borderRadius: "50%", width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: "var(--color-primary)" }}>chat_bubble</span>
              </button>
              <button
                onClick={onRemove}
                disabled={busy}
                style={{
                  background: "none", border: "1.5px solid var(--color-outline-variant)",
                  borderRadius: 999, padding: "7px 12px", fontSize: 12,
                  color: "var(--color-text-soft)", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                }}
              >
                Connected ✓
              </button>
            </>
          )}

          {type === "pending" && (
            <span style={{
              fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500,
              background: "var(--color-surface-high)", borderRadius: 999,
              padding: "7px 12px",
            }}>
              Pending…
            </span>
          )}

          {type === "new" && (
            <button
              onClick={onAdd}
              disabled={busy === person.id}
              style={{
                background: "var(--color-primary)", color: "#fff",
                border: "none", borderRadius: 999, padding: "8px 16px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "Rubik, sans-serif",
                opacity: busy === person.id ? 0.6 : 1,
                boxShadow: "0 4px 12px rgba(91,60,221,0.3)",
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Incoming request card ──────────────────────── */
function RequestCard({ req, busy, onAccept, onDecline }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e8f4ff 100%)",
      borderRadius: 20, padding: "13px 14px", marginBottom: 10,
      border: "1.5px solid rgba(91,60,221,0.2)",
    }}>
      <UserAvatar name={req.profiles?.username || "?"} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
          {req.profiles?.username || "Someone"}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-primary)", marginTop: 2, fontWeight: 500 }}>
          wants to connect with you 💜
        </div>
      </div>
      <button
        onClick={onAccept}
        disabled={busy === req.id}
        style={{
          background: "var(--color-primary)", color: "#fff",
          border: "none", borderRadius: 999, padding: "7px 14px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: "Rubik, sans-serif",
        }}
      >
        Accept
      </button>
      <button
        onClick={onDecline}
        disabled={busy === req.id}
        style={{
          background: "none", color: "var(--color-text-soft)",
          border: "1.5px solid var(--color-outline-variant)",
          borderRadius: 999, padding: "7px 12px",
          fontSize: 12, cursor: "pointer", fontFamily: "Rubik, sans-serif",
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Section label ──────────────────────────────── */
function SectionLabel({ children, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-soft)" }}>{children}</span>
      {count != null && (
        <span style={{
          fontSize: 11, fontWeight: 700, background: "var(--color-surface-high)",
          color: "var(--color-text-soft)", borderRadius: 999, padding: "1px 7px",
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function ConnectPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [people, setPeople]   = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [busy, setBusy]       = useState(null);

  const myInterests = profile?.interests || [];

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

  const handleSend   = async (personId) => { setBusy(personId); try { await sendFriendRequest(user.id, personId); await load(); } catch {} finally { setBusy(null); } };
  const handleAccept = async (id) => { setBusy(id); try { await acceptFriendRequest(id); await load(); } catch {} finally { setBusy(null); } };
  const handleRemove = async (id) => { setBusy(id); try { await removeFriendship(id); await load(); } catch {} finally { setBusy(null); } };

  // Sort and bucket
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return people.filter(p => (p.username || "").toLowerCase().includes(q));
  }, [people, search]);

  const friends     = filtered.filter(p => p.friendship?.status === "accepted");
  const sentPending = filtered.filter(p => p.friendship?.status === "pending" && p.friendship?.requester_id === user?.id);
  const strangers   = filtered.filter(p => !p.friendship);

  // Sort strangers: most shared interests first
  const sortedStrangers = useMemo(() => {
    return [...strangers].sort((a, b) => {
      const aShared = (a.interests || []).filter(k => myInterests.includes(k)).length;
      const bShared = (b.interests || []).filter(k => myInterests.includes(k)).length;
      return bShared - aShared;
    });
  }, [strangers, myInterests]);

  const bestMatches = sortedStrangers.filter(p => (p.interests || []).some(k => myInterests.includes(k)));
  const others      = sortedStrangers.filter(p => !(p.interests || []).some(k => myInterests.includes(k)));

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: "18px 16px 16px" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 2 }}>
          Connect pillar
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)" }}>
          Find your people 🤝
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginTop: 4, lineHeight: 1.5 }}>
          Matched by shared interests — real connections, not random follows.
        </div>
      </div>

      {/* ── Incoming requests ── */}
      {pending.length > 0 && (
        <div style={{ padding: "0 16px 8px" }}>
          <SectionLabel count={pending.length}>Connection requests 💜</SectionLabel>
          {pending.map(req => (
            <RequestCard
              key={req.id} req={req} busy={busy}
              onAccept={() => handleAccept(req.id)}
              onDecline={() => handleRemove(req.id)}
            />
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        <span className="material-symbols-outlined" style={{
          position: "absolute", left: 28, top: "50%",
          transform: "translateY(-50%)", fontSize: 18, color: "var(--color-text-soft)",
        }}>
          search
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name…"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 14px 10px 40px", borderRadius: 999,
            border: "1.5px solid var(--color-outline-variant)",
            background: "var(--color-surface-low)",
            fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none",
          }}
          onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={e  => (e.target.style.borderColor = "var(--color-outline-variant)")}
        />
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "44px 0" }}>
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      )}

      {!loading && (
        <div style={{ padding: "0 16px" }}>

          {/* Best matches */}
          {bestMatches.length > 0 && (
            <>
              <SectionLabel count={bestMatches.length}>Best matches ✨</SectionLabel>
              {bestMatches.map(p => (
                <PersonCard
                  key={p.id} person={p} type="new"
                  myInterests={myInterests} busy={busy}
                  onAdd={() => handleSend(p.id)}
                />
              ))}
              <div style={{ height: 10 }} />
            </>
          )}

          {/* Friends / connections */}
          {friends.length > 0 && (
            <>
              <SectionLabel count={friends.length}>Your connections 🤝</SectionLabel>
              {friends.map(p => (
                <PersonCard
                  key={p.id} person={p} type="friend"
                  myInterests={myInterests} busy={busy}
                  onMessage={() => navigate(`/chat/${p.id}`)}
                  onRemove={() => handleRemove(p.friendship.id)}
                />
              ))}
              <div style={{ height: 10 }} />
            </>
          )}

          {/* Sent pending */}
          {sentPending.length > 0 && (
            <>
              <SectionLabel>Waiting for reply ⏳</SectionLabel>
              {sentPending.map(p => (
                <PersonCard
                  key={p.id} person={p} type="pending"
                  myInterests={myInterests} busy={busy}
                  onRemove={() => handleRemove(p.friendship.id)}
                />
              ))}
              <div style={{ height: 10 }} />
            </>
          )}

          {/* Others */}
          {others.length > 0 && (
            <>
              <SectionLabel count={others.length}>Others on Together 🌱</SectionLabel>
              {others.map(p => (
                <PersonCard
                  key={p.id} person={p} type="new"
                  myInterests={myInterests} busy={busy}
                  onAdd={() => handleSend(p.id)}
                />
              ))}
            </>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.7 }}>
                {search ? "No one matches your search." : "No other members yet. Share Together with friends!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
