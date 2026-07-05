import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null); // { senderName, text, senderId }

  const clearUnread = useCallback(() => setUnreadCount(0), []);

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

          // Don't notify if already in that conversation
          const inConversation = location.pathname === `/chat/${msg.sender_id}`;
          if (!inConversation) {
            setUnreadCount((c) => c + 1);

            // Fetch sender name for toast
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
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, location.pathname]);

  // Clear unread when entering /chat
  useEffect(() => {
    if (location.pathname === "/chat") clearUnread();
  }, [location.pathname, clearUnread]);

  const dismissToast = useCallback(() => setToast(null), []);

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
