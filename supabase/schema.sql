-- =========================================================
-- Together — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =========================================================

-- ---------- PROFILES ----------
-- One row per authenticated user (created automatically on signup via trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  age int,
  bio text default '',
  avatar_color text default '#6C63FF',
  is_safety_team boolean default false,   -- true for moderators who can view reports
  created_at timestamptz default now()
);

-- ---------- GROUPS ----------
create table public.groups (
  id bigint generated always as identity primary key,
  name text not null,
  description text default '',
  color text default '#D9D0FF',
  created_at timestamptz default now()
);

create table public.group_members (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

-- ---------- POSTS ----------
create table public.posts (
  id bigint generated always as identity primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  mood text,
  image_url text,
  is_anonymous boolean default false,
  created_at timestamptz default now()
);

create table public.post_likes (
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table public.post_supports (
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id bigint generated always as identity primary key,
  post_id bigint references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- ---------- MESSAGES (1:1 chat) ----------
create table public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- ---------- BADGES ----------
create table public.badges (
  id bigint generated always as identity primary key,
  name text not null,
  icon text not null,
  description text not null
);

create table public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id bigint references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- ---------- REPORTS (safety) ----------
-- priority / ai_reasoning are filled by the "triage-report" Edge Function (AI integration)
create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('harassment','bullying','content','selfharm')),
  details text default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved')),
  priority text check (priority in ('low','medium','high','urgent')),
  ai_reasoning text,
  created_at timestamptz default now()
);

-- =========================================================
-- Auto-create a profile row whenever a new auth user signs up
-- =========================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    ('#' || lpad(to_hex((random() * 16777215)::int), 6, '0'))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_supports enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.reports enable row level security;

-- Profiles: everyone (logged in) can read; users can only update their own
create policy "profiles are viewable by authenticated users"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Groups: readable by everyone logged in
create policy "groups are viewable by authenticated users"
  on public.groups for select using (auth.role() = 'authenticated');

-- Group members: readable by all; users manage only their own membership
create policy "group members are viewable by authenticated users"
  on public.group_members for select using (auth.role() = 'authenticated');
create policy "users can join groups"
  on public.group_members for insert with check (auth.uid() = user_id);
create policy "users can leave groups"
  on public.group_members for delete using (auth.uid() = user_id);

-- Posts: readable by everyone logged in; only the author can write/delete their own
create policy "posts are viewable by authenticated users"
  on public.posts for select using (auth.role() = 'authenticated');
create policy "users can create their own posts"
  on public.posts for insert with check (auth.uid() = author_id);
create policy "users can delete their own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- Likes / Supports: readable by all, writable only by the acting user
create policy "likes are viewable by authenticated users"
  on public.post_likes for select using (auth.role() = 'authenticated');
create policy "users can like posts"
  on public.post_likes for insert with check (auth.uid() = user_id);
create policy "users can unlike posts"
  on public.post_likes for delete using (auth.uid() = user_id);

create policy "supports are viewable by authenticated users"
  on public.post_supports for select using (auth.role() = 'authenticated');
create policy "users can support posts"
  on public.post_supports for insert with check (auth.uid() = user_id);
create policy "users can remove their support"
  on public.post_supports for delete using (auth.uid() = user_id);

-- Comments: readable by all, writable by author
create policy "comments are viewable by authenticated users"
  on public.comments for select using (auth.role() = 'authenticated');
create policy "users can write comments"
  on public.comments for insert with check (auth.uid() = author_id);

-- Messages: only sender or receiver can read/write their own conversation
create policy "users can view their own conversations"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "users can send messages"
  on public.messages for insert with check (auth.uid() = sender_id);

-- Badges: readable by everyone logged in
create policy "badges are viewable by authenticated users"
  on public.badges for select using (auth.role() = 'authenticated');
create policy "user_badges are viewable by authenticated users"
  on public.user_badges for select using (auth.role() = 'authenticated');

-- Reports: anyone logged in can submit; only the safety team can read
create policy "users can submit reports"
  on public.reports for insert with check (auth.uid() = reporter_id);
create policy "safety team can view reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_safety_team = true
    )
  );
create policy "safety team can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_safety_team = true
    )
  );
