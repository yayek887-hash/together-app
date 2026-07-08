import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchGroup, updateGroup, deleteGroup } from "../lib/api.js";

const CATEGORIES = ["Friendship","School","Anxiety","Gaming","Art","Sports","Study","Mental Health","Music","Books","LGBTQ+","Other"];
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", fontSize: 14, fontFamily: "Rubik, sans-serif", outline: "none", color: "var(--color-text)" };
const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 };

async function reverseGeocode(lat, lon) {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { headers: { "Accept-Language": "en" } });
  const d = await r.json();
  const a = d.address || {};
  return a.city || a.town || a.village || a.county || a.state || "";
}

export default function GroupManagePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);

  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [category, setCategory] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [minAge, setMinAge]   = useState(10);
  const [maxAge, setMaxAge]   = useState(18);
  const [city, setCity]             = useState("");
  const [region, setRegion]         = useState("");
  const [rules, setRules]           = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const g = await fetchGroup(groupId);
      if (g.owner_id !== user?.id) { navigate(`/groups/${groupId}`); return; }
      setGroup(g);
      setName(g.name || "");
      setDesc(g.description || "");
      setCategory(g.category || "");
      setPrivacy(g.privacy || "public");
      setMinAge(g.min_age || 10);
      setMaxAge(g.max_age || 18);
      setCity(g.city || "");
      setRegion(g.region || "");
      setRules(g.rules || "");
      setMeetingLocation(g.meeting_location || "");
      setMeetingSchedule(g.meeting_schedule || "");
    } catch {}
    finally { setLoading(false); }
  }, [groupId, user, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (city) setMeetingLocation(city);
        } catch {}
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateGroup(groupId, { name: name.trim(), description: desc.trim(), category, privacy, min_age: Number(minAge), max_age: Number(maxAge), city: city || null, region: region || null, rules: rules || null, meeting_location: meetingLocation || null, meeting_schedule: meetingSchedule || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteGroup(groupId);
      navigate("/groups");
    } catch (err) {
      setError(err.message || "Couldn't delete the group.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="Manage community" showBack />
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    </div>
  );

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>
      <TopBar title="Manage community" showBack />
      <div style={{ padding: "4px 16px 0" }}>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Community name</span>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} maxLength={60}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Description</span>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "none" }} value={desc} onChange={e => setDesc(e.target.value)} maxLength={300}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Category</span>
          <select style={{ ...inputStyle, appearance: "none" }} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Privacy</span>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ v: "public", label: "🌍 Public" }, { v: "private", label: "🔒 Private" }].map(opt => (
              <button key={opt.v} onClick={() => setPrivacy(opt.v)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: `1.5px solid ${privacy === opt.v ? "var(--color-primary)" : "var(--color-outline-variant)"}`, background: privacy === opt.v ? "var(--color-primary-fixed)" : "var(--color-surface-low)", fontSize: 13, fontWeight: privacy === opt.v ? 700 : 500, color: privacy === opt.v ? "var(--color-primary)" : "var(--color-text-soft)", cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Age range</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="number" style={{ ...inputStyle, width: 80 }} value={minAge} min={8} max={17} onChange={e => setMinAge(e.target.value)} />
            <span style={{ color: "var(--color-text-soft)" }}>to</span>
            <input type="number" style={{ ...inputStyle, width: 80 }} value={maxAge} min={9} max={18} onChange={e => setMaxAge(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Location (optional)</span>
          <input style={{ ...inputStyle, marginBottom: 10 }} value={city} onChange={e => setCity(e.target.value)} placeholder="City"
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
          <input style={inputStyle} value={region} onChange={e => setRegion(e.target.value)} placeholder="Region"
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        {/* Meeting info */}
        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Meeting location (optional)</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)} placeholder="e.g. Tel Aviv Community Center"
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
            <button onClick={handleGeolocate} disabled={geoLoading}
              title="Detect my location"
              style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 14, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", cursor: geoLoading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: geoLoading ? "var(--color-text-soft)" : "var(--color-primary)" }}>
                {geoLoading ? "hourglass_empty" : "my_location"}
              </span>
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Meeting schedule (optional)</span>
          <input style={inputStyle} value={meetingSchedule} onChange={e => setMeetingSchedule(e.target.value)} placeholder="e.g. Every Tuesday at 18:00"
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <span style={labelStyle}>Community rules</span>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "none" }} value={rules} onChange={e => setRules(e.target.value)} placeholder="Rules for your community..." maxLength={500}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 14 }}>{error}</p>}
        {saved && <p style={{ color: "#0F6E56", fontSize: 13, marginBottom: 14 }}>✅ Changes saved!</p>}

        <PrimaryButton disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </PrimaryButton>

        {/* Danger zone */}
        <div style={{ marginTop: 32, borderTop: "1.5px solid var(--color-outline-variant)", paddingTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-error)", marginBottom: 12 }}>⚠️ Danger zone</div>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              style={{ background: "none", border: "1.5px solid var(--color-error)", borderRadius: 14, padding: "11px 20px", color: "var(--color-error)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", width: "100%" }}>
              Delete this community
            </button>
          ) : (
            <div style={{ background: "#fff1f2", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #fecdd3" }}>
              <p style={{ fontSize: 13, color: "#7f1d1d", marginBottom: 12, lineHeight: 1.6 }}>This will permanently delete the community and remove all members. This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ flex: 1, background: "var(--color-error)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                  {deleting ? "Deleting…" : "Yes, delete it"}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ flex: 1, background: "none", border: "1.5px solid var(--color-outline-variant)", borderRadius: 12, padding: "11px 0", fontSize: 13, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
