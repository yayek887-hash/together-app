import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext.jsx";
import UserAvatar from "./UserAvatar.jsx";

export default function NotificationToast() {
  const { toast, dismissToast } = useNotifications();
  const navigate = useNavigate();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 4000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const handleClick = () => {
    dismissToast();
    navigate(`/chat/${toast.senderId}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 420,
        zIndex: 999,
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px rgba(91,60,221,0.18)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        animation: "slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        border: "1.5px solid rgba(91,60,221,0.1)",
      }}
    >
      {/* Green dot + avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <UserAvatar name={toast.senderName} size={42} />
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#25d366",
            border: "2px solid #fff",
          }}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", marginBottom: 2 }}>
          {toast.senderName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-soft)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {toast.text}
        </div>
      </div>

      {/* Chat icon */}
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 20, color: "var(--color-primary)", flexShrink: 0 }}
      >
        chat_bubble
      </span>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); dismissToast(); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-text-soft)" }}>
          close
        </span>
      </button>
    </div>
  );
}
