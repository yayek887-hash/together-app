import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createGroup } from "../lib/api.js";

const CATEGORIES = [
  { label: "Friendship", emoji: "🤝" },
  { label: "School",     emoji: "📚" },
  { label: "Anxiety",    emoji: "💜" },
  { label: "Gaming",     emoji: "🎮" },
  { label: "Art",        emoji: "🎨" },
  { label: "Sports",     emoji: "⚽" },
  { label: "Study",      emoji: "📖" },
  { label: "Mental Health", emoji: "🌱" },
  { label: "Music",      emoji: "🎵" },
  { label: "Books",      emoji: "📕" },
  { label: "LGBTQ+",     emoji: "🌈" },
  { label: "Other",      emoji: "✨" },
];

const field = { marginBottom: 20 };
const label = { fontSize: 12, fontWeight: 700, color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 };
const input = { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", fontSize: 14, fontFamily: "Rubik, sans-serif", outline: "none", color: "var(--color-text)" };

async function reverseGeocode(lat, lon) {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { headers: { "Accept-Language": "en" } });
  const d = await r.json();
  const a = d.address || {};
  return a.city || a.town || a.village || a.county || a.state || "";
}

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [category, setCategory]   = useState("");
  const [privacy, setPrivacy]     = useState("public");
  const [minAge, setMinAge]       = useState(10);
  const [maxAge, setMaxAge]       = useState(18);
  const [city, setCity]           = useState("");
  const [region, setRegion]       = useState("");
  const [rules, setRules]                     = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [geoLoading, setGeoLoading]           = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState(null);

  const canSubmit = name.trim().length >= 3 && category && !submitting;

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

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const g = await createGroup({ name: name.trim(), description: desc.trim(), category, privacy, minAge: Number(minAge), maxAge: Number(maxAge), city, region, rules, meetingLocation, meetingSchedule, ownerId: user.id });
      navigate(`/groups/${g.id}`);
    } catch (err) {
      setError(err.message || "Couldn't create the group — try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>
      <TopBar title="Create a community" showBack />
      <div style={{ padding: "4px 16px 0" }}>

        {/* Intro */}
        <div style={{ background: "linear-gradient(135deg, #f0ebff 0%, #e8f4ff 100%)", borderRadius: 20, padding: "16px 18px", marginBottom: 24, border: "1.5px solid rgba(91,60,221,0.12)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>Build a space that belongs to you 💜</div>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.6 }}>Your community will be a safe place for people who share your interests or experiences.</div>
        </div>

        {/* Name */}
        <div style={field}>
          <span style={label}>Community name *</span>
          <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Art Lovers, Anxiety Support..." maxLength={60}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 5, textAlign: "right" }}>{name.length}/60</div>
        </div>

        {/* Description */}
        <div style={field}>
          <span style={label}>Description</span>
          <textarea style={{ ...input, minHeight: 90, resize: "none" }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this community about? Who is it for?" maxLength={300}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        {/* Category */}
        <div style={field}>
          <span style={label}>Category *</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => setCategory(c.label)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: category === c.label ? 700 : 500, fontFamily: "Rubik, sans-serif", cursor: "pointer", border: "1.5px solid", borderColor: category === c.label ? "var(--color-primary)" : "var(--color-outline-variant)", background: category === c.label ? "var(--color-primary-fixed)" : "var(--color-surface-low)", color: category === c.label ? "var(--color-primary)" : "var(--color-text-soft)", transition: "all 0.15s" }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div style={field}>
          <span style={label}>Privacy</span>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ v: "public", icon: "🌍", title: "Public", sub: "Anyone can join instantly" }, { v: "private", icon: "🔒", title: "Private", sub: "You approve each member" }].map(opt => (
              <div key={opt.v} onClick={() => setPrivacy(opt.v)}
                style={{ flex: 1, padding: "14px 14px", borderRadius: 18, border: `1.5px solid ${privacy === opt.v ? "var(--color-primary)" : "var(--color-outline-variant)"}`, background: privacy === opt.v ? "var(--color-primary-fixed)" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: privacy === opt.v ? "var(--color-primary)" : "var(--color-text)" }}>{opt.title}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 2 }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Age range */}
        <div style={field}>
          <span style={label}>Age range</span>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="number" style={{ ...input, width: 80 }} value={minAge} min={8} max={17} onChange={e => setMinAge(e.target.value)}
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
            <span style={{ color: "var(--color-text-soft)", fontSize: 14 }}>to</span>
            <input type="number" style={{ ...input, width: 80 }} value={maxAge} min={9} max={18} onChange={e => setMaxAge(e.target.value)}
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
            <span style={{ color: "var(--color-text-soft)", fontSize: 14 }}>years</span>
          </div>
        </div>

        {/* Location (optional) */}
        <div style={field}>
          <span style={label}>Location (optional)</span>
          <input style={{ ...input, marginBottom: 10 }} value={city} onChange={e => setCity(e.target.value)} placeholder="City (e.g. Tel Aviv)"
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
          <input style={input} value={region} onChange={e => setRegion(e.target.value)} placeholder="Region / State (e.g. Center District)"
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 6 }}>📍 Only city/region — never exact address</div>
        </div>

        {/* Meeting info */}
        <div style={field}>
          <span style={label}>Meeting location (optional)</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...input, flex: 1 }} value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)} placeholder="e.g. Tel Aviv Community Center"
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
          <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 6 }}>📍 Tap the pin to auto-detect your location</div>
        </div>

        <div style={field}>
          <span style={label}>Meeting schedule (optional)</span>
          <input style={input} value={meetingSchedule} onChange={e => setMeetingSchedule(e.target.value)} placeholder="e.g. Every Tuesday at 18:00"
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        {/* Rules */}
        <div style={field}>
          <span style={label}>Community rules (optional)</span>
          <textarea style={{ ...input, minHeight: 80, resize: "none" }} value={rules} onChange={e => setRules(e.target.value)} placeholder="e.g. Be kind, no judgement, support each other..." maxLength={500}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"} />
        </div>

        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 14 }}>{error}</p>}

        <PrimaryButton disabled={!canSubmit} onClick={handleCreate}>
          {submitting ? "Creating…" : "Create community 🌱"}
        </PrimaryButton>

      </div>
    </div>
  );
}
