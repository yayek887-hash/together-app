import { ChevronRight } from "lucide-react";
import Card from "./Card.jsx";

export default function HelpCard({ icon: Icon, title, desc, onClick }) {
  return (
    <Card onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "var(--color-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="var(--color-primary)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-soft)" }}>{desc}</div>
      </div>
      <ChevronRight size={18} color="var(--color-text-soft)" />
    </Card>
  );
}
