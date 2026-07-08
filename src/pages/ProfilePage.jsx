import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import UserAvatar from "../components/UserAvatar.jsx";
import AchievementBadge from "../components/AchievementBadge.jsx";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import {
  fetchFriendCount, fetchUserBadges, fetchUserGroups, fetchUserActivities,
  updateProfile, uploadAvatar, fetchUserPosts,
} from "../lib/api.js";

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
function formatActivityDate(str) {
  const d = new Date(str);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `Today · ${time}`;
  const tom = new Date(now); tom.setDate(now.getDate() + 1);
  if (d.toDateString() === tom.toDateString()) return `Tomorrow · ${time}`;
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return `${days[d.getDay()]} · ${time}`;
}

function SectionCard({ children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "16px 16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(91,60,221,0.06)", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 1 }}>{sub}</div>}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{ width: 42, height: 24, borderRadius: 12, background: value ? "var(--color-primary)" : "#E4E0F5", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}
      >
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
      </div>
    </div>
  );
}

const inp = {
  width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14,
  border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)",
  fontSize: 14, fontFamily: "Rubik, sans-serif", outline: "none", color: "var(--color-text)",
};
const focusIn  = e => (e.target.style.borderColor = "var(--color-primary)");
const focusOut = e => (e.target.style.borderColor = "var(--color-outline-variant)");

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const fileRef = useRef(null);

  const [friendCount,  setFriendCount]  = useState(0);
  const [badges,       setBadges]       = useState([]);
  const [groups,       setGroups]       = useState([]);
  const [activities,   setActivities]   = useState([]);
  const [myPosts,      setMyPosts]      = useState([]);
  const [activeTab,    setActiveTab]    = useState("about"); // "about" | "posts"

  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [displayName,  setDisplayName]  = useState("");
  const [bio,          setBio]          = useState("");
  const [age,          setAge]          = useState("");
  const [city,         setCity]         = useState("");
  const [region,       setRegion]       = useState("");
  const [goalsPublic,  setGoalsPublic]  = useState("");
  const [interests,    setInterests]    = useState([]);
  const [avatarUrl,    setAvatarUrl]    = useState("");

  const [visibility,      setVisibility]      = useState("public");
  const [showLocation,    setShowLocation]    = useState(true);
  const [showInterests,   setShowInterests]   = useState(true);
  const [showGoals,       setShowGoals]       = useState(true);
  const [showGroups,      setShowGroups]      = useState(true);
  const [showActivities,  setShowActivities]  = useState(true);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name || profile.username || "");
    setBio(profile.bio || "");
    setAge(profile.age ? String(profile.age) : "");
    setCity(profile.city || "");
    setRegion(profile.region || "");
    setGoalsPublic(profile.goals_public || "");
    setInterests(profile.interests || []);
    setAvatarUrl(profile.avatar_url || "");
    setVisibility(profile.profile_visibility || "public");
    setShowLocation(profile.show_location ?? true);
    setShowInterests(profile.show_interests ?? true);
    setShowGoals(profile.show_goals ?? true);
    setShowGroups(profile.show_groups ?? true);
    setShowActivities(profile.show_activities ?? true);
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    fetchFriendCount(user.id).then(setFriendCount).catch(() => {});
    fetchUserBadges(user.id).then(setBadges).catch(() => {});
    fetchUserGroups(user.id).then(setGroups).catch(() => {});
    fetchUserActivities(user.id).then(setActivities).catch(() => {});
    fetchUserPosts(user.id).then(setMyPosts).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, {
        display_name:       displayName.trim() || null,
        bio:                bio.trim() || null,
        age:                age ? parseInt(age) : null,
        city:               city.trim() || null,
        region:             region.trim() || null,
        goals_public:       goalsPublic.trim() || null,
        interests,
        avatar_url:         avatarUrl || null,
        profile_visibility: visibility,
        show_location:      showLocation,
        show_interests:     showInterests,
        show_goals:         showGoals,
        show_groups:        showGroups,
        show_activities:    showActivities,
        location_visible:   showLocation,
      });
      await refreshProfile();
      setEditing(false);
    } catch {}
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      await updateProfile(user.id, { avatar_url: url });
      await refreshProfile();
    } catch {}
    finally { setAvatarLoading(false); }
  };

  const toggleInterest = (key) => {
    setInterests(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const displayedName  = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "You";
  const memberSince    = profile?.created_at ? formatDate(profile.created_at) : null;
  const myInterestData = INTERESTS.filter(i => interests.includes(i.key));
  const coverColor     = profile?.avatar_color || "#5b3cdd";

  const visibilityLabels = {
    public:  { icon: "🌍", label: "Public", sub: "Anyone can see your profile" },
    friends: { icon: "👥", label: "Friends only", sub: "Only your connections" },
    private: { icon: "🔒", label: "Private", sub: "Only you" },
  };

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Cover + Avatar header ── */}
      <div style={{ position: "relative", marginBottom: 60 }}>
        {/* Cover gradient */}
        <div style={{
          height: 130,
          background: `linear-gradient(135deg, ${coverColor}cc 0%, ${coverColor}88 50%, #a855f744 100%)`,
          borderRadius: "0 0 28px 28px",
        }} />

        {/* Overlapping avatar */}
        <div style={{ position: "absolute", bottom: -48, left: 20 }}>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: "50%", border: "4px solid var(--color-bg)", display: "inline-block" }}>
              <UserAvatar name={displayedName} size={88} avatarUrl={avatarUrl || undefined} />
            </div>
            {editing && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                style={{
                  position: "absolute", bottom: 4, right: 4,
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--color-primary)", border: "2px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#fff" }}>
                  {avatarLoading ? "hourglass_empty" : "photo_camera"}
                </span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        {/* Edit / Save buttons top-right */}
        <div style={{ position: "absolute", bottom: -40, right: 16 }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{
              background: "#fff", color: "var(--color-primary)",
              border: "1.5px solid var(--color-primary)", borderRadius: 999, padding: "8px 18px",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif",
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 2px 8px rgba(91,60,221,0.10)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
              Edit profile
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSave} disabled={saving} style={{
                background: "var(--color-primary)", color: "#fff",
                border: "none", borderRadius: 999, padding: "8px 18px",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif",
              }}>
                {saving ? "Saving…" : "Save ✓"}
              </button>
              <button onClick={() => setEditing(false)} style={{
                background: "#fff", color: "var(--color-text-soft)",
                border: "1.5px solid var(--color-outline-variant)",
                borderRadius: 999, padding: "8px 14px",
                fontSize: 13, cursor: "pointer", fontFamily: "Rubik, sans-serif",
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ── Name + username ── */}
        <div style={{ marginBottom: 14 }}>
          {editing ? (
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Display name"
              style={{ ...inp, fontSize: 18, fontWeight: 700, marginBottom: 6 }}
              onFocus={focusIn} onBlur={focusOut}
            />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.02em" }}>{displayedName}</div>
          )}
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginTop: 2 }}>
            @{profile?.username}
            {memberSince && <span style={{ marginLeft: 8 }}>· Member since {memberSince}</span>}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: "flex", gap: 0,
          background: "#fff", borderRadius: 18,
          boxShadow: "0 2px 10px rgba(91,60,221,0.06)",
          marginBottom: 16, overflow: "hidden",
        }}>
          {[
            [friendCount, "Connections", () => navigate("/connect")],
            [groups.length, "Groups", () => navigate("/groups")],
            [myPosts.length, "Posts", () => setActiveTab("posts")],
          ].map(([n, label, fn], idx, arr) => (
            <div
              key={label}
              onClick={fn}
              style={{
                flex: 1, textAlign: "center", padding: "14px 8px", cursor: "pointer",
                borderRight: idx < arr.length - 1 ? "1px solid var(--color-surface-high)" : "none",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--color-primary)", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["about", "posts"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "10px", borderRadius: 14,
                border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                fontSize: 13, fontWeight: 700,
                background: activeTab === tab ? "var(--color-primary)" : "#fff",
                color: activeTab === tab ? "#fff" : "var(--color-text-soft)",
                boxShadow: "0 2px 8px rgba(91,60,221,0.07)",
                transition: "all 0.15s",
              }}
            >
              {tab === "about" ? "About" : `Posts (${myPosts.length})`}
            </button>
          ))}
        </div>

        {/* ── ABOUT TAB ── */}
        {activeTab === "about" && (
          <>
            {/* About me */}
            <SectionCard>
              <SectionTitle>About me</SectionTitle>
              {editing ? (
                <>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell the community a little about you…"
                    style={{ ...inp, borderRadius: 14, resize: "none", minHeight: 80, marginBottom: 10 }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input value={age} onChange={e => setAge(e.target.value)} type="number" placeholder="Age" style={{ ...inp, width: "30%" }} onFocus={focusIn} onBlur={focusOut} />
                    <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={{ ...inp, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Region" style={{ ...inp, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <Toggle value={showLocation} onChange={setShowLocation} label="Show location on profile" sub="City/region only — never exact address" />
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: bio ? "var(--color-text)" : "var(--color-text-soft)", lineHeight: 1.65, margin: "0 0 10px", fontStyle: bio ? "normal" : "italic" }}>
                    {bio || "No bio yet — tap Edit profile to add one"}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {profile?.age && (
                      <span style={{ fontSize: 12, background: "var(--color-surface-low)", borderRadius: 999, padding: "4px 12px", color: "var(--color-text-soft)" }}>
                        🎂 {profile.age} years old
                      </span>
                    )}
                    {showLocation && (city || region) && (
                      <span style={{ fontSize: 12, background: "var(--color-surface-low)", borderRadius: 999, padding: "4px 12px", color: "var(--color-text-soft)" }}>
                        📍 {[city, region].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </>
              )}
            </SectionCard>

            {/* Interests */}
            {(editing || showInterests) && (
              <SectionCard>
                <SectionTitle>Interests</SectionTitle>
                {editing ? (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {INTERESTS.map(i => {
                        const active = interests.includes(i.key);
                        return (
                          <button key={i.key} onClick={() => toggleInterest(i.key)} style={{
                            padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                            border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                            background: active ? i.color : "#fff",
                            color: active ? "#fff" : "var(--color-text-soft)",
                            boxShadow: active ? `0 3px 10px ${i.color}44` : "0 1px 6px rgba(0,0,0,0.07)",
                            transition: "all 0.15s",
                          }}>
                            {i.emoji} {i.label}
                          </button>
                        );
                      })}
                    </div>
                    <Toggle value={showInterests} onChange={setShowInterests} label="Show interests on profile" />
                  </>
                ) : (
                  myInterestData.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {myInterestData.map(i => (
                        <span key={i.key} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: i.bg, color: i.color }}>
                          {i.emoji} {i.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--color-text-soft)", margin: 0 }}>No interests added yet</p>
                  )
                )}
              </SectionCard>
            )}

            {/* Aspirations */}
            {(editing || (showGoals && goalsPublic)) && (
              <SectionCard>
                <SectionTitle>What I'm working toward</SectionTitle>
                {editing ? (
                  <>
                    <textarea
                      value={goalsPublic}
                      onChange={e => setGoalsPublic(e.target.value)}
                      placeholder="Share your public goals or aspirations…"
                      style={{ ...inp, borderRadius: 14, resize: "none", minHeight: 70, marginBottom: 10 }}
                      onFocus={focusIn} onBlur={focusOut}
                    />
                    <Toggle value={showGoals} onChange={setShowGoals} label="Show on profile" />
                  </>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.65, margin: 0 }}>{goalsPublic}</p>
                )}
              </SectionCard>
            )}

            {/* Groups */}
            {(editing || showGroups) && groups.length > 0 && (
              <SectionCard>
                <SectionTitle>My communities</SectionTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: editing ? 10 : 0 }}>
                  {groups.map(g => (
                    <span key={g.id} onClick={() => navigate(`/groups/${g.id}`)} style={{
                      fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999,
                      background: g.color ? `${g.color}18` : "var(--color-primary-fixed)",
                      color: g.color || "var(--color-primary)",
                      cursor: "pointer",
                    }}>
                      {g.name}
                    </span>
                  ))}
                </div>
                {editing && <Toggle value={showGroups} onChange={setShowGroups} label="Show communities on profile" />}
              </SectionCard>
            )}

            {/* Activities */}
            {(editing || showActivities) && activities.length > 0 && (
              <SectionCard>
                <SectionTitle>Upcoming activities</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: editing ? 10 : 0 }}>
                  {activities.map(a => {
                    const interest = INTERESTS.find(i => i.key === a.topic);
                    return (
                      <div key={a.id} onClick={() => navigate("/meet")} style={{
                        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                        padding: "10px 12px", borderRadius: 14,
                        background: interest ? interest.bg : "var(--color-surface-low)",
                        border: `1px solid ${interest ? interest.color + "33" : "var(--color-outline-variant)"}`,
                      }}>
                        <span style={{ fontSize: 20 }}>{interest?.emoji || "📍"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>{a.title}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>
                            {formatActivityDate(a.activity_date)} · {a.location}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {editing && <Toggle value={showActivities} onChange={setShowActivities} label="Show activities on profile" />}
              </SectionCard>
            )}

            {/* Achievements */}
            {badges.length > 0 && (
              <SectionCard>
                <SectionTitle>Achievements</SectionTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {badges.map(b => <AchievementBadge key={b.id} badge={b} />)}
                </div>
              </SectionCard>
            )}

            {/* Privacy */}
            <SectionCard>
              <SectionTitle>Privacy</SectionTitle>
              <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginBottom: 12 }}>Who can see your profile?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {Object.entries(visibilityLabels).map(([key, { icon, label, sub }]) => (
                  <div key={key} onClick={() => { setVisibility(key); if (!editing) updateProfile(user.id, { profile_visibility: key }).catch(() => {}); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      borderRadius: 14, cursor: "pointer",
                      background: visibility === key ? "var(--color-primary-fixed)" : "var(--color-surface-low)",
                      border: visibility === key ? "1.5px solid var(--color-primary)" : "1.5px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: visibility === key ? "var(--color-primary)" : "var(--color-text)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-soft)" }}>{sub}</div>
                    </div>
                    {visibility === key && <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>check_circle</span>}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-soft)", lineHeight: 1.6, padding: "8px 0" }}>
                🔒 Mood, journal entries, and emotional check-ins are always private.
              </div>
            </SectionCard>

            {/* Actions */}
            <SectionCard>
              <button onClick={() => navigate("/my-space")} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                background: "none", border: "none", padding: "10px 0", cursor: "pointer",
                borderBottom: "1px solid var(--color-surface-high)",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>self_improvement</span>
                <span style={{ fontSize: 14, color: "var(--color-text)", fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>My Space 🔒</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-text-soft)", marginLeft: "auto" }}>chevron_right</span>
              </button>
              <button onClick={() => navigate("/help-center")} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                background: "none", border: "none", padding: "10px 0", cursor: "pointer",
                borderBottom: "1px solid var(--color-surface-high)",
              }}>
                <Shield size={18} color="var(--color-primary)" />
                <span style={{ fontSize: 14, color: "var(--color-text)", fontFamily: "Rubik, sans-serif" }}>Safety & Help Center</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-text-soft)", marginLeft: "auto" }}>chevron_right</span>
              </button>
              <button onClick={() => signOut().then(() => navigate("/"))} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                background: "none", border: "none", padding: "10px 0 0", cursor: "pointer",
              }}>
                <LogOut size={18} color="var(--color-error)" />
                <span style={{ fontSize: 14, color: "var(--color-error)", fontFamily: "Rubik, sans-serif" }}>Log out</span>
              </button>
            </SectionCard>
          </>
        )}

        {/* ── POSTS TAB ── */}
        {activeTab === "posts" && (
          <>
            {myPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✍️</div>
                <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.6 }}>
                  You haven't posted yet.<br />Share something with the community!
                </p>
                <button
                  onClick={() => navigate("/new-post")}
                  style={{
                    marginTop: 16, background: "var(--color-primary)", color: "#fff",
                    border: "none", borderRadius: 999, padding: "10px 24px",
                    fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif",
                  }}
                >
                  Write a post
                </button>
              </div>
            ) : (
              myPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onChanged={() => fetchUserPosts(user.id).then(setMyPosts).catch(() => {})}
                />
              ))
            )}
          </>
        )}

      </div>
    </div>
  );
}
