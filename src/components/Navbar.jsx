import { NavLink, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext.jsx";

const LEFT  = [
  { to: "/home",    icon: "home",        label: "Home" },
  { to: "/groups",  icon: "group",       label: "Groups" },
];
const RIGHT = [
  { to: "/chat",    icon: "chat_bubble", label: "Chat" },
  { to: "/profile", icon: "person",      label: "Me" },
];

function NavItem({ item, badge }) {
  return (
    <NavLink to={item.to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            minWidth: 52,
            padding: "6px 8px",
            borderRadius: 14,
            background: isActive ? "var(--color-primary-fixed)" : "transparent",
            transition: "all 0.2s ease",
            position: "relative",
          }}
        >
          <span
            className={`material-symbols-outlined ${isActive ? "ms-filled" : ""}`}
            style={{
              fontSize: 24,
              color: isActive ? "var(--color-primary)" : "var(--color-outline)",
            }}
          >
            {item.icon}
          </span>

          {/* Unread badge */}
          {badge > 0 && (
            <span
              className="badge-pulse"
              style={{
                position: "absolute",
                top: 4,
                right: 6,
                background: "#e84545",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid #fff",
                lineHeight: 1,
              }}
            >
              {badge > 9 ? "9+" : badge}
            </span>
          )}

          <span style={{
            fontSize: 10,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "var(--color-primary)" : "var(--color-outline)",
          }}>
            {item.label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

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
        alignItems: "flex-end",
        padding: "10px 8px 22px",
        borderRadius: "24px 24px 0 0",
        boxShadow: "var(--shadow-nav)",
        borderTop: "1px solid rgba(91,60,221,0.07)",
        zIndex: 50,
      }}
    >
      {LEFT.map((item) => <NavItem key={item.to} item={item} />)}

      {/* Centre post button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 2 }}>
        <button
          className="nav-post-btn"
          onClick={() => navigate("/new-post")}
          aria-label="New post"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#fff" }}>add</span>
        </button>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-primary)" }}>Post</span>
      </div>

      {RIGHT.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          badge={item.to === "/chat" ? unreadCount : 0}
        />
      ))}
    </nav>
  );
}
