# Together — You are not alone 💜

A safe, warm social platform for kids & teens (ages 10–18) dealing with bullying, loneliness,
and social struggles. Think Instagram's feed + WhatsApp's chat + Pinterest's soft cards — but
built around safety, kindness, and belonging instead of engagement.

**Live app:** https://together-app-pi.vercel.app  
**Demo login:** Google sign-in (any Google account) — no demo password needed.

---

## Overview

Together gives kids a place to share what they're going through, get support from peers who
understand, join interest-based groups, chat privately, and — critically — report anything
unsafe with confidence that it'll be taken seriously and quickly.

## The problem

Kids dealing with bullying or social isolation often have nowhere safe to turn: mainstream
social apps are built for engagement and virality, not emotional safety, and their report
queues are slow, generic, and easy for serious cases to get lost in. A 13-year-old describing
self-harm thoughts shouldn't sit in the same queue as a spam report.

## Target audience

Kids and teens aged 10–18 who are experiencing bullying, loneliness, social anxiety, or
difficulty making friends — and the trusted adults/safety teams who need to be able to act on
the reports they file.

## Competitors & differentiation

| Alternative | Why it falls short for this use case |
|---|---|
| Instagram / TikTok / Discord | Built for broadcast and engagement, not emotional safety; reporting is slow and impersonal; algorithmic feeds can amplify harm. |
| WhatsApp groups created by schools/parents | No structure for finding people with shared interests or struggles; no built-in safety tooling at all. |
| "Just talk to a counselor" | Real and important, but slow to access and doesn't help with the in-the-moment loneliness of recess or a bad evening at home. |
| Doing nothing / suffering in silence | The actual status quo for many kids — the cost of inaction is the whole reason this product exists. |

**Together's differentiation:** every interaction is designed around the question "does this
make a struggling kid feel safer and less alone?" — including an **AI-assisted report triage
system** (see below) that makes sure urgent reports (like self-harm concerns) reach the safety
team's attention first, instead of sitting in a flat, unsorted queue.

## AI / external integrations

| Service | Type | Purpose |
|---|---|---|
| **Google OAuth** | Authentication | One-click sign-in via Google (via Supabase Auth). No passwords stored. |
| **Supabase Realtime** | WebSocket | Live updates in DMs, group chats, and activity chats. |
| **Supabase Storage** | File storage | Avatar images, cover photos, post media (`avatars` + `post-images` buckets). |
| **Edge Function: `kind-writer`** | AI (Anthropic Claude) | Rewrites a draft post to be kinder and more empathetic before publishing. API key is server-side only. |
| **Edge Function: `triage-report`** | AI (Anthropic Claude) | Classifies each safety report's urgency (`low / medium / urgent`) so serious cases rise to the top. API key is server-side only. |
| **Nominatim (OpenStreetMap)** | Geocoding API | Converts activity text locations to coordinates for the "Near Me" distance-sort feature on the Meet page. Free, no API key. Results cached in `localStorage`. |

Full data model & ERD: [`docs/ERD.md`](docs/ERD.md). Full SQL: [`supabase/schema.sql`](supabase/schema.sql).

---

## Tech stack

React + Vite, React Router, Supabase (Postgres + Auth + Realtime + Edge Functions), deployed on
Vercel.

---

## Setup guide (from zero)

You said you don't have Supabase / Vercel / GitHub accounts yet — here's every step.

### 1. Push this project to GitHub

```bash
cd together-app
git init
git add .
git commit -m "Initial commit"
```

Then go to [github.com](https://github.com) → sign up (free) → click **New repository** → name
it `together-app` → **Public** → Create repository. GitHub will show you a remote URL; run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/together-app.git
git branch -M main
git push -u origin main
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up (free, you can use the same Google
   account) → **New project**.
2. Pick a name (e.g. `together-app`), set a database password (save it somewhere), pick a
   region close to you, click **Create new project**. Wait ~2 minutes for it to provision.
3. In the left sidebar go to **SQL Editor** → **New query**. Paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
4. Open a second new query, paste [`supabase/seed.sql`](supabase/seed.sql), and click **Run**
   (this adds the starter groups and badges).
5. Go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key —
   you'll need both in step 4 below.

### 3. Turn on Google sign-in

1. In Supabase: **Authentication → Providers → Google** → toggle it on.
2. You need a Google OAuth Client ID/Secret: go to
   [Google Cloud Console](https://console.cloud.google.com/) → create a project (or use an
   existing one) → **APIs & Services → Credentials → Create Credentials → OAuth client ID** →
   Application type: **Web application**.
3. Under **Authorized redirect URIs**, paste the callback URL Supabase shows you on the Google
   provider settings page (looks like `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`).
4. Copy the generated **Client ID** and **Client Secret** back into the Supabase Google provider
   form and **Save**.
5. Back in **Authentication → URL Configuration**, set your **Site URL** to your future Vercel
   URL (you can update this after step 6 once you have it) and add `http://localhost:5173` as
   an additional redirect URL for local testing.

### 4. Run it locally

```bash
npm install
cp .env.example .env
```

Open `.env` and paste in the Project URL and anon key from step 2.5:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

```bash
npm run dev
```

Open the printed local URL. Click **Continue with Google** — this creates your first profile
row automatically (via the `handle_new_user` trigger in the schema).

### 5. Deploy the AI Edge Functions

This requires the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-api-key
supabase functions deploy triage-report
supabase functions deploy kind-writer
```

**`triage-report`** — classifies safety reports by urgency using AI.  
**`kind-writer`** — rewrites teen posts to be kinder ("Help me write kindly" feature).

(Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com). Both functions fail-safe: reports default to "medium" priority and the kind-writer returns the original text if the AI is unavailable.)

(Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com). If you
skip this step, reports still save — they'll just default to "medium" priority instead of
being AI-classified, see the fail-safe in `supabase/functions/triage-report/index.ts`.)

### 6. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with your GitHub account → **Add New →
   Project** → import your `together-app` repo.
2. Vercel auto-detects Vite — leave the build settings as default.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same
   values as your `.env`).
4. Click **Deploy**. After it finishes, copy the live URL.
5. Go back to Supabase → **Authentication → URL Configuration** and set your **Site URL** to
   that Vercel URL (and add it under redirect URLs too), so Google sign-in redirects correctly
   in production.

That's it — the live link, the public repo, and the working Google sign-in + AI-triaged
reporting are now all in place.

---

## Project structure

```
together-app/
  DESIGN.md             design system reference
  docs/ERD.md            data model + integrations table
  supabase/
    schema.sql            full DB schema + RLS policies
    seed.sql               starter groups & badges
    functions/
      triage-report/         AI report-triage Edge Function
  src/
    main.jsx, App.jsx
    context/AuthContext.jsx   Supabase auth/session state
    lib/
      supabaseClient.js
      api.js                  all Supabase queries, in one place
    styles/globals.css
    components/                16 reusable UI components
    pages/                      8 routed screens (see DESIGN.md)
```

## Known limitations (by design, for this scope)

- Image upload on the New Post screen is a visual placeholder — wiring real upload to Supabase
  Storage is a natural next step.
- Chat is a single demo thread with whichever other user signed up first — a full
  conversations list is the next iteration.
- `is_safety_team` (who can view `reports`) is a manual flag you'd set directly in the database
  for a real moderator account; there's no admin UI for it yet.
