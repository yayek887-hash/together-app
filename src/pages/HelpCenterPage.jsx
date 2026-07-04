import { useNavigate } from "react-router-dom";
import { CheckCircle2, Wind, BookOpen, Users, Sparkles, Flag } from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Card from "../components/Card.jsx";
import HelpCard from "../components/HelpCard.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { HELP_TIPS } from "../data/mockData.js";

export default function HelpCenterPage() {
  const navigate = useNavigate();

  return (
    <div className="page-scroll scrollbar-none anim-in">
      <TopBar title="Help Center" showBack />
      <div style={{ padding: "0 16px" }}>
        <Card style={{ marginBottom: 16, background: "var(--color-secondary)" }}>
          <div className="t-h2" style={{ marginBottom: 6 }}>You're not alone in this 💜</div>
          <div style={{ fontSize: 13, color: "#5b5470" }}>
            Tools, tips, and people to lean on — whenever you need them.
          </div>
        </Card>

        <span className="t-label" style={{ color: "var(--color-text-soft)" }}>
          Quick tips against bullying
        </span>
        <div style={{ margin: "10px 0 18px" }}>
          {HELP_TIPS.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

        <HelpCard icon={Wind} title="Breathing exercise" desc="2-minute calm-down session" />
        <HelpCard icon={BookOpen} title="Friendship guides" desc="How to start, keep & repair friendships" />
        <HelpCard icon={Users} title="Connect with a mentor" desc="Talk to a trained, friendly mentor" />

        <Card style={{ marginTop: 4, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <span style={{ fontWeight: 500 }}>Today's kindness challenge</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-soft)" }}>
            Write 3 kind comments today 💬
          </div>
        </Card>

        <PrimaryButton variant="error" onClick={() => navigate("/report")} icon={Flag}>
          Report Something
        </PrimaryButton>
      </div>
    </div>
  );
}
