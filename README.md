# Open Mic Night

A mobile-first web app for managing open mic signups with a backing band. Performers scan a QR code to join the queue, pick songs from the band's library (or submit requests), and see their position in line.

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with sample songs
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key URLs

| URL | Purpose |
|-----|---------|
| `/admin` | Host dashboard (passcode: `openmic2024`) |
| `/join/friday` | Performer signup page (share this via QR code) |
| `/band/friday` | Band stage view - shows Now Playing / On Deck |

## Features

### For Performers
- Scan QR code to join
- Sign up with name only (no account needed)
- Choose: Solo or With Band
- Pick from song library or submit requests
- Add notes (key changes, capo, start point)
- See queue position and status updates

### For Host/Admin
- Create and manage events
- Drag-to-reorder queue
- Mark performers: On Deck → Performing → Done/No-show
- Approve/decline song requests with messages
- Manage song library (CRUD)
- Generate QR codes

### For Band
- Large typography stage display
- See current performer + song details (key, tempo, notes)
- See who's on deck
- Auto-refreshes every 5 seconds

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **Tailwind CSS v4**
- **SQLite** via Turso/libsql
- **Drizzle ORM**
- **dnd-kit** for drag-and-drop

## Project Structure

```
app/
  page.tsx                    # Home/redirect
  join/[code]/                # Performer QR landing
  signup/[eventId]/           # Signup form + song picker
  me/[eventId]/               # Performer status view
  admin/
    page.tsx                  # Login
    events/                   # Event management
    queue/[eventId]/          # Queue dashboard
    songs/                    # Song library
  band/[code]/                # Stage display
  api/
    events/                   # Event CRUD
    signups/                  # Signup CRUD
    songs/                    # Song CRUD
    admin/auth/               # Passcode auth

components/
  ui/                         # Button, Input, Card, Badge
  SongPicker.tsx              # Song search modal

lib/
  db.ts                       # Drizzle client
  schema.ts                   # Database schema
  auth.ts                     # Admin session
  device.ts                   # Device ID tracking
  seed.ts                     # Sample data
```

## Environment Variables

Create `.env` or `.env.local`:

```env
TURSO_DATABASE_URL=file:./local.db
TURSO_AUTH_TOKEN=
ADMIN_PASSCODE=openmic2024
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. For production, use [Turso](https://turso.tech) for hosted SQLite

## Database Commands

```bash
npm run db:seed      # Seed with sample songs
npm run db:studio    # Open Drizzle Studio
npm run db:push      # Push schema changes
```
