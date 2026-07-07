import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { INTERESTS } from "../data/inspireContent.js";
import { createActivity } from "../lib/api.js";

export default function CreateActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [topic, setTopic]         = useState(null);
  const [location, setLocation]   = useState("");
  const [date, setDate]           = useState("");
  const [maxPeople, setMaxPeople] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  // min date = now (for datetime-local input)
  const minDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

  const valid = title.trim() && location.trim() && date;

  const handleCreate = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createActivity({
        creatorId: user.id,
        title: title.trim(),
        description: description.trim() || null,
        topic,
        location: location.trim(),
        activityDate: new Date(date).toISOString(),
        maxParticipants: parseInt(maxPeople) || 10,
      });
      navigate("/meet");
    } catch (err) {
      setError(err.message || "Couldn't create activity — please try again.");
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "13px 16px", borderRadius: 16,
    border: "1.5px solid var(--color-outline-variant)",
    background: "#fff", fontSize: 14,
    fontFamily: "Rubik, sans-serif", outline: "none",
    color: "var(--color-text)",
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "var(--color-text-soft)", letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 8,
  };

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>
      <TopBar title="New Activity" showBack />

      <div style={{ padding: "4px 16px 0" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginBottom: 24, lineHeight: 1.5 }}>
          Invite your community to meet in real life 📍
        </div>

        {/* Title */}
        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>What's the activity?</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Morning run in the park"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={e  => (e.target.style.borderColor = "var(--color-outline-variant)")}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>Description (optional)</span>
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Tell people what to expect, what to bring..."
            style={{ ...inputStyle, borderRadius: 16, resize: "none", minHeight: 90 }}
            onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={e  => (e.target.style.borderColor = "var(--color-outline-variant)")}
          />
        </div>

        {/* Topic */}
        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>Category (optional)</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map(i => {
              const active = topic === i.key;
              return (
                <button
                  key={i.key}
                  onClick={() => setTopic(active ? null : i.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                    background: active ? i.color : "#fff",
                    color: active ? "#fff" : "var(--color-text-soft)",
                    boxShadow: active ? `0 4px 10px ${i.color}44` : "0 2px 6px rgba(0,0,0,0.06)",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{i.emoji}</span> {i.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>Location</span>
          <div style={{ position: "relative" }}>
            <span className="material-symbols-outlined" style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 18, color: "var(--color-primary)",
            }}>location_on</span>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Address or place name"
              style={{ ...inputStyle, paddingLeft: 38 }}
              onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={e  => (e.target.style.borderColor = "var(--color-outline-variant)")}
            />
          </div>
        </div>

        {/* Date & time */}
        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>Date & time</span>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={minDate}
            style={{ ...inputStyle, colorScheme: "light" }}
            onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={e  => (e.target.style.borderColor = "var(--color-outline-variant)")}
          />
        </div>

        {/* Max participants */}
        <div style={{ marginBottom: 24 }}>
          <span style={labelStyle}>Max participants</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["5","10","20","50"].map(n => (
              <button
                key={n}
                onClick={() => setMaxPeople(n)}
                style={{
                  padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                  border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                  background: maxPeople === n ? "var(--color-primary)" : "#fff",
                  color: maxPeople === n ? "#fff" : "var(--color-text-soft)",
                  boxShadow: maxPeople === n ? "var(--shadow-button)" : "0 2px 6px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                }}
              >
                {n} people
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        <PrimaryButton disabled={!valid || submitting} onClick={handleCreate}>
          {submitting ? "Creating…" : "Create activity 📍"}
        </PrimaryButton>
      </div>
    </div>
  );
}
