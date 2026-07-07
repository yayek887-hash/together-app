import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import { useNotifications } from "../context/NotificationsContext.jsx";
import {
  fetchPeopleWithFriendStatus,
  fetchPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  fetchAllProfiles,
} from "../lib/api.js";

/* ── Shared interest chips ─────────────────────── */
function InterestChips({ shared }) {
  if (!shared.length) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
      {shared.slice(0, 3).map((i) => (
        <span key={i.key} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: i.bg, color: i.color }}>
          {i.emoji} {i.label}
        </span>
      ))}
      {shared.length > 3 && (
        <span style={{ fontSize: 11, color: "var(--color-text-soft)", padding: "2px 4px" }}>+{shared.length - 3} more</span>
      )}
    </div>
  );
}

/* ── Person card ────────────────────────────────── */
function PersonCard({ person, type, myInterests, busy, onMessage, onAdd, onRemove }) {
  const sharedKeys  = (person.interests || []).filter(k => myInterests.includes(k));
  const sharedItems = sharedKeys.map(k => INTERESTS.find(i => i.key === k)).filter(Boolean);

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "14px 14px", marginBottom: 10, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <UserAvatar name={person.username || "?"} size={48} avatarUrl={person.avatar_url || undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
            {person.username || "Someone"}
          </div>
          {sharedItems.length > 0 ? (
            <InterestChips shared={sharedItems} />
          ) : (
            <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 3 }}>New to Together</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {type === "friend" && (
            <>
              <button
                onClick={onMessage}
                style={{ background: "var(--color-primary-fixed)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: "var(--color-primary)" }}>chat_bubble</span>
              </button>
              <button
                onClick={onRemove}
                disabled={busy}
                style={{ background: "none", border: "1.5px solid var(--color-outline-variant)", borderRadius: 12, padding: "7px 12px", fontSize: 12, color: "var(--color-text-soft)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}
              >
                Connected ✓
              </button>
            </>
          )}
          {type === "pending" && (
            <span style={{ fontSize: 12, color: "var(--color-text-soft)", fontWeight: 500, background: "var(--color-surface-high)", borderRadius: 12, padding: "7px 12px" }}>
              Pending…
            </span>
          )}
          {type === "new" && (
            <button
              onClick={onAdd}
              disabled={busy === person.id}
              style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", opacity: busy === person.id ? 0.6 : 1, boxShadow: "0 4px 12px rgba(91,60,221,0.3)" }}
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
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-primary-fixed)", borderRadius: 20, padding: "13px 14px", marginBottom: 10, border: "1.5px solid rgba(91,60,221,0.15)" }}>
      <UserAvatar name={req.profiles?.username || "?"} size={44} avatarUrl={req.profiles?.avatar_url || undefined} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{req.profiles?.username || "Someone"}</div>
        <div style={{ fontSize: 11, color: "var(--color-primary)", marginTop: 2, fontWeight: 500 }}>wants to connect 💜</div>
      </div>
      <button onClick={onAccept} disabled={busy === req.id}
        style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
        Accept
      </button>
      <button onClick={onDecline} disabled={busy === req.id}
        style={{ background: "none", color: "var(--color-text-soft)", border: "1.5px solid var(--color-outline-variant)", borderRadius: 12, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
        ✕
      </button>
    </div>
  );
}

/* ── Section divider ─────────────────────────────── */
function Divider({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 4 }}>
      <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</div>
      <div style={{ height: 1, flex: 1, background: "var(--color-outline-variant)" }} />
    </div>
  );
}

/* ── Messages tab ────────────────────────────────── */
function MessagesTab({ userId }) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetchAllProfiles(userId)
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = contacts.filter(c =>
    (c.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ padding: "0 18px 14px", position: "relative" }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: 32, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-text-soft)" }}>search</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search people…"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 40px", borderRadius: 14, border: "1.5px solid var(--color-outline-variant)", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none" }}
          onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
          onBlur={e  => e.target.style.borderColor = "var(--color-outline-variant)"}
        />
      </div>

      <div style={{ padding: "0 18px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              {search ? "No one matches your search." : "No one else has joined yet."}
            </p>
          </div>
        )}
        {filtered.map(contact => (
          <button
            key={contact.id}
            onClick={() => navigate(`/chat/${contact.id}`)}
            style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: "#fff", border: "none", borderRadius: 18, padding: "13px 14px", marginBottom: 10, cursor: "pointer", textAlign: "left", boxShadow: "var(--shadow-card)", fontFamily: "Rubik, sans-serif" }}
          >
            <UserAvatar name={contact.username || "?"} size={46} avatarUrl={contact.avatar_url || undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>{contact.username || "Someone"}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 2 }}>Tap to message</div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)", flexShrink: 0 }}>chevron_right</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function ConnectPage() {
  const { user, profile } = useAuth();
  const { unreadCount }   = useNotifications();
  const navigate = useNavigate();

  const [tab, setTab]       = useState("people");
  const [people, setPeople] = useState([]);
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return people.filter(p => (p.username || "").toLowerCase().includes(q));
  }, [people, search]);

  const friends     = filtered.filter(p => p.friendship?.status === "accepted");
  const sentPending = filtered.filter(p => p.friendship?.status === "pending" && p.friendship?.requester_id === user?.id);
  const strangers   = filtered.filter(p => !p.friendship);

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
      <div style={{ padding: "22px 18px 16px" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", fontWeight: 500, marginBottom: 5 }}>
          Connect · 🤝
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          Your people
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", padding: "0 18px 18px", gap: 8 }}>
        {[
          { id: "people",   label: "People",   icon: "person_search" },
          { id: "messages", label: "Messages",  icon: "chat_bubble"   },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 14,
              border: "none", cursor: "pointer",
              fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14,
              background: tab === t.id ? "var(--color-primary)" : "#fff",
              color: tab === t.id ? "#fff" : "var(--color-text-soft)",
              boxShadow: tab === t.id ? "0 4px 14px rgba(91,60,221,0.28)" : "0 1px 3px rgba(0,0,0,0.08)",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              position: "relative",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{t.icon}</span>
            {t.label}
            {t.id === "messages" && unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 7, right: 12,
                background: "#e84545", color: "#fff",
                fontSize: 9, fontWeight: 800, minWidth: 16, height: 16,
                borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", border: "2px solid " + (tab === "messages" ? "var(--color-primary)" : "#fff"),
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Messages tab ── */}
      {tab === "messages" && <MessagesTab userId={user?.id} />}

      {/* ── People tab ── */}
      {tab === "people" && (
        <>
          {/* Incoming requests */}
          {pending.length > 0 && (
            <div style={{ padding: "0 18px 8px" }}>
              <Divider>Requests 💜 {pending.length}</Divider>
              {pending.map(req => (
                <RequestCard key={req.id} req={req} busy={busy}
                  onAccept={() => handleAccept(req.id)}
                  onDecline={() => handleRemove(req.id)} />
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ padding: "0 18px 16px", position: "relative" }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: 32, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-text-soft)" }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name…"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 40px", borderRadius: 14, border: "1.5px solid var(--color-outline-variant)", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none" }}
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
            <div style={{ padding: "0 18px" }}>
              {bestMatches.length > 0 && (
                <>
                  <Divider>Best matches ✨</Divider>
                  {bestMatches.map(p => (
                    <PersonCard key={p.id} person={p} type="new" myInterests={myInterests} busy={busy} onAdd={() => handleSend(p.id)} />
                  ))}
                  <div style={{ height: 8 }} />
                </>
              )}
              {friends.length > 0 && (
                <>
                  <Divider>Your connections 🤝</Divider>
                  {friends.map(p => (
                    <PersonCard key={p.id} person={p} type="friend" myInterests={myInterests} busy={busy}
                      onMessage={() => navigate(`/chat/${p.id}`)}
                      onRemove={() => handleRemove(p.friendship.id)} />
                  ))}
                  <div style={{ height: 8 }} />
                </>
              )}
              {sentPending.length > 0 && (
                <>
                  <Divider>Waiting for reply ⏳</Divider>
                  {sentPending.map(p => (
                    <PersonCard key={p.id} person={p} type="pending" myInterests={myInterests} busy={busy}
                      onRemove={() => handleRemove(p.friendship.id)} />
                  ))}
                  <div style={{ height: 8 }} />
                </>
              )}
              {others.length > 0 && (
                <>
                  <Divider>Others on Together 🌱</Divider>
                  {others.map(p => (
                    <PersonCard key={p.id} person={p} type="new" myInterests={myInterests} busy={busy} onAdd={() => handleSend(p.id)} />
                  ))}
                </>
              )}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🌱</div>
                  <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    {search ? "No one matches your search." : "No other members yet. Share Together with friends!"}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
