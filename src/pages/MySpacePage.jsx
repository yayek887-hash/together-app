import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import {
  logMood, fetchTodayMood, fetchMoodHistory,
  saveJournalEntry, fetchTodayEntry,
  fetchGoals, addGoal, toggleGoal, deleteGoal,
} from "../lib/api.js";

/* ── Constants ── */

const MOODS = [
  { key: "happy",   emoji: "😊", label: "Happy",   color: "#fbbf24" },
  { key: "calm",    emoji: "😌", label: "Calm",    color: "#34d399" },
  { key: "sad",     emoji: "😔", label: "Sad",     color: "#60a5fa" },
  { key: "anxious", emoji: "😰", label: "Anxious", color: "#f97316" },
  { key: "angry",   emoji: "😠", label: "Angry",   color: "#f87171" },
  { key: "tired",   emoji: "🥱", label: "Tired",   color: "#a78bfa" },
];

const MOOD_MAP = Object.fromEntries(MOODS.map(m => [m.key, m]));

const VISIBILITY = [
  { key: "private", label: "Only me 🔒" },
  { key: "trusted", label: "Trusted 🤝" },
  { key: "friends", label: "Friends 💜" },
];

const AFFIRMATIONS = [
  { text: "You are exactly where you need to be.", emoji: "🌱" },
  { text: "Every small step forward is still progress.", emoji: "✨" },
  { text: "Your feelings are valid. You matter.", emoji: "💜" },
  { text: "Rest is productive too.", emoji: "🌙" },
  { text: "You've overcome hard things before.", emoji: "💪" },
  { text: "Be kind to yourself today.", emoji: "🤍" },
  { text: "Growth happens in the quiet moments.", emoji: "🌿" },
  { text: "You don't have to have it all figured out.", emoji: "🌊" },
  { text: "Today is a new beginning.", emoji: "🌅" },
  { text: "Your presence matters more than you know.", emoji: "⭐" },
  { text: "It's okay to take things one breath at a time.", emoji: "🫧" },
  { text: "You are doing better than you think.", emoji: "🎯" },
  { text: "Strength doesn't mean never struggling.", emoji: "🔥" },
];

const PHASES = [
  ["Breathe in",  4],
  ["Hold",        4],
  ["Breathe out", 4],
  ["Hold",        4],
];

/* ── Helpers ── */

function todayAffirmation() {
  const idx = Math.floor(Date.now() / 86400000) % AFFIRMATIONS.length;
  return AFFIRMATIONS[idx];
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({
      key: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      isToday: i === 0,
    });
  }
  return days;
}

/* ── Breathing Exercise ── */

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
  const big = phaseIdx === 0 || phaseIdx === 1;

  return (
    <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
      <div style={{
        width: 110, height: 110, borderRadius: "50%",
        margin: "0 auto 18px",
        background: "linear-gradient(135deg, #0d9488 0%, #99f6e4 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 42,
        transform: running ? (big ? "scale(1.28)" : "scale(1)") : "scale(1)",
        transition: `transform ${duration}s ease-in-out`,
        boxShadow: "0 0 0 12px rgba(13,148,136,0.1), 0 0 0 24px rgba(13,148,136,0.05)",
      }}>
        🫧
      </div>

      {running ? (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d9488", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: "var(--color-text)", marginBottom: 18, letterSpacing: "-0.04em" }}>{count}</div>
          <button onClick={stop} style={ghostBtn}>Stop</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginBottom: 14 }}>Box breathing · 4-4-4-4</div>
          <button onClick={start} style={{ ...primaryBtn, background: "#0d9488" }}>Start breathing</button>
        </>
      )}
    </div>
  );
}

/* ── Style helpers ── */
const primaryBtn = { background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 999, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" };
const ghostBtn   = { background: "var(--color-surface-high)", color: "var(--color-text-soft)", border: "none", borderRadius: 999, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" };
const saveBtn    = (saved) => ({ background: saved ? "#d1fae5" : "var(--color-primary)", color: saved ? "#065f46" : "#fff", border: "none", borderRadius: 999, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif", transition: "all 0.2s" });
const inp        = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--color-outline-variant)", background: "var(--color-surface-low)", fontSize: 13, fontFamily: "Rubik, sans-serif", outline: "none", color: "var(--color-text)" };

function SectionCard({ accentColor, children, style = {} }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 14,
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      ...style,
    }}>
      <div style={{ height: 4, background: accentColor }} />
      <div style={{ padding: "16px 16px 18px" }}>
        {children}
      </div>
    </div>
  );
}

const sectionLbl = { fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14, display: "block" };

/* ── Main component ── */

export default function MySpacePage() {
  const navigate    = useNavigate();
  const { user, profile } = useAuth();
  const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "You";

  /* Mood */
  const [mood, setMood]             = useState(null);
  const [visibility, setVisibility] = useState("private");
  const [moodSaved, setMoodSaved]   = useState(false);
  const [moodHistory, setMoodHistory] = useState({});

  /* Journal */
  const [journal, setJournal]           = useState("");
  const [journalSaved, setJournalSaved] = useState(false);

  /* Gratitude */
  const [gratitude, setGratitude]           = useState(["", "", ""]);
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

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
    fetchMoodHistory(user.id, 7).then(setMoodHistory).catch(() => {});
  }, [user]);

  const flash = (setter) => { setter(true); setTimeout(() => setter(false), 2200); };

  const handleSaveMood = async () => {
    if (!mood) return;
    await logMood(user.id, mood, visibility).catch(() => {});
    setMoodHistory(h => ({ ...h, [new Date().toISOString().split("T")[0]]: mood }));
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
  const greeting = hour < 5 ? "Still up?" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
  const affirmation = todayAffirmation();
  const days = last7Days();
  const completedGoals = goals.filter(g => g.completed).length;

  return (
    <div className="page-scroll scrollbar-none anim-in" style={{ paddingBottom: 100 }}>

      {/* ── Header banner ── */}
      <div style={{
        background: "linear-gradient(160deg, #1a0533 0%, #2d1b69 55%, #3b2480 100%)",
        padding: "28px 18px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative stars */}
        {["10% 20%", "80% 15%", "55% 60%", "25% 75%", "90% 50%", "45% 30%"].map((pos, i) => (
          <div key={i} style={{
            position: "absolute", top: pos.split(" ")[1], left: pos.split(" ")[0],
            width: i % 2 === 0 ? 3 : 2, height: i % 2 === 0 ? 3 : 2,
            borderRadius: "50%", background: "rgba(255,255,255,0.5)",
          }} />
        ))}

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
              My Space 🌙
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              {greeting}, {displayName} — this is just for you.
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }}>lock</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Private</span>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {[
            { label: "Goals done", value: `${completedGoals}/${goals.length}`, icon: "🎯" },
            { label: "Mood logged", value: mood ? MOOD_MAP[mood]?.emoji : "—", icon: null },
            { label: "Days journaled", value: Object.keys(moodHistory).length, icon: "📅" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14,
              padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: s.icon ? 16 : 20, fontWeight: 900, color: "#fff" }}>
                {s.icon ? `${s.icon} ${s.value}` : s.value}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ── Daily affirmation ── */}
        <div style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          borderRadius: 20, padding: "16px 18px",
          marginBottom: 14,
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
        }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>{affirmation.emoji}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
              Today's affirmation
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>
              {affirmation.text}
            </div>
          </div>
        </div>

        {/* ── Mood history strip ── */}
        <SectionCard accentColor="linear-gradient(90deg, #5b3cdd, #a78bfa)">
          <span style={sectionLbl}>Your week</span>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
            {days.map(d => {
              const m = moodHistory[d.key];
              const moodMeta = m ? MOOD_MAP[m] : null;
              return (
                <div key={d.key} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: d.isToday ? "var(--color-primary)" : "var(--color-text-soft)", marginBottom: 6, textTransform: "uppercase" }}>
                    {d.label}
                  </div>
                  <div style={{
                    width: "100%", aspectRatio: "1", borderRadius: "50%",
                    background: moodMeta ? `${moodMeta.color}22` : "var(--color-surface-low)",
                    border: d.isToday ? "2px solid var(--color-primary)" : `2px solid ${moodMeta ? moodMeta.color + "44" : "transparent"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: moodMeta ? 16 : 12,
                    margin: "0 auto",
                    maxWidth: 36,
                  }}>
                    {moodMeta ? moodMeta.emoji : <span style={{ color: "var(--color-outline)", fontSize: 10 }}>·</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Mood check-in ── */}
        <SectionCard accentColor="linear-gradient(90deg, #5b3cdd, #818cf8)">
          <span style={sectionLbl}>How are you feeling today?</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>
            {MOODS.map(m => (
              <button key={m.key} onClick={() => setMood(m.key)} style={{
                background: mood === m.key ? `${m.color}22` : "transparent",
                border: `2px solid ${mood === m.key ? m.color : "var(--color-outline-variant)"}`,
                borderRadius: 14, padding: "8px 4px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 24 }}>{m.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: mood === m.key ? m.color : "var(--color-text-soft)" }}>{m.label}</span>
              </button>
            ))}
          </div>

          {mood && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.07em", marginBottom: 8 }}>WHO SEES THIS?</div>
              <div style={{ display: "flex", gap: 6 }}>
                {VISIBILITY.map(v => (
                  <button key={v.key} onClick={() => setVisibility(v.key)} style={{
                    padding: "7px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    border: "none", cursor: "pointer", fontFamily: "Rubik, sans-serif",
                    background: visibility === v.key ? "var(--color-primary)" : "var(--color-surface-low)",
                    color: visibility === v.key ? "#fff" : "var(--color-text-soft)",
                    transition: "all 0.15s", flex: 1,
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
        </SectionCard>

        {/* ── Journal ── */}
        <SectionCard accentColor="linear-gradient(90deg, #f59e0b, #fcd34d)">
          <span style={sectionLbl}>Today's reflection ✍️</span>
          <textarea
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="Write what's on your mind today… this is just for you."
            style={{ ...inp, borderRadius: 16, minHeight: 110, resize: "none", lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = "#f59e0b"}
            onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
          />
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--color-text-soft)" }}>🔒 Only you can see this</span>
            <button onClick={handleSaveJournal} style={{ ...saveBtn(journalSaved), background: journalSaved ? "#d1fae5" : "#f59e0b", color: journalSaved ? "#065f46" : "#fff" }}>
              {journalSaved ? "✅ Saved!" : "Save"}
            </button>
          </div>
        </SectionCard>

        {/* ── Gratitude ── */}
        <SectionCard accentColor="linear-gradient(90deg, #d97706, #fbbf24)">
          <span style={sectionLbl}>3 things I'm grateful for today 🌟</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {gratitude.map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #d97706, #fbbf24)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff",
                }}>{i + 1}</div>
                <input
                  value={g}
                  onChange={e => setGratitude(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                  placeholder={`I'm grateful for…`}
                  style={{ ...inp, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = "#d97706"}
                  onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
                />
              </div>
            ))}
          </div>
          <button onClick={handleSaveGratitude} style={{ ...saveBtn(gratitudeSaved), background: gratitudeSaved ? "#d1fae5" : "#d97706", color: gratitudeSaved ? "#065f46" : "#fff" }}>
            {gratitudeSaved ? "✅ Saved!" : "Save gratitude"}
          </button>
        </SectionCard>

        {/* ── Breathing ── */}
        <SectionCard accentColor="linear-gradient(90deg, #0d9488, #5eead4)">
          <span style={sectionLbl}>Breathing exercise 🌬️</span>
          <BreathingExercise />
        </SectionCard>

        {/* ── Goals ── */}
        <SectionCard accentColor="linear-gradient(90deg, #059669, #34d399)" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-soft)", letterSpacing: "0.07em", textTransform: "uppercase" }}>My personal goals 🎯</span>
            {goals.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>{completedGoals}/{goals.length} done</span>
            )}
          </div>

          {goals.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--color-text-soft)", marginBottom: 14, margin: "0 0 14px" }}>
              No goals yet — set your first one below.
            </p>
          )}

          {goals.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-surface-low)" }}>
              <div
                onClick={() => handleToggleGoal(g.id, !g.completed)}
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${g.completed ? "#059669" : "var(--color-outline-variant)"}`,
                  background: g.completed ? "#059669" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {g.completed && <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#fff" }}>check</span>}
              </div>
              <span style={{ flex: 1, fontSize: 13, color: g.completed ? "var(--color-text-soft)" : "var(--color-text)", textDecoration: g.completed ? "line-through" : "none" }}>
                {g.title}
              </span>
              <button onClick={() => handleDeleteGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-outline)", display: "flex", padding: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
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
              onFocus={e => e.target.style.borderColor = "#059669"}
              onBlur={e => e.target.style.borderColor = "var(--color-outline-variant)"}
            />
            <button onClick={handleAddGoal} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Rubik, sans-serif" }}>
              Add
            </button>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
