import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/home",    icon: "home",        label: "Home" },
  { to: "/groups",  icon: "group",       label: "Groups" },
  { to: "/chat",    icon: "chat_bubble", label: "Chat" },
  { to: "/profile", icon: "person",      label: "Me" },
];

export default function Navbar() {
  return (
    <nav
      className="glass"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 8px 18px",
        borderRadius: "20px 20px 0 0",
        boxShadow: "var(--shadow-nav)",
        zIndex: 50,
      }}
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: isActive ? "var(--color-primary)" : "var(--color-text-soft)",
                transition: "color 0.2s ease, transform 0.2s ease",
                transform: isActive ? "translateY(-2px)" : "none",
                minWidth: 56,
              }}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "ms-filled" : ""}`}
                style={{ fontSize: 26 }}
              >
                {item.icon}
              </span>
              <span
                className="t-label-sm"
                style={{ fontWeight: isActive ? 600 : 500 }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--color-tertiary)",
                    marginTop: 2,
                  }}
                />
              )}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
