import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, Flag } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Card from "../components/Card.jsx";
import ReportCard from "../components/ReportCard.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { submitReport } from "../lib/api.js";

const TYPES = [
  { key: "harassment", label: "Harassment" },
  { key: "bullying", label: "Bullying" },
  { key: "content", label: "Inappropriate Content" },
  { key: "selfharm", label: "Self-Harm Concern" },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [type, setType] = useState(null);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!type || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // This calls the "triage-report" Supabase Edge Function, which uses an
      // AI model server-side to classify urgency before writing the report —
      // see supabase/functions/triage-report/index.ts
      await submitReport({ reporterId: user.id, type, details });
      setSent(true);
    } catch (err) {
      setError(err.message || "Couldn't submit your report — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div
        className="anim-in"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 30,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <CheckCircle2 size={38} color="var(--color-success)" />
        </div>
        <div className="t-h2" style={{ marginBottom: 8 }}>Your report was sent</div>
        <p style={{ fontSize: 14, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
          Thank you for telling us. Our safety team will look into it privately. You did the right
          thing.
        </p>
        <div style={{ marginTop: 22, width: "100%" }}>
          <PrimaryButton onClick={() => navigate("/home")}>Back to Home</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="Report an Issue" showBack />
      <div style={{ padding: "0 16px" }}>
        <Card style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Shield size={18} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--color-text-soft)", lineHeight: 1.5 }}>
            This report is private. Only our safety team will see it. Your wellbeing always comes
            first.
          </span>
        </Card>

        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>What happened?</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 18px" }}>
          {TYPES.map((t) => (
            <ReportCard key={t.key} label={t.label} active={type === t.key} onClick={() => setType(t.key)} />
          ))}
        </div>

        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>Tell us more (optional)</span>
        <textarea
          className="textarea"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Share any details that might help us understand..."
          style={{ marginTop: 8, marginBottom: 16 }}
        />

        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <PrimaryButton variant="error" disabled={!type || submitting} onClick={handleSubmit} icon={Flag}>
          {submitting ? "Sending..." : "Submit Report"}
        </PrimaryButton>
      </div>
    </div>
  );
}
