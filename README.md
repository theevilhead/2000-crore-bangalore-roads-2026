# Fix Bengaluru Roads

Citizen map to crowdsource bad road stretches in Bengaluru, so the Rs 2000 crore
relaying work reaches the roads that need it most. Non-partisan, no logins.

Draw a stretch → it snaps to the real road network → auto-computes length → you
tag severity → it lands on a live map where others can corroborate it → you get a
WhatsApp-shareable card.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Base UI) for all UI
- Mapbox GL JS (map), Mapbox Directions (snapping), Mapbox Static Images (share/OG)
- Supabase (Postgres + PostGIS): geometry storage + spatial corroboration RPCs
- Vitest for tests

## Setup

1. Install deps:
   ```bash
   pnpm install
   ```

2. Create `.env.local` from the example and fill it in:
   ```bash
   cp .env.local.example .env.local
   ```
   - `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox public token. Restrict it by URL.
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY` - from your Supabase project (Settings > API).

3. Apply the database schema. In Supabase Studio > SQL editor, run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_wards.sql`

   (Or with the Supabase CLI: `supabase db push`.)

4. Run:
   ```bash
   pnpm dev      # http://localhost:3000
   pnpm test     # unit tests
   pnpm build    # production build + typecheck
   ```

## How it fits together

- `lib/geo/snap.ts` - snaps clicked waypoints to road centerlines (Directions API).
- `supabase/migrations/0001_init.sql` - `reports`, `corroborations`, and RPCs:
  - `create_report` - inserts from GeoJSON, computes authoritative length in PostGIS.
  - `reports_geojson` - all reports as a FeatureCollection (with corroboration counts).
  - `nearby_reports` - finds existing reports overlapping a candidate line.
  - `report_feature` - one report, for the share page.
- `app/api/reports/*` - create / list / confirm / near endpoints (server, service role).
- `components/map/RoadMap.tsx` - the whole client loop (draw, snap, corroborate, submit).
- `app/r/[id]/page.tsx` - share landing page with a rich Open Graph map preview.

## Notes

- Identity is an anonymous session id (`lib/session.ts`) for now. It is a seam:
  swap the implementation for phone-OTP later without touching call sites.
- Ward / constituency derivation (`0002_wards.sql`) is wired but inert until BBMP
  ward boundaries are imported into the `wards` table (phase-2 instrumentation).
- Severity is consequence-based: 1 Annoying, 2 Damaging, 3 Dangerous.
