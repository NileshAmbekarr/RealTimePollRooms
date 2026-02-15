# Real-Time Poll Rooms

A lightweight, frictionless real-time polling web app. Create a poll in seconds, share a link, and watch votes come in live.

**[Live Demo →](https://real-time-poll-rooms-two.vercel.app/)**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Supabase |
| Real-Time | Supabase Realtime (Postgres Changes) |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A Supabase project

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd RealTimePollRooms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Run the database migration (see schema below)

# Start the dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/publishable key |

---

## Features

- **Instant Poll Creation** — No accounts needed. Enter a question + options, get a shareable link
- **Real-Time Results** — All connected users see vote updates instantly via Supabase Realtime
- **Anti-Abuse Protection** — Dual-layer: localStorage lock + server-side IP hash deduplication
- **Mobile Responsive** — Works beautifully on all screen sizes
- **Dark Theme** — Premium glassmorphic UI with gradient accents

---

## Architecture

### Database Schema

```
polls                  options                votes
├── id (uuid, PK)      ├── id (uuid, PK)      ├── id (uuid, PK)
├── question (text)    ├── poll_id (FK)        ├── poll_id (FK)
└── created_at         ├── text (text)         ├── option_id (FK)
                       └── (FK → polls.id)     ├── ip_hash (text)
                                               └── created_at
                                               
                       UNIQUE INDEX: (poll_id, ip_hash)
```

### Real-Time Flow

```
User votes → Server Action → INSERT into votes table
                                    ↓
                           Supabase Realtime detects INSERT
                                    ↓
                           All subscribed clients receive event
                                    ↓
                           UI updates vote counts + bars instantly
```

---

## Anti-Abuse Mechanisms

### Mechanism A — Client-Side Vote Lock (localStorage)

**What it prevents:** Same browser re-voting after page refresh or navigation.

**How it works:** After a successful vote, the poll ID and selected option are stored in `localStorage`. On page load, the app checks if the user has already voted and shows results instead of the voting UI.

**Known bypasses:**
- Incognito/private browsing mode
- Clearing browser storage
- Using a different browser
- Different device

### Mechanism B — Server-Side IP Hash Deduplication

**What it prevents:** Same IP address voting multiple times on the same poll.

**How it works:** The client IP is extracted from request headers (`x-forwarded-for` / `x-real-ip`), hashed with SHA-256 for privacy, and stored with each vote. A `UNIQUE INDEX` on `(poll_id, ip_hash)` enforces one vote per IP per poll at the database level.

**Known bypasses:**
- VPN or proxy services
- Mobile data network changes
- Shared public IPs (may block legitimate users)

### Why these mechanisms?

Both provide complementary coverage — localStorage handles the common case (same user, same browser), while IP hashing catches attempts from the same network even if cookies are cleared. Together they cover the majority of casual abuse without requiring user authentication.

---

## Edge Cases Handled

| Edge Case | Handling |
|---|---|
| Poll does not exist | 404 page with "Create a Poll" link |
| Duplicate option names | Client + server validation with error message |
| Rapid repeated voting | localStorage lock + DB unique constraint |
| Two users voting simultaneously | Database handles concurrent inserts correctly |
| Refresh after voting | localStorage preserves voted state |
| Network disconnect | Supabase client auto-reconnects to Realtime channel |
| Malformed/invalid poll ID | Supabase query returns null → 404 page |
| Empty question or options | Client-side + server-side validation |

---

## Known Limitations

1. **IP-based voting can be bypassed** via VPN, proxy, or mobile networks
2. **localStorage can be cleared** or circumvented with incognito mode
3. **No user authentication** — identity is weak (IP + browser session)
4. **Supabase Realtime** depends on database events; brief delays possible under load
5. **Not suitable for large public voting events** (1000+ concurrent users per poll)
6. **No poll expiration** — polls remain open indefinitely
7. **No admin controls** — no way to close, delete, or moderate polls
8. **Shared IPs** (corporate networks, university WiFi) may prevent legitimate votes

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Home — Create Poll form
│   ├── globals.css             # Tailwind + custom styles
│   └── poll/[id]/page.tsx      # Poll — Vote + Live Results
├── components/
│   ├── CreatePollForm.tsx      # Poll creation with validation
│   ├── PollView.tsx            # Voting + Realtime results
│   └── ResultBar.tsx           # Animated percentage bar
├── actions/
│   ├── createPoll.ts           # Server Action: create poll
│   └── submitVote.ts           # Server Action: submit vote
└── lib/
    ├── supabase.ts             # Browser Supabase client
    └── supabase-server.ts      # Server Supabase client
```

---