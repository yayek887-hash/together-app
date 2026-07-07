import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import {
  logMood, fetchTodayMood,
  saveJournalEntry, fetchTodayEntry,
  fetchGoals, addGoal, toggleGoal, deleteGoal,
} from "../lib/api.js";

const MOODS = [
  { key: "happy",   emoji: "😊", label: "Happy" },
  { key: "calm",    emoji: "😌", label: "Calm" },
  { key: "sad",     emoji: "😔", label: "Sad" },
  { key: "anxious", emoji: "😰", label: "Anxious" },
  { key: "angry",   emoji: "😠", label: "Angry" },
  { key: "tired",   emoji: "🥱", label: "Tired" },
];

const VISIBILITY = [
  { key: "private",  label: "Only me 🔒" },
  { key: "trusted",  label: "Trusted 🤝" },
  { key: "friends",  label: "Friends 💜" },
];

// Box breathing: [label, seconds]
const PHASES = [
  ["Breathe in",  4],
  ["Hold",        4],
  ["Breathe out", 4],
  ["Hold",        4],
];

function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount]     = useState(PHASES[0][1]);
  const ref = useRef({ phaseIdx: 0, count: PHASES[0][1] });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const { phaseIdx: p, count: c } = ref.current;
      if (c <= 1) {
        const next = (p + 1) % PHASES.length;
        ref.current = { phaseIdx: next, count: PHASES[next][1] };
        setPhaseIdx(next);
        setCount(PHASES[next][1]);
      } else {
        ref.current = { phaseIdx: p, count: c - 1 };
        setCount(c - 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const stop = () => {
    setRunning(false);
    ref.current = { phaseIdx: 0, count: PHASES[0][1] };
    setPhaseIdx(0);
    setCount(PHASES[0][1]);
  };

  const start = () => {
    ref.current = { phaseIdx: 0, count: PHASES[0][1] };
    setPhaseIdx(0);
    setCount(PHASES[0][1]);
    setRunning(true);
  };

  const [label, duration] = PHASES[phaseIdx];
  // Scale: big on breathe-in & first hold, small on breathe-out & second hold
  const big = phaseIdx === 0 || phaseIdx === 1;

  return (
    <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        margin: "0 auto 20px",
        background: "linear-gradient(135deg, #c9bfff 0%, #e5deff 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 44,
        transform: running ? (big ? "scale(1.25)" : "scale(1)") : "scale(1)",
        transition: `transform ${duration}s ease-in-out`,
        boxShadow: "0 0 0 14px rgba(91,60,221,0.07), 0 0 0 28px rgba(91,60,221,0.03)",
      }}>
        🫧
      </div>

      {running ? (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--color-text)", marginBottom: 20 }}>{count}</div>
          <button onClick={stop} style={ghostBtn}>Stop</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginBottom: 14 }}>Box breathing · 4-4-4-4</div>
          <button onClick={start} style={primaryBtn}>Start breathing</button>
        </>
      )}
    </div>
  );
}

/* ── Shared style helpers ── */
const card        = { background: "#fff", borderRadius: 24, padding: "18px 16px", marginBottom: 14, boxShadow: "0 2px 14px rgba(91,60,221,0.07)" };
const sectionLbl  = { fontSize: 11, fontWeight: 700, color: "var(--color-text-soft)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12, display: "block" };
const primaryBtn  = { background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 999, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" };
const ghostBtn    = { background: "var(--color-surface-high)", color: "var(--color-text-soft)", border: "none", borderRadius: 999, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" };
const saveBtn     = (saved) => ({ background: saved ? "#d1fae5" : "var(--color-primary)", color: saved ? "#065f46" : "#fff", border: "none", borderRadius: 999, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", transition: "all 0.2s" });
const inp         = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none", color: "var(--color-text)" };

export default function MySpacePage() {
  const navigate   = useNavigate();
  const { user, profile } = useAuth();
  const displayName = profile?.username || user?.email?.split("@")[0] || "You";

  /* Mood */
  const [mood, setMood]             = useState(null);
  const [visibility, setVisibility] = useState("private");
  const [moodSaved, setMoodSaved]   = useState(false);

  /* Journal */
  const [journal, setJournal]           = useState("");
  const [journalSaved, setJournalSaved] = useState(false);

  /* Gratitude */
  const [gratitude, setGratitude]             = useState(["", "", ""]);
  const [gratitudeSaved, setGratitudeSaved]   = useState(false);

  /* Goals */
  const [goals, setGoals]     = useState([]);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchTodayMood(user.id).then(d => { if (d) { setMood(d.mood); setVisibility(d.visibility); } }).catch(() => {});
    fetchTodayEntry(user.id, "journal").then(d => { if (d) setJournal(d.content); }).catch(() => {});
    fetchTodayEntry(user.id, "gratitude").then(d => {
      if (d) { try { setGratitude(JSON.parse(d.content)); } catch {} }
    }).catch(() => {});
    fetchGoals(user.id).then(setGoals).catch(() => {});
  }, [user]);

  const flash = (setter) => { setter(true); setTimeout(() => setter(false), 2200); };

  const handleSaveMood = async () => {
    if (!mood) return;
    await logMood(user.id, mood, visibility).catch(() => {});
    flash(setMoodSaved);
  };

  const handleSaveJournal = async () => {
    if (!journal.trim()) return;
    await saveJournalEntry(user.id, journal, "journal").catch(() => {});
    flash(setJournalSaved);
  };

  const handleSaveGratitude = async () => {
    if (gratitude.every(g => !g.trim())) return;
    await saveJournalEntry(user.id, JSON.stringify(gratitude), "gratitude").catch(() => {});
    flash(setGratitudeSaved);
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    const g = await addGoal(user.id, newGoal.trim()).catch(() => null);
    if (g) { setGoals(gs => [...gs, g]); setNewGoal(""); }
  };

  const handleToggleGoal = async (goalId, completed) => {
    setGoals(gs => gs.map(g => g.id === goalId ? { ...g, completed } : g));
    await toggleGoal(goalId, completed).catch(() => {});
  };

  const handleDeleteGoal = async (goalId) => {
    setGoals(gs => gs.filter(g => g.id !== goalId));
    await deleteGoal(goalId).catch(() => {});
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-scroll scrollbar-none anim-in">

      {/* ── Header ── */}
      <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)" }}>My Space 🌙</div>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)", marginTop: 2 }}>{greeting}, {displayName} — this is just for you.</div>
        </div>
        <div onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <UserAvatar name={displayName} size={42} />
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ── Mood ── */}
        <div style={card}>
          <span style={sectionLbl}>How are you feeling today?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {MOODS.map(m => (
              <button key={m.key} onClick={() => setMood(m.key)} style={{
                background: mood === m.key ? "var(--color-primary-fixed)" : "transparent",
                border: `2px solid ${mood === m.key ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                borderRadius: 16, padding: "7px 6px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "all 0.15s", flex: "1 1 14%", minWidth: 44,
              }}>
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: mood === m.key ? "var(--color-primary)" : "var(--color-text-soft)" }}>{m.label}</span>
              </button>
            ))}
          </div>

          {mood && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-soft)", marginBottom: 8 }}>WHO SEES THIS?</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {VISIBILITY.map(v => (
                  <button key={v.key} onClick={() => setVisibility(v.key)} style={{
                    padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                    background: visibility === v.key ? "var(--color-primary)" : "var(--color-surface-low)",
                    color: visibility === v.key ? "#fff" : "var(--color-text-soft)",
                    transition: "all 0.15s",
                  }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSaveMood} disabled={!mood} style={{ ...saveBtn(moodSaved), opacity: !mood ? 0.4 : 1 }}>
            {moodSaved ? "✅ Saved!" : "Save mood"}
          </button>
        </div>

        {/* ── Journal ── */}
        <div style={card}>
          <span style={sectionLbl}>Today's reflection ✍️</span>
          <textarea
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="Write what's on your mind today... this is just for you."
            style={{ ...inp, borderRadius: 16, minHeight: 110, resize: "none", lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
          />
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--color-text-soft)" }}>🔒 Only you can see this</span>
            <button onClick={handleSaveJournal} style={saveBtn(journalSaved)}>
              {journalSaved ? "✅ Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* ── Gratitude ── */}
        <div style={card}>
          <span style={sectionLbl}>3 things I'm grateful for today 🌟</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {gratitude.map((g, i) => (
              <input
                key={i}
                value={g}
                onChange={e => setGratitude(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                placeholder={`${i + 1}. I'm grateful for…`}
                style={inp}
                onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
              />
            ))}
          </div>
          <button onClick={handleSaveGratitude} style={saveBtn(gratitudeSaved)}>
            {gratitudeSaved ? "✅ Saved!" : "Save gratitude"}
          </button>
        </div>

        {/* ── Breathing ── */}
        <div style={card}>
          <span style={sectionLbl}>Breathing exercise 🌬️</span>
          <BreathingExercise />
        </div>

        {/* ── Goals ── */}
        <div style={{ ...card, marginBottom: 40 }}>
          <span style={sectionLbl}>My personal goals 🎯</span>

          {goals.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--color-text-soft)", marginBottom: 12 }}>
              No goals yet — add your first one below.
            </p>
          )}

          {goals.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--color-surface-low)" }}>
              <input
                type="checkbox"
                checked={g.completed}
                onChange={e => handleToggleGoal(g.id, e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }}
              />
              <span style={{ flex: 1, fontSize: 14, color: g.completed ? "var(--color-text-soft)" : "var(--color-text)", textDecoration: g.completed ? "line-through" : "none" }}>
                {g.title}
              </span>
              <button onClick={() => handleDeleteGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-outline)", display: "flex", padding: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <input
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddGoal()}
              placeholder="Add a new goal…"
              style={{ ...inp, flex: 1 }}
              onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
            />
            <button onClick={handleAddGoal} style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
              Add
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
