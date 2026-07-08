import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState(null);

  const pathRef = useRef(location.pathname);
  useEffect(() => { pathRef.current = location.pathname; }, [location.pathname]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const decrementPending = useCallback(() => setPendingCount(c => Math.max(0, c - 1)), []);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          const msg = payload.new;
          if (pathRef.current === `/chat/${msg.sender_id}`) return;
          setUnreadCount((c) => c + 1);
          const { data: profile } = await supabase
            .from("profiles").select("username").eq("id", msg.sender_id).single();
          setToast({ senderName: profile?.username || "Someone", senderId: msg.sender_id, text: msg.text });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Fetch + subscribe to pending friend requests
  useEffect(() => {
    if (!user) return;

    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count || 0));

    const channel = supabase
      .channel(`friend-reqs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "friendships", filter: `receiver_id=eq.${user.id}` },
        () => setPendingCount(c => c + 1)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Clear message badge when entering chat list
  useEffect(() => {
    if (location.pathname === "/chat") clearUnread();
  }, [location.pathname, clearUnread]);

  const totalNotifCount = unreadCount + pendingCount;

  return (
    <NotificationsContext.Provider value={{ unreadCount, clearUnread, pendingCount, decrementPending, totalNotifCount, toast, dismissToast }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
