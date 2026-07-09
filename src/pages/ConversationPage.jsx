import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchConversation, sendMessage, subscribeToConversation } from "../lib/api.js";
import { supabase } from "../lib/supabaseClient.js";

export default function ConversationPage() {
  const { userId: otherId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const endRef = useRef(null);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: profile }, msgs] = await Promise.all([
        supabase.from("profiles").select("id, username, display_name, avatar_color, avatar_url").eq("id", otherId).single(),
        fetchConversation(user.id, otherId),
      ]);
      setOtherProfile(profile);
      setMessages(msgs);
    } catch (err) {
      setError(err.message || "Couldn't load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [user, otherId]);

  useEffect(() => {
    if (!user || !otherId) return;
    loadConversation();
    const unsubscribe = subscribeToConversation(user.id, otherId, (m) => {
      // Deduplicate: ignore if message id already in list (optimistic already added it)
      setMessages((prev) => prev.some((p) => p.id === m.id) ? prev : [...prev, m]);
    });
    return () => unsubscribe();
  }, [user, otherId, loadConversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    // Optimistic update — show message immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      sender_id: user.id,
      receiver_id: otherId,
      text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = await sendMessage(user.id, otherId, text);
      // Replace temp with real message from DB (has correct id)
      setMessages((prev) => prev.map((m) => m.id === tempId ? sent : m));
    } catch (err) {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message || "Message didn't send — try again.");
    }
  };

  const displayName = otherProfile?.display_name || otherProfile?.username || "Someone";

  return (
    <div className="conv-page anim-in">
      {/* Header */}
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(91,60,221,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <button
          onClick={() => navigate("/chat")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
          aria-label="Back"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary)" }}>
            arrow_back
          </span>
        </button>
        <UserAvatar name={displayName} size={38} avatarUrl={otherProfile?.avatar_url || undefined} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>{displayName}</div>
          <div style={{ fontSize: 11, color: "var(--color-success)" }}>● Active</div>
        </div>
      </div>

      {/* Messages */}
      <div className="conv-messages scrollbar-none">
        {loading && (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        {error && (
          <p style={{ color: "var(--color-error)", textAlign: "center", fontSize: 14 }}>{error}</p>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
            <p style={{ color: "var(--color-text-soft)", fontSize: 14, lineHeight: 1.6 }}>
              Say hi to {displayName}!<br />This is the start of your conversation.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            msg={{
              ...m,
              from: m.sender_id === user.id ? "me" : "them",
              time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }}
            otherName={displayName}
            otherAvatarUrl={otherProfile?.avatar_url || undefined}
          />
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="conv-input-wrap">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
