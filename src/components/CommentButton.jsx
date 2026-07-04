import { MessageSquare } from "lucide-react";

export default function CommentButton({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px 10px",
      }}
    >
      <MessageSquare size={17} color="var(--color-text-soft)" />
      <span style={{ fontSize: 13, color: "var(--color-text-soft)" }}>{count}</span>
    </button>
  );
}
