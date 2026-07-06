import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeOff, Sparkles, Wand2 } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import MoodSelector from "../components/MoodSelector.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createPost, kindRewrite } from "../lib/api.js";
import { INTERESTS } from "../data/inspireContent.js";

export default function NewPostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText]           = useState("");
  const [mood, setMood]           = useState(null);
  const [topic, setTopic]         = useState(null);
  const [anon, setAnon]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const moodEmoji = { Happy: "😊", Calm: "😌", Sad: "😢", Anxious: "😰", Angry: "😡", Tired: "😴" }[mood] || null;

  const handlePublish = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createPost({ authorId: user.id, text: text.trim(), mood: moodEmoji, topic, isAnonymous: anon });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Couldn't publish your post — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKindRewrite = async () => {
    if (!text.trim() || aiLoading) return;
    setAiLoading(true);
    setAiSuggestion(null);
    setError(null);
    try {
      const kind = await kindRewrite(text.trim());
      setAiSuggestion(kind);
    } catch {
      setError("AI suggestion unavailable right now — try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="New Post" showBack />
      <div style={{ padding: "0 16px" }}>

        {/* Subtitle */}
        <div style={{ fontSize: 15, color: "var(--color-text-soft)", marginBottom: 14 }}>
          What's on your heart today?
        </div>

        {/* Text area */}
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your feelings, a win, or ask for support..."
          style={{ minHeight: 130, marginBottom: 12 }}
        />

        {/* ── AI: Help me write kindly ── */}
        {text.trim().length > 5 && !aiLoading && (
          <button
            onClick={handleKindRewrite}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e4f0ff 100%)",
              border: "1.5px solid var(--color-primary)",
              borderRadius: 999,
              padding: "9px 16px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-primary)",
              marginBottom: 12,
              fontFamily: "Rubik, sans-serif",
              transition: "all 0.15s",
            }}
          >
            <Wand2 size={15} />
            Help me write kindly ✨
          </button>
        )}

        {aiLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0 14px", color: "var(--color-primary)", fontSize: 13, fontWeight: 500 }}>
            <div className="loading-dots" style={{ margin: 0 }}><span /><span /><span /></div>
            Thinking of a kinder way to say this…
          </div>
        )}

        {/* AI suggestion card */}
        {aiSuggestion && (
          <div
            style={{
              background: "linear-gradient(135deg, var(--color-primary-fixed) 0%, #e8f4ff 100%)",
              borderRadius: 18,
              padding: "14px 16px",
              marginBottom: 14,
              border: "1.5px solid var(--color-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Sparkles size={13} color="var(--color-primary)" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Kinder version ✨
              </span>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.65, color: "var(--color-text)" }}>
              {aiSuggestion}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setText(aiSuggestion); setAiSuggestion(null); }}
                style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Rubik, sans-serif",
                }}
              >
                Use this ✓
              </button>
              <button
                onClick={() => setAiSuggestion(null)}
                style={{
                  background: "none",
                  color: "var(--color-text-soft)",
                  border: "1.5px solid var(--color-outline-variant)",
                  borderRadius: 999,
                  padding: "7px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "Rubik, sans-serif",
                }}
              >
                Keep mine
              </button>
            </div>
          </div>
        )}

        {/* Mood selector */}
        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>How are you feeling?</span>
        <div style={{ margin: "10px 0 18px" }}>
          <MoodSelector selected={mood} onSelect={setMood} />
        </div>

        {/* Topic selector */}
        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>Tag a topic (optional)</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 18px" }}>
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
                <span style={{ fontSize: 15 }}>{i.emoji}</span>
                {i.label}
              </button>
            );
          })}
        </div>

        {/* Anonymous toggle */}
        <div
          onClick={() => setAnon(!anon)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderRadius: 16,
            padding: 14,
            marginBottom: 18,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(91,60,221,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <EyeOff size={18} color="var(--color-primary)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Post anonymously</div>
              <div style={{ fontSize: 11, color: "var(--color-text-soft)", marginTop: 1 }}>Your name won't be shown</div>
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 24,
              borderRadius: 12,
              background: anon ? "var(--color-primary)" : "#E4E0F5",
              position: "relative",
              transition: "background .2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: anon ? 21 : 3,
                transition: "left .2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              }}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <PrimaryButton disabled={!text.trim() || submitting} onClick={handlePublish} icon={Sparkles}>
          {submitting ? "Publishing…" : "Publish Post"}
        </PrimaryButton>

      </div>
    </div>
  );
}
