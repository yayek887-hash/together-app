import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext.jsx";

const NAV_PATHS = ["/home", "/connect", "/meet", "/groups", "/chat", "/profile", "/notifications"];

// Desktop sidebar
const SIDEBAR_NAV = [
  { to: "/home",          icon: "home",               label: "Home" },
  { to: "/connect",       icon: "handshake",          label: "Connect" },
  { to: "/meet",          icon: "location_on",        label: "Meet" },
  { to: "/groups",        icon: "volunteer_activism", label: "Support" },
  { to: "/notifications", icon: "notifications",      label: "Activity" },
  { to: "/profile",       icon: "person",             label: "Me" },
];

const LEFT  = [
  { to: "/home",    icon: "home",      label: "Home" },
  { to: "/connect", icon: "handshake", label: "Connect" },
];
const RIGHT = [
  { to: "/groups",  icon: "volunteer_activism", label: "Support" },
  { to: "/profile", icon: "person",             label: "Me" },
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
              background: "var(--color-notification)", color: "#fff",
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
          gap: 3, minWidth: 52, padding: "2px 10px",
          position: "relative",
        }}>
          <span
            className={`material-symbols-outlined ${isActive ? "ms-filled" : ""}`}
            style={{
              fontSize: 26,
              color: isActive ? "var(--color-primary)" : "var(--color-outline)",
              transition: "color 0.15s",
            }}
          >
            {item.icon}
          </span>
          <span style={{
            fontSize: 10, fontWeight: isActive ? 700 : 500, lineHeight: 1,
            color: isActive ? "var(--color-primary)" : "#9899a6",
            transition: "color 0.15s",
          }}>
            {item.label}
          </span>
          {badge > 0 && (
            <span style={{
              position: "absolute", top: 0, right: 6,
              background: "var(--color-notification)", color: "#fff",
              fontSize: 9, fontWeight: 800, minWidth: 16, height: 16,
              borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", border: "2px solid #fff", lineHeight: 1,
            }}>
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, pendingCount, totalNotifCount } = useNotifications();

  const showBottomBar = NAV_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* ── Desktop sidebar ── */}
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
            badge={item.to === "/notifications" ? totalNotifCount : 0}
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

      {/* ── Mobile bottom bar ── */}
      {showBottomBar && (
        <nav
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            maxWidth: 480, margin: "0 auto",
            display: "flex", justifyContent: "space-around", alignItems: "flex-end",
            padding: "10px 0 max(24px, env(safe-area-inset-bottom))",
            background: "var(--color-bg)",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.05)",
            zIndex: 50,
          }}
        >
          {LEFT.map(item => (
            <NavItem
              key={item.to}
              item={item}
              badge={item.to === "/connect" ? pendingCount : item.to === "/home" ? totalNotifCount : 0}
            />
          ))}

          {/* ── Centre FAB ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <button
              onClick={() => navigate("/new-post")}
              aria-label="Create post"
              style={{
                width: 52, height: 52,
                borderRadius: 18,
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-button)",
                marginTop: -20,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#fff" }}>add</span>
            </button>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-primary)", lineHeight: 1 }}>Create</span>
          </div>

          {RIGHT.map(item => <NavItem key={item.to} item={item} />)}
        </nav>
      )}
    </>
  );
}
