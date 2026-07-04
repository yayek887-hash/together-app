# Together — Design System

A safe, warm social platform for kids & teens (ages 10–18) dealing with bullying, loneliness,
and social struggles. The product should feel like a blend of Instagram (visual feed),
WhatsApp (private chat) and Pinterest (soft cards) — but warmer, safer, and unmistakably
non-corporate.

## Voice
"I'm not alone, there are people here who understand me, it's safe for me to share here."
Positive, sensitive, never judgmental. Never clinical or businesslike.

## Color tokens
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#6C63FF` | Buttons, CTAs |
| `--color-secondary` | `#D9D0FF` | Secondary backgrounds, cards |
| `--color-accent` | `#8FE3E0` | Positive highlights, groups |
| `--color-bg` | `#FAF8FF` | App background |
| `--color-text` | `#333333` | Primary text |
| `--color-error` | `#FF6B6B` | Errors, reports |
| `--color-success` | `#4CAF50` | Success, positive reinforcement |

## Typography
Font: **Rubik** (Google Fonts).
- H1 — 28px / Bold
- H2 — 20px / Medium
- Body — 16px / Regular
- Label — 14px / Medium

## Spacing & shape
- Base spacing unit: `8px`
- Border radius (general): `16px`
- Border radius (cards): `20px`
- Button height: `48px`, fully rounded, primary-colored, white text
- Cards: white background, soft shadow, rounded corners
- Inputs: light, spacious, comfortable

## Screens (routes)
| Route | Page | Primary CTA |
|---|---|---|
| `/` | LandingPage | Continue with Google |
| `/home` | HomePage | Send Support / New Post |
| `/groups` | SupportGroupsPage | Join Group |
| `/chat` | ChatPage | Send Message |
| `/profile` | ProfilePage | Log Out / Safety Center |
| `/help-center` | HelpCenterPage | Report Something |
| `/report` | ReportIssuePage | Submit Report |
| `/new-post` | NewPostPage | Publish Post |

All routes except `/` are behind `ProtectedRoute` and require a logged-in Supabase session.

## Data & state
- `AuthContext` — wraps Supabase Auth (Google OAuth), exposes the current session, profile row,
  and `signInWithGoogle` / `signOut`.
- `src/lib/api.js` — every Supabase query (posts, groups, messages, profile stats, badges,
  reports) lives in this one file.
- No client-side mock data remains except the static Help Center tips
  (`src/data/mockData.js`), which aren't user data and don't need a backend.

## Safety principles baked into the UI
- Every post can be reported.
- Posting anonymously is always available.
- Reports are triaged by an AI model server-side (see `docs/ERD.md`) and only visible to
  accounts flagged `is_safety_team` in the database.
- Self-harm reports are always force-escalated to "urgent," never left to the AI's judgment.
- Copy constantly reinforces "you are not alone."

## Components
`Navbar`, `TopBar`, `UserAvatar`, `PrimaryButton`, `Card`, `PostCard`, `GroupCard`,
`SupportButton`, `CommentButton`, `MoodSelector`, `SearchBar`, `ChatBubble`, `MessageInput`,
`AchievementBadge`, `ReportCard`, `HelpCard`, `FloatingActionButton`, `ProtectedRoute`.

## Status
Full-stack app backed by Supabase (Postgres + Auth + Realtime + Edge Functions), deployed on
Vercel. See `README.md` for the complete setup guide and `docs/ERD.md` for the data model and
external integrations.
