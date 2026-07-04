import { supabase } from "./supabaseClient.js";

/* ---------- Posts ---------- */

export async function fetchFeed() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, text, mood, image_url, is_anonymous, created_at,
       author:profiles!posts_author_id_fkey ( id, username, avatar_color ),
       post_likes ( user_id ),
       post_supports ( user_id ),
       comments ( id )`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return data;
}

export async function createPost({ authorId, text, mood, isAnonymous, imageUrl = null }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: authorId, text, mood, is_anonymous: isAnonymous, image_url: imageUrl })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleLike(postId, userId, isLiked) {
  if (isLiked) {
    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function toggleSupport(postId, userId, isSupported) {
  if (isSupported) {
    const { error } = await supabase.from("post_supports").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("post_supports").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

/* ---------- Groups ---------- */

export async function fetchGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select(`id, name, description, color, group_members ( user_id )`)
    .order("id");
  if (error) throw error;
  return data;
}

export async function joinGroup(groupId, userId) {
  const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function leaveGroup(groupId, userId) {
  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

/* ---------- Messages (single demo conversation thread) ---------- */

export async function fetchConversation(userId, otherUserId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendMessage(senderId, receiverId, text) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, text })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToConversation(userId, otherUserId, onInsert) {
  const channel = supabase
    .channel(`messages-${userId}-${otherUserId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const m = payload.new;
        const isRelevant =
          (m.sender_id === userId && m.receiver_id === otherUserId) ||
          (m.sender_id === otherUserId && m.receiver_id === userId);
        if (isRelevant) onInsert(m);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/* ---------- Profile & badges ---------- */

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function fetchProfileStats(userId) {
  const [{ count: postCount }, { count: supportCount }, { count: groupCount }] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId),
    supabase.from("post_supports").select("post_id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("group_members").select("group_id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  return { postCount: postCount || 0, supportCount: supportCount || 0, groupCount: groupCount || 0 };
}

export async function fetchAllBadges() {
  const { data, error } = await supabase.from("badges").select("*");
  if (error) throw error;
  return data;
}

export async function fetchUserBadges(userId) {
  const { data, error } = await supabase.from("user_badges").select("badge_id, badges ( * )").eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => row.badges);
}

/* ---------- Reports (AI-triaged) ---------- */
// Calls the "triage-report" Edge Function, which classifies urgency with an
// AI model server-side and writes the row (keeps the AI API key off the client).

export async function submitReport({ reporterId, type, details }) {
  const { data, error } = await supabase.functions.invoke("triage-report", {
    body: { reporter_id: reporterId, type, details },
  });
  if (error) throw error;
  return data;
}
