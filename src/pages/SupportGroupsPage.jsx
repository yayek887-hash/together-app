import { useState, useEffect, useCallback } from "react";
import TopBar from "../components/TopBar.jsx";
import SearchBar from "../components/SearchBar.jsx";
import GroupCard from "../components/GroupCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGroups, joinGroup, leaveGroup } from "../lib/api.js";

const FILTERS = ["All", "Interests", "School", "Confidence", "Anxiety"];

export default function SupportGroupsPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGroups(await fetchGroups());
    } catch (err) {
      setError(err.message || "Couldn't load groups right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isJoined = (group) => (group.group_members || []).some((m) => m.user_id === user?.id);

  const handleJoin = async (group) => {
    if (!user || busyId) return;
    setBusyId(group.id);
    try {
      if (isJoined(group)) {
        await leaveGroup(group.id, user.id);
      } else {
        await joinGroup(group.id, user.id);
      }
      await load();
    } catch (err) {
      setError(err.message || "Couldn't update your membership.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="Support Groups" />
      <div style={{ padding: "0 16px 14px" }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search groups or interests..." />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px 14px", overflowX: "auto" }} className="scrollbar-none">
        {FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveFilter(t)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              whiteSpace: "nowrap",
              border: "none",
              cursor: "pointer",
              background: activeFilter === t ? "var(--color-primary)" : "#fff",
              color: activeFilter === t ? "#fff" : "var(--color-text-soft)",
              boxShadow: "0 2px 6px rgba(108,99,255,0.06)",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 16px" }}>
        {loading && <p style={{ color: "var(--color-text-soft)", textAlign: "center", marginTop: 20 }}>Loading groups...</p>}
        {error && <p style={{ color: "var(--color-error)", textAlign: "center", marginTop: 20, fontSize: 14 }}>{error}</p>}
        {!loading &&
          filtered.map((g) => (
            <GroupCard
              key={g.id}
              group={{ ...g, members: g.group_members?.length || 0 }}
              joined={isJoined(g)}
              onJoin={() => handleJoin(g)}
            />
          ))}
        {!loading && filtered.length === 0 && (
          <p style={{ color: "var(--color-text-soft)", textAlign: "center", marginTop: 30 }}>
            No groups match that search yet.
          </p>
        )}
      </div>
    </div>
  );
}
