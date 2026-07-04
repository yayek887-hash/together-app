import { useState, useEffect, useRef, useCallback } from "react";
import UserAvatar from "../components/UserAvatar.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchConversation, sendMessage, subscribeToConversation } from "../lib/api.js";
import { supabase } from "../lib/supabaseClient.js";

// Demo "support buddy" this thread talks to. In a full build this would be
// chosen from a contacts/conversations list — kept to one thread here to
// match the original screen design.
const BUDDY_NAME = "Noa";

export default function ChatPage() {
  const { user } = useAuth();
  const [buddyId, setBuddyId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  const findOrCreateBuddy = useCallback(async () => {
    // Looks for any other profile to chat with; if none exists yet (e.g. a
    // brand-new Supabase project with only one signed-up user), the thread
    // simply stays empty until a second person joins.
    const { data, error: err } = await supabase
      .from("profiles")
      .select("id, username")
      .neq("id", user.id)
      .limit(1)
      .maybeSingle();
    if (err) throw err;
    return data?.id || null;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe = () => {};

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const otherId = await findOrCreateBuddy();
        setBuddyId(otherId);
        if (otherId) {
          setMessages(await fetchConversation(user.id, otherId));
          unsubscribe = subscribeToConversation(user.id, otherId, (m) =>
            setMessages((prev) => [...prev, m])
          );
        }
      } catch (err) {
        setError(err.message || "Couldn't load this conversation.");
      } finally {
        setLoading(false);
      }
    })();

    return () => unsubscribe();
  }, [user, findOrCreateBuddy]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    if (!buddyId) return;
    try {
      await sendMessage(user.id, buddyId, text);
      // No optimistic push needed — the Realtime subscription above will
      // append it once Supabase confirms the insert.
    } catch (err) {
      setError(err.message || "Message didn't send — try again.");
    }
  };

  return (
    <div className="anim-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 12px", borderBottom: "1px solid #F0EEFA" }}>
        <UserAvatar name={BUDDY_NAME} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{BUDDY_NAME}</div>
          <div style={{ fontSize: 11, color: "var(--color-success)" }}>● Online</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: 150 }} className="scrollbar-none">
        {loading && <p style={{ color: "var(--color-text-soft)", textAlign: "center" }}>Loading conversation...</p>}
        {error && <p style={{ color: "var(--color-error)", textAlign: "center", fontSize: 14 }}>{error}</p>}
        {!loading && !buddyId && (
          <p style={{ color: "var(--color-text-soft)", textAlign: "center", marginTop: 20, fontSize: 14 }}>
            No one else has joined Together yet — once a friend signs up, your conversation will appear here.
          </p>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} msg={{ ...m, from: m.sender_id === user.id ? "me" : "them", time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }} />
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ position: "fixed", bottom: 64, left: 0, right: 0, maxWidth: 480, margin: "0 auto" }}>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
