import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchPeopleWithFollowStatus, followUser, unfollowUser } from "../lib/api.js";

export default function PeoplePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPeopleWithFollowStatus(user.id);
      setPeople(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleToggle = async (person) => {
    if (busy) return;
    const isFollowing = person.followers?.some((f) => f.follower_id === user.id);
    setBusy(person.id);
    try {
      if (isFollowing) await unfollowUser(user.id, person.id);
      else             await followUser(user.id, person.id);
      await load();
    } catch {}
    finally { setBusy(null); }
  };

  const filtered = people.filter((p) =>
    (p.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const following = filtered.filter((p) => p.followers?.some((f) => f.follower_id === user.id));
  const suggestions = filtered.filter((p) => !p.followers?.some((f) => f.follower_id === user.id));

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="People" showBack />

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
            padding: "9px 14px 9px 38px",
            borderRadius: 999,
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

          {/* Following */}
          {following.length > 0 && (
            <>
              <span className="section-label">Following</span>
              {following.map((p) => <PersonCard key={p.id} person={p} currentUserId={user.id} busy={busy} onToggle={handleToggle} onMessage={() => navigate(`/chat/${p.id}`)} />)}
            </>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <>
              <span className="section-label" style={{ marginTop: following.length ? 18 : 0 }}>
                {following.length ? "Suggestions" : "People on Together"}
              </span>
              {suggestions.map((p) => <PersonCard key={p.id} person={p} currentUserId={user.id} busy={busy} onToggle={handleToggle} onMessage={() => navigate(`/chat/${p.id}`)} />)}
            </>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>👥</div>
              <p style={{ color: "var(--color-text-soft)", fontSize: 15 }}>
                {search ? "No one matches your search." : "No other members yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, currentUserId, busy, onToggle, onMessage }) {
  const isFollowing = person.followers?.some((f) => f.follower_id === currentUserId);
  const followerCount = person.followers?.length || 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        borderRadius: 18,
        padding: "13px 14px",
        marginBottom: 10,
        boxShadow: "0 2px 10px rgba(91,60,221,0.07)",
      }}
    >
      <UserAvatar name={person.username || "?"} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
          {person.username || "Someone"}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </div>
      </div>

      {/* Message button */}
      <button
        onClick={onMessage}
        style={{
          background: "var(--color-surface-container)",
          border: "none",
          borderRadius: "50%",
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: "var(--color-primary)" }}>chat_bubble</span>
      </button>

      {/* Follow button */}
      <button
        onClick={() => onToggle(person)}
        disabled={busy === person.id}
        style={{
          background: isFollowing ? "var(--color-primary-fixed)" : "var(--color-primary)",
          color: isFollowing ? "var(--color-primary)" : "#fff",
          border: isFollowing ? "1.5px solid var(--color-primary)" : "none",
          borderRadius: 999,
          padding: "7px 16px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Rubik, sans-serif",
          transition: "all 0.15s",
          flexShrink: 0,
          opacity: busy === person.id ? 0.6 : 1,
        }}
      >
        {isFollowing ? "Following ✓" : "Follow"}
      </button>
    </div>
  );
}
