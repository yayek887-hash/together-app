import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, UserPlus } from "lucide-react";
import UserAvatar, { AVATAR_COLORS } from "../components/UserAvatar.jsx";
import AchievementBadge from "../components/AchievementBadge.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProfileStats, fetchUserBadges, fetchFriendCount, updateProfileLocation } from "../lib/api.js";

const inp = { width: "100%", boxSizing: "border-box", padding: "10px 13px", borderRadius: 12, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none", color: "var(--color-text)" };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [stats, setStats] = useState({ postCount: 0, supportCount: 0, groupCount: 0 });
  const [badges, setBadges] = useState([]);
  const [friendCount, setFriendCount] = useState(0);

  const [locationVisible, setLocationVisible] = useState(profile?.location_visible || false);
  const [city, setCity]     = useState(profile?.city || "");
  const [region, setRegion] = useState(profile?.region || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [locSaved, setLocSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProfileStats(user.id).then(setStats).catch(() => {});
    fetchUserBadges(user.id).then(setBadges).catch(() => {});
    fetchFriendCount(user.id).then(setFriendCount).catch(() => {});
  }, [user]);

  const handleSaveLocation = async () => {
    try {
      await updateProfileLocation(user.id, { city, region, country, locationVisible });
      setLocSaved(true);
      setTimeout(() => setLocSaved(false), 2500);
    } catch {}
  };

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
        {[[String(stats.postCount), "Posts shared"], [String(stats.supportCount), "People helped"], [String(friendCount), "Friends"]].map(([n, l]) => (
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

      {/* Location settings */}
      <div style={{ padding: "22px 16px 8px" }}>
        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>Location settings</span>
      </div>
      <div style={{ margin: "0 16px", background: "#fff", borderRadius: 18, padding: "14px 16px", boxShadow: "0 2px 10px rgba(91,60,221,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Share my location</div>
            <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>City/region only — never exact address</div>
          </div>
          <div onClick={() => setLocationVisible(v => !v)}
            style={{ width: 42, height: 24, borderRadius: 12, background: locationVisible ? "var(--color-primary)" : "#E4E0F5", position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: locationVisible ? 21 : 3, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
          </div>
        </div>
        {locationVisible && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="City (e.g. Tel Aviv)"
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
            <input style={inp} value={region} onChange={e => setRegion(e.target.value)} placeholder="Region / State"
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
            <input style={inp} value={country} onChange={e => setCountry(e.target.value)} placeholder="Country"
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
          </div>
        )}
        <button onClick={handleSaveLocation}
          style={{ background: locSaved ? "#d1fae5" : "var(--color-primary-fixed)", color: locSaved ? "#065f46" : "var(--color-primary)", border: "none", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", transition: "all 0.2s" }}>
          {locSaved ? "✅ Saved!" : "Save location settings"}
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-text-soft)", lineHeight: 1.5 }}>
          🔒 Your location is only used to show nearby communities. It is never shared with other users without your permission.
        </div>
      </div>

      <div style={{ padding: "22px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton onClick={() => navigate("/people")} icon={UserPlus}>
          Find Friends
        </PrimaryButton>
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
