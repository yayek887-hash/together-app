import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext.jsx";

const NAV_PATHS = ["/home", "/connect", "/meet", "/groups", "/chat", "/profile", "/my-space"];

// Desktop sidebar
const SIDEBAR_NAV = [
  { to: "/home",      icon: "home",             label: "Home" },
  { to: "/connect",   icon: "handshake",        label: "Connect" },
  { to: "/meet",      icon: "location_on",      label: "Meet" },
  { to: "/groups",    icon: "group",            label: "Communities" },
  { to: "/my-space",  icon: "self_improvement", label: "My Space" },
  { to: "/chat",      icon: "chat_bubble",      label: "Chat" },
  { to: "/profile",   icon: "person",           label: "Me" },
];

// Mobile bottom bar: Home | Connect | + | Meet | Me
const LEFT  = [
  { to: "/home",    icon: "home",      label: "Home" },
  { to: "/connect", icon: "handshake", label: "Connect" },
];
const RIGHT = [
  { to: "/meet",    icon: "location_on", label: "Meet" },
  { to: "/profile", icon: "person",      label: "Me" },
];

/* ── Sidebar item (desktop) ─────────────────────── */
function SidebarItem({ item, badge }) {
  return (
    <NavLink to={item.to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <div className={`sidebar-nav-item${isActive ? " active" : ""}`}>
          <span
            className={`material-symbols-outlined ${isActive ? "ms-filled" : ""}`}
            style={{ fontSize: 22, flexShrink: 0 }}
          >
            {item.icon}
          </span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {badge > 0 && (
            <span style={{
              background: "#e84545", color: "#fff",
              borderRadius: 999, padding: "2px 7px",
              fontSize: 11, fontWeight: 800, lineHeight: 1.4,
            }}>
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

/* ── Bottom bar item (mobile) ───────────────────── */
function NavItem({ item, badge }) {
  return (
    <NavLink to={item.to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, minWidth: 52, padding: "6px 8px", borderRadius: 14,
          background: isActive ? "var(--color-primary-fixed)" : "transparent",
          transition: "all 0.2s ease", position: "relative",
        }}>
          <span
            className={`material-symbols-outlined ${isActive ? "ms-filled" : ""}`}
            style={{ fontSize: 24, color: isActive ? "var(--color-primary)" : "var(--color-outline)" }}
          >
            {item.icon}
          </span>
          {badge > 0 && (
            <span className="badge-pulse" style={{
              position: "absolute", top: 4, right: 6,
              background: "#e84545", color: "#fff",
              fontSize: 9, fontWeight: 800, minWidth: 16, height: 16,
              borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", border: "2px solid #fff", lineHeight: 1,
            }}>
              {badge > 9 ? "9+" : badge}
            </span>
          )}
          <span style={{
            fontSize: 10, fontWeight: isActive ? 700 : 500,
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
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const showBottomBar = NAV_PATHS.includes(location.pathname);

  return (
    <>
      {/* ── Desktop sidebar (CSS hides on mobile) ── */}
      <aside className="navbar-sidebar">
        <div className="logo-gradient" style={{
          fontSize: 22, fontWeight: 900, letterSpacing: -0.5,
          marginBottom: 28, paddingLeft: 10,
        }}>
          together
        </div>

        {SIDEBAR_NAV.map(item => (
          <SidebarItem
            key={item.to}
            item={item}
            badge={item.to === "/chat" ? unreadCount : 0}
          />
        ))}

        <button
          className="sidebar-post-btn"
          onClick={() => navigate("/new-post")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          New post
        </button>
      </aside>

      {/* ── Mobile bottom bar (CSS hides on desktop) ── */}
      {showBottomBar && (
        <nav
          className="navbar-bottom glass"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            maxWidth: 480, margin: "0 auto",
            display: "flex", justifyContent: "space-around", alignItems: "flex-end",
            padding: "10px 8px 22px",
            borderRadius: "24px 24px 0 0",
            boxShadow: "var(--shadow-nav)",
            borderTop: "1px solid rgba(91,60,221,0.07)",
            zIndex: 50,
          }}
        >
          {LEFT.map(item => <NavItem key={item.to} item={item} />)}

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

          {RIGHT.map(item => (
            <NavItem
              key={item.to}
              item={item}
              badge={item.to === "/chat" ? unreadCount : 0}
            />
          ))}
        </nav>
      )}
    </>
  );
}
