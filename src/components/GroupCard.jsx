import { Users, CheckCircle2 } from "lucide-react";
import Card from "./Card.jsx";
import PrimaryButton from "./PrimaryButton.jsx";
import { AVATAR_COLORS } from "./UserAvatar.jsx";

export default function GroupCard({ group, joined, onJoin }) {
  return (
    <Card style={{ marginBottom: 14, padding: 0, overflow: "hidden" }}>
      <div style={{ height: 70, background: group.color }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-soft)", marginTop: 2 }}>
              {group.members} members
            </div>
          </div>
          <div style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: AVATAR_COLORS[(i + group.id) % AVATAR_COLORS.length],
                  border: "2px solid #fff",
                  marginLeft: i === 0 ? 0 : -8,
                }}
              />
            ))}
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-soft)", margin: "8px 0 12px" }}>
          {group.description || group.desc}
        </p>
        <PrimaryButton variant={joined ? "outline" : "primary"} onClick={onJoin} icon={joined ? CheckCircle2 : Users}>
          {joined ? "Joined" : "Join Group"}
        </PrimaryButton>
      </div>
    </Card>
  );
}
