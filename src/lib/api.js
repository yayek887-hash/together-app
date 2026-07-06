import { supabase } from "./supabaseClient.js";

/* ---------- Posts ---------- */

export async function fetchFeed(topic = null) {
  let query = supabase
    .from("posts")
    .select(
      `id, text, mood, topic, image_url, is_anonymous, created_at,
       author:profiles!posts_author_id_fkey ( id, username, avatar_color ),
       post_reactions ( user_id, type ),
       comments ( id )`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (topic) query = query.eq("topic", topic);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateInterests(userId, interests) {
  const { error } = await supabase.from("profiles").update({ interests }).eq("id", userId);
  if (error) throw error;
}

export async function createPost({ authorId, text, mood, topic = null, isAnonymous, imageUrl = null }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: authorId, text, mood, topic, is_anonymous: isAnonymous, image_url: imageUrl })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addReaction(postId, userId, type) {
  const { error } = await supabase
    .from("post_reactions")
    .insert({ post_id: postId, user_id: userId, type });
  if (error) throw error;
}

export async function removeReaction(postId, userId, type) {
  const { error } = await supabase
    .from("post_reactions")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId)
    .eq("type", type);
  if (error) throw error;
}

/* ---------- Groups ---------- */

export async function fetchGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select(`id, name, description, color, category, privacy, min_age, max_age, city, region, owner_id, group_members ( user_id )`)
    .order("id");
  if (error) throw error;
  return data;
}

export async function fetchGroup(groupId) {
  const { data, error } = await supabase
    .from("groups")
    .select(`id, name, description, color, category, privacy, min_age, max_age, city, region, rules, owner_id, created_at,
      group_members ( user_id, profiles!group_members_user_id_fkey ( id, username, avatar_color ) )`)
    .eq("id", groupId)
    .single();
  if (error) throw error;
  return data;
}

export async function createGroup({ name, description, category, privacy, minAge, maxAge, city, region, rules, ownerId }) {
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, description, category, privacy, min_age: minAge, max_age: maxAge, city: city || null, region: region || null, rules: rules || null, owner_id: ownerId, color: "#5b3cdd" })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("group_members").insert({ group_id: data.id, user_id: ownerId });
  return data;
}

export async function updateGroup(groupId, fields) {
  const { error } = await supabase.from("groups").update(fields).eq("id", groupId);
  if (error) throw error;
}

export async function deleteGroup(groupId) {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw error;
}

export async function joinGroup(groupId, userId) {
  const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function leaveGroup(groupId, userId) {
  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

export async function removeGroupMember(groupId, userId) {
  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

/* ---------- Join requests ---------- */

export async function fetchJoinRequests(groupId) {
  const { data, error } = await supabase
    .from("group_join_requests")
    .select(`id, user_id, message, status, created_at, profiles!group_join_requests_user_id_fkey ( id, username, avatar_color )`)
    .eq("group_id", groupId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendJoinRequest(groupId, userId, message = "") {
  const { error } = await supabase
    .from("group_join_requests")
    .insert({ group_id: groupId, user_id: userId, message });
  if (error) throw error;
}

export async function approveJoinRequest(requestId, groupId, userId) {
  await supabase.from("group_join_requests").update({ status: "approved" }).eq("id", requestId);
  await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });
}

export async function declineJoinRequest(requestId) {
  const { error } = await supabase.from("group_join_requests").update({ status: "declined" }).eq("id", requestId);
  if (error) throw error;
}

export async function fetchMyJoinRequest(groupId, userId) {
  const { data } = await supabase
    .from("group_join_requests")
    .select("id, status")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/* ---------- Location (profiles) ---------- */

export async function updateProfileLocation(userId, { city, region, country, locationVisible }) {
  const { error } = await supabase
    .from("profiles")
    .update({ city: city || null, region: region || null, country: country || null, location_visible: locationVisible })
    .eq("id", userId);
  if (error) throw error;
}

export async function fetchNearbyGroups(city, region) {
  if (!city && !region) return [];
  let q = supabase.from("groups").select(`id, name, description, color, category, privacy, city, region, group_members ( user_id )`);
  if (city) q = q.ilike("city", city);
  else if (region) q = q.ilike("region", region);
  const { data } = await q.limit(10);
  return data || [];
}

/* ---------- Profiles (contacts list) ---------- */

export async function fetchAllProfiles(excludeId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_color")
    .neq("id", excludeId)
    .order("username");
  if (error) throw error;
  return data;
}

/* ---------- Friendships ---------- */

export async function fetchPeopleWithFriendStatus(currentUserId) {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_color, created_at, interests")
    .neq("id", currentUserId)
    .order("username");
  if (error) throw error;

  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, requester_id, receiver_id, status")
    .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

  return profiles.map((p) => {
    const f = (friendships || []).find(
      (fr) => fr.requester_id === p.id || fr.receiver_id === p.id
    );
    return { ...p, friendship: f || null };
  });
}

export async function fetchFriendCount(userId) {
  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
  return count || 0;
}

export async function fetchPendingRequests(userId) {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, profiles!friendships_requester_id_fkey(id, username, avatar_color)")
    .eq("receiver_id", userId)
    .eq("status", "pending");
  if (error) throw error;
  return data;
}

export async function sendFriendRequest(requesterId, receiverId) {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: requesterId, receiver_id: receiverId });
  if (error) throw error;
}

export async function acceptFriendRequest(friendshipId) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
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
    supabase.from("post_reactions").select("id", { count: "exact", head: true }).eq("user_id", userId),
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

/* ---------- Comments ---------- */

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `id, text, created_at,
       author:profiles!comments_author_id_fkey ( id, username, avatar_color )`
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createComment(postId, authorId, text) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: authorId, text })
    .select(
      `id, text, created_at,
       author:profiles!comments_author_id_fkey ( id, username, avatar_color )`
    )
    .single();
  if (error) throw error;
  return data;
}

/* ---------- AI: Kind Writer ---------- */

export async function kindRewrite(text) {
  const { data, error } = await supabase.functions.invoke("kind-writer", {
    body: { text },
  });
  if (error) throw error;
  return data?.kindText ?? text;
}

/* ---------- My Space ---------- */

export async function logMood(userId, mood, visibility = "private") {
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("mood_logs")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00`)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase.from("mood_logs").update({ mood, visibility }).eq("id", existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("mood_logs").insert({ user_id: userId, mood, visibility }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchTodayMood(userId) {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase.from("mood_logs").select("*").eq("user_id", userId).gte("created_at", `${today}T00:00:00`).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}

export async function saveJournalEntry(userId, content, entryType = "journal") {
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase.from("journal_entries").select("id").eq("user_id", userId).eq("entry_type", entryType).gte("created_at", `${today}T00:00:00`).maybeSingle();

  if (existing) {
    const { data, error } = await supabase.from("journal_entries").update({ content }).eq("id", existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("journal_entries").insert({ user_id: userId, content, entry_type: entryType }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchTodayEntry(userId, entryType = "journal") {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase.from("journal_entries").select("*").eq("user_id", userId).eq("entry_type", entryType).gte("created_at", `${today}T00:00:00`).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}

export async function fetchGoals(userId) {
  const { data, error } = await supabase.from("personal_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addGoal(userId, title) {
  const { data, error } = await supabase.from("personal_goals").insert({ user_id: userId, title }).select().single();
  if (error) throw error;
  return data;
}

export async function toggleGoal(goalId, completed) {
  const { data, error } = await supabase.from("personal_goals").update({ completed }).eq("id", goalId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(goalId) {
  const { error } = await supabase.from("personal_goals").delete().eq("id", goalId);
  if (error) throw error;
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
