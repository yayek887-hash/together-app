import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Track current path WITHOUT causing channel to re-subscribe on every navigation
  const pathRef = useRef(location.pathname);
  useEffect(() => { pathRef.current = location.pathname; }, [location.pathname]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);
  const dismissToast = useCallback(() => setToast(null), []);

  // Subscribe once per user session — never recreate on route changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const msg = payload.new;

          // Don't notify if already viewing that conversation
          if (pathRef.current === `/chat/${msg.sender_id}`) return;

          setUnreadCount((c) => c + 1);

          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", msg.sender_id)
            .single();

          setToast({
            senderName: profile?.username || "Someone",
            senderId: msg.sender_id,
            text: msg.text,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]); // Only user — not location, so channel stays alive across navigation

  // Clear unread badge when entering /chat list
  useEffect(() => {
    if (location.pathname === "/chat") clearUnread();
  }, [location.pathname, clearUnread]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, clearUnread, toast, dismissToast }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
