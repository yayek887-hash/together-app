import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, EyeOff, Sparkles } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import MoodSelector from "../components/MoodSelector.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createPost } from "../lib/api.js";

export default function NewPostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [mood, setMood] = useState(null);
  const [anon, setAnon] = useState(false);
  const [addImage, setAddImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const moodEmoji = { Happy: "😊", Calm: "😌", Sad: "😢", Anxious: "😰", Angry: "😡", Tired: "😴" }[mood] || null;

  const handlePublish = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createPost({ authorId: user.id, text: text.trim(), mood: moodEmoji, isAnonymous: anon });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Couldn't publish your post — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="New Post" showBack />
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 15, color: "var(--color-text-soft)", marginBottom: 14 }}>
          What's on your heart today?
        </div>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your feelings, a win, or ask for support..."
          style={{ minHeight: 130, marginBottom: 16 }}
        />

        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>How are you feeling?</span>
        <div style={{ margin: "10px 0 18px" }}>
          <MoodSelector selected={mood} onSelect={setMood} />
        </div>

        <button
          onClick={() => setAddImage(!addImage)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            background: "#fff",
            border: "2px dashed var(--color-secondary)",
            borderRadius: 16,
            padding: 14,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <ImageIcon size={20} color="var(--color-primary)" />
          <span style={{ fontSize: 14, color: "var(--color-text-soft)" }}>
            {addImage ? "Image added ✓ (demo — upload not wired yet)" : "Add a photo (optional)"}
          </span>
        </button>
        {addImage && (
          <div style={{ height: 100, borderRadius: 14, background: "var(--color-accent)", marginBottom: 16, opacity: 0.6 }} />
        )}

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
            boxShadow: "0 2px 8px rgba(108,99,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <EyeOff size={18} color="var(--color-primary)" />
            <span style={{ fontSize: 14 }}>Post anonymously</span>
          </div>
          <div
            style={{
              width: 42,
              height: 24,
              borderRadius: 12,
              background: anon ? "var(--color-primary)" : "#E4E0F5",
              position: "relative",
              transition: "background .2s",
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
              }}
            />
          </div>
        </div>

        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <PrimaryButton disabled={!text.trim() || submitting} onClick={handlePublish} icon={Sparkles}>
          {submitting ? "Publishing..." : "Publish Post"}
        </PrimaryButton>
      </div>
    </div>
  );
}
