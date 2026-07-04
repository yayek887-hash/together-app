import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        borderRadius: 24,
        padding: "10px 16px",
        boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
      }}
    >
      <Search size={18} color="var(--color-text-soft)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          border: "none",
          outline: "none",
          fontSize: 15,
          flex: 1,
          background: "transparent",
          color: "var(--color-text)",
        }}
      />
    </div>
  );
}
