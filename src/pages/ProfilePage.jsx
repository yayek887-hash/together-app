import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import UserAvatar, { AVATAR_COLORS } from "../components/UserAvatar.jsx";
import AchievementBadge from "../components/AchievementBadge.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProfileStats, fetchUserBadges } from "../lib/api.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [stats, setStats] = useState({ postCount: 0, supportCount: 0, groupCount: 0 });
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchProfileStats(user.id).then(setStats).catch(() => {});
    fetchUserBadges(user.id).then(setBadges).catch(() => {});
  }, [user]);

  const displayName = profile?.username || user?.email?.split("@")[0] || "You";

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <div
        style={{
          background: "var(--color-secondary)",
          padding: "26px 16px 50px",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          textAlign: "center",
        }}
      >
        <UserAvatar name={displayName} size={80} />
        <div style={{ fontSize: 19, fontWeight: 600, marginTop: 10 }}>
          {displayName}
          {profile?.age ? `, ${profile.age}` : ""}
        </div>
        <div style={{ fontSize: 13, color: "#5b5470", marginTop: 4, padding: "0 30px" }}>
          {profile?.bio || "No bio yet — tell the community a little about you."}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "-30px 16px 0",
          background: "#fff",
          borderRadius: 18,
          padding: "16px 8px",
          boxShadow: "0 6px 18px rgba(108,99,255,0.1)",
        }}
      >
        {[[String(stats.postCount), "Posts"], [String(stats.supportCount), "Hugs given"], [String(stats.groupCount), "Groups"]].map(([n, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>{n}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-soft)" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "22px 16px 8px" }}>
        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>Achievements</span>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px", justifyContent: badges.length ? "space-between" : "flex-start" }}>
        {badges.length === 0 && (
          <p style={{ color: "var(--color-text-soft)", fontSize: 13 }}>No badges yet — keep supporting others!</p>
        )}
        {badges.map((b) => (
          <AchievementBadge key={b.id} badge={b} />
        ))}
      </div>

      <div style={{ padding: "22px 16px 8px" }}>
        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>Your journey</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px" }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ height: 80, borderRadius: 12, background: AVATAR_COLORS[i % AVATAR_COLORS.length], opacity: 0.7 }}
          />
        ))}
      </div>

      <div style={{ padding: "22px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton variant="outline" onClick={() => navigate("/help-center")} icon={Shield}>
          Safety & Help Center
        </PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => signOut().then(() => navigate("/"))} icon={LogOut}>
          Log Out
        </PrimaryButton>
      </div>
    </div>
  );
}
