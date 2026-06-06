# Bengaluru Roads v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the v1 core loop: an anonymous user draws a bad-road stretch on a map, it snaps to the real road network, auto-computes length, captures severity, lands on a live severity/corroboration map, and produces a WhatsApp-shareable card.

**Architecture:** Next.js (App Router, TypeScript) frontend with Tailwind + shadcn/ui for ALL UI. Mapbox GL JS renders the map; the Mapbox Directions API snaps user-clicked waypoints to road centerlines and returns accurate length. Supabase (Postgres + PostGIS) stores reports as `LineString` geometry; spatial corroboration ("is there an existing nearby report?") runs as a PostGIS RPC. Auth is a pluggable anonymous session token (localStorage UUID) so phone OTP slots in later without a rewrite. Report detail pages render dynamic Open Graph images via the Mapbox Static Images API for rich WhatsApp/Twitter previews.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Mapbox GL JS + Mapbox Directions/Static APIs, @turf/turf, Supabase (Postgres + PostGIS), Vitest + Testing Library, Zod.

---

## External Prerequisites (user/operator must provide)

These are accounts/secrets the build needs. The app scaffolds and tests without them, but the map and DB are inert until set. Put them in `.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk....          # Mapbox public token (GL JS, Directions, Static)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # server-only, never client-exposed
```

- **Mapbox:** free tier covers 50k map loads + 100k Directions requests/mo. Restrict token to URL `localhost` + prod domain.
- **Supabase:** create a project, enable the PostGIS extension (migration does this), copy the URL + keys.

These are external-account steps Claude cannot do; the operator runs them. Build proceeds against them once present.

---

## File Structure

**App / routes**
- `app/layout.tsx` — root layout, fonts, Tailwind, theme provider
- `app/page.tsx` — main map screen (the whole v1 loop)
- `app/r/[id]/page.tsx` — single-report detail (share landing page)
- `app/r/[id]/opengraph-image.tsx` — dynamic OG image (static Mapbox map) for previews
- `app/api/reports/route.ts` — `GET` (all reports as GeoJSON) + `POST` (create)
- `app/api/reports/[id]/confirm/route.ts` — `POST` corroborate an existing report

**Components (all shadcn/ui + Tailwind)**
- `components/map/MapView.tsx` — Mapbox GL map container + layers
- `components/map/DrawController.tsx` — waypoint capture + snapped-line preview
- `components/map/ReportLayers.tsx` — renders existing reports as line layers colored by severity/corroboration
- `components/report/ReportSheet.tsx` — shadcn `Sheet` holding the report form
- `components/report/SeveritySelect.tsx` — 3-button consequence-based severity picker
- `components/report/DamageTypeChips.tsx` — optional multi-select chips
- `components/report/ShareCard.tsx` — post-submit shareable card + WhatsApp link
- `components/report/CorroboratePrompt.tsx` — "N nearby reports — confirm?" UI
- `components/ui/*` — shadcn primitives (button, sheet, badge, sonner, etc.)

**Lib**
- `lib/supabase/client.ts` — browser client (anon key)
- `lib/supabase/server.ts` — server client (service role)
- `lib/geo/snap.ts` — call Mapbox Directions, return snapped GeoJSON LineString + length_m
- `lib/geo/staticMap.ts` — build a Mapbox Static Images URL for a LineString
- `lib/session.ts` — get-or-create anon session UUID (pluggable auth seam)
- `lib/share.ts` — build WhatsApp share URL + report URL
- `lib/types.ts` — shared types (`Report`, `Severity`, `DamageType`, `NewReport`)
- `lib/schema.ts` — Zod schemas for API input validation

**Database**
- `supabase/migrations/0001_init.sql` — PostGIS, `reports`, `corroborations`, indexes, RPC
- `supabase/migrations/0002_wards.sql` — `wards` table + `report_ward()` derivation (boundary data load is a follow-up task; column is nullable)

**Config / tests**
- `.env.local.example`, `vitest.config.ts`, `vitest.setup.ts`
- `lib/geo/length.test.ts`, `lib/geo/snap.test.ts`, `lib/session.test.ts`, `lib/schema.test.ts`
- `app/api/reports/route.test.ts`

---

## Severity scale (locked default, consequence-based)

| Value | Label | Meaning |
|-------|-------|---------|
| 1 | Annoying | Rough surface / minor potholes. Uncomfortable, not damaging. |
| 2 | Damaging | Potholes/breaks that risk tyre/suspension/vehicle damage. |
| 3 | Dangerous | Impassable, accident risk, or unsafe (deep craters, missing slab, flooding). |

---

## Task 0: Scaffold project

**Files:**
- Create: whole Next.js app, `package.json`, `tsconfig.json`, Tailwind config, `.env.local.example`, `.gitignore`

- [ ] **Step 1: Create Next.js app (TypeScript, Tailwind, App Router, src-less)**

Run:
```bash
cd /Users/girishpatil/projects-e/2000-crore
pnpm dlx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm
```
Expected: scaffolds into the current directory.

- [ ] **Step 2: Init git and first commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js + Tailwind app"
```

- [ ] **Step 3: Init shadcn/ui**

Run:
```bash
pnpm dlx shadcn@latest init -d
```
Expected: creates `components.json`, `lib/utils.ts`, wires Tailwind tokens.

- [ ] **Step 4: Add the shadcn primitives this plan uses**

```bash
pnpm dlx shadcn@latest add button sheet badge sonner card input textarea toggle-group skeleton
```
Expected: files land under `components/ui/`.

- [ ] **Step 5: Install runtime + dev deps**

```bash
pnpm add mapbox-gl @turf/turf @supabase/supabase-js zod uuid
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react @types/mapbox-gl @types/uuid
```

- [ ] **Step 6: Create `.env.local.example`**

```
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 7: Add `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

And `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 8: Verify build + commit**

```bash
pnpm build
git add -A && git commit -m "chore: add shadcn, deps, vitest"
```
Expected: build succeeds.

---

## Task 1: Shared types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Define types**

```ts
export type Severity = 1 | 2 | 3;

export const DAMAGE_TYPES = [
  "potholes",
  "no_asphalt",
  "flooding",
  "utility_dig",
  "under_construction",
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export interface NewReport {
  geometry: GeoJSON.LineString; // snapped, WGS84
  lengthM: number;
  severity: Severity;
  damageTypes: DamageType[];
  note?: string;
  sessionId: string;
}

export interface Report extends NewReport {
  id: string;
  corroborationCount: number;
  createdAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts && git commit -m "feat: shared report types"
```

---

## Task 2: Anonymous session (pluggable auth seam)

**Files:**
- Create: `lib/session.ts`
- Test: `lib/session.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSessionId } from "@/lib/session";

describe("getSessionId", () => {
  beforeEach(() => localStorage.clear());

  it("creates and persists a stable id", () => {
    const a = getSessionId();
    const b = getSessionId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/session.test.ts`
Expected: FAIL ("getSessionId is not a function" / module not found).

- [ ] **Step 3: Implement**

```ts
import { v4 as uuid } from "uuid";

const KEY = "br_session_id";

// Auth seam: today this is an anonymous device id. Phone-OTP later swaps the
// implementation (return the verified user id) without touching call sites.
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(KEY, id);
  }
  return id;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/session.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/session.ts lib/session.test.ts && git commit -m "feat: anonymous session id"
```

---

## Task 3: Zod input schema

**Files:**
- Create: `lib/schema.ts`
- Test: `lib/schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { newReportSchema } from "@/lib/schema";

const valid = {
  geometry: { type: "LineString", coordinates: [[77.59, 12.97], [77.60, 12.98]] },
  lengthM: 1234.5,
  severity: 2,
  damageTypes: ["potholes"],
  sessionId: "abc",
};

describe("newReportSchema", () => {
  it("accepts a valid report", () => {
    expect(newReportSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects severity out of range", () => {
    expect(newReportSchema.safeParse({ ...valid, severity: 5 }).success).toBe(false);
  });
  it("rejects a non-LineString geometry", () => {
    expect(
      newReportSchema.safeParse({ ...valid, geometry: { type: "Point", coordinates: [0, 0] } }).success
    ).toBe(false);
  });
  it("rejects a line with fewer than 2 points", () => {
    expect(
      newReportSchema.safeParse({ ...valid, geometry: { type: "LineString", coordinates: [[0, 0]] } }).success
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/schema.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
import { z } from "zod";
import { DAMAGE_TYPES } from "@/lib/types";

const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const newReportSchema = z.object({
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(position).min(2),
  }),
  lengthM: z.number().positive().max(200_000),
  severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  damageTypes: z.array(z.enum(DAMAGE_TYPES)).default([]),
  note: z.string().max(500).optional(),
  sessionId: z.string().min(1),
});

export type NewReportInput = z.infer<typeof newReportSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts lib/schema.test.ts && git commit -m "feat: zod schema for report input"
```

---

## Task 4: Length helper (fallback geometry length)

**Files:**
- Create: `lib/geo/length.ts`
- Test: `lib/geo/length.test.ts`

(Directions API returns distance, but we recompute defensively from geometry so length never trusts the client blindly.)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { lineLengthMeters } from "@/lib/geo/length";

describe("lineLengthMeters", () => {
  it("computes ~1.1km for a ~0.01deg latitude step", () => {
    const m = lineLengthMeters({
      type: "LineString",
      coordinates: [[77.59, 12.97], [77.59, 12.98]],
    });
    expect(m).toBeGreaterThan(1000);
    expect(m).toBeLessThan(1200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/geo/length.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
import { length as turfLength, lineString } from "@turf/turf";

export function lineLengthMeters(geom: GeoJSON.LineString): number {
  return turfLength(lineString(geom.coordinates), { units: "meters" });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/geo/length.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/geo/length.ts lib/geo/length.test.ts && git commit -m "feat: geometry length helper"
```

---

## Task 5: Snap-to-road (Mapbox Directions)

**Files:**
- Create: `lib/geo/snap.ts`
- Test: `lib/geo/snap.test.ts`

- [ ] **Step 1: Write the failing test** (mock fetch)

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { snapWaypoints } from "@/lib/geo/snap";

const fakeResponse = {
  routes: [
    {
      distance: 842.3,
      geometry: { type: "LineString", coordinates: [[77.59, 12.97], [77.595, 12.975], [77.60, 12.98]] },
    },
  ],
};

afterEach(() => vi.restoreAllMocks());

describe("snapWaypoints", () => {
  it("returns snapped geometry + length from Directions", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(fakeResponse), { status: 200 })));
    const r = await snapWaypoints([[77.59, 12.97], [77.60, 12.98]], "tok");
    expect(r.lengthM).toBeCloseTo(842.3, 1);
    expect(r.geometry.coordinates.length).toBe(3);
  });

  it("throws when no route found", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })));
    await expect(snapWaypoints([[0, 0], [1, 1]], "tok")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/geo/snap.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
type LngLat = [number, number];

export interface SnapResult {
  geometry: GeoJSON.LineString;
  lengthM: number;
}

export async function snapWaypoints(waypoints: LngLat[], token: string): Promise<SnapResult> {
  if (waypoints.length < 2) throw new Error("need at least two waypoints");
  const coords = waypoints.map((c) => c.join(",")).join(";");
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
    `?geometries=geojson&overview=full&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("no route found for these points");
  return { geometry: route.geometry as GeoJSON.LineString, lengthM: route.distance as number };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/geo/snap.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/geo/snap.ts lib/geo/snap.test.ts && git commit -m "feat: snap waypoints to roads via Mapbox Directions"
```

---

## Task 6: Database schema + corroboration RPC

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `supabase/migrations/0002_wards.sql`

- [ ] **Step 1: Write `0001_init.sql`**

```sql
create extension if not exists postgis;

create table reports (
  id uuid primary key default gen_random_uuid(),
  geom geometry(LineString, 4326) not null,
  length_m double precision not null check (length_m > 0),
  severity smallint not null check (severity between 1 and 3),
  damage_types text[] not null default '{}',
  note text check (char_length(note) <= 500),
  session_id text not null,
  ward_id bigint,
  constituency text,
  created_at timestamptz not null default now()
);
create index reports_geom_gix on reports using gist (geom);
create index reports_created_idx on reports (created_at desc);

-- one corroboration per session per report
create table corroborations (
  report_id uuid not null references reports(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (report_id, session_id)
);

-- derived count for display
create or replace function corroboration_count(r reports)
returns bigint language sql stable as $$
  select count(*) from corroborations c where c.report_id = r.id;
$$;

-- find existing reports overlapping a candidate line (within ~25m, sharing >40% length)
create or replace function nearby_reports(candidate geometry, buffer_m double precision default 25)
returns table (id uuid, severity smallint, length_m double precision, corroborations bigint, overlap_ratio double precision)
language sql stable as $$
  with cand as (select st_transform(candidate, 3857) as g)
  select r.id, r.severity, r.length_m,
         (select count(*) from corroborations c where c.report_id = r.id) as corroborations,
         st_length(st_intersection(st_buffer((select g from cand), buffer_m), st_transform(r.geom, 3857)))
           / nullif(st_length(st_transform(r.geom, 3857)), 0) as overlap_ratio
  from reports r
  where st_dwithin(st_transform(r.geom, 3857), (select g from cand), buffer_m)
  order by overlap_ratio desc
  limit 10;
$$;
```

- [ ] **Step 2: Write `0002_wards.sql`** (boundary rows loaded later; derivation ready)

```sql
create table wards (
  id bigserial primary key,
  name text not null,
  constituency text,
  geom geometry(MultiPolygon, 4326) not null
);
create index wards_geom_gix on wards using gist (geom);

-- set ward_id + constituency for a report by point-in-polygon on its midpoint
create or replace function set_report_ward() returns trigger language plpgsql as $$
declare w record;
begin
  select id, constituency into w
  from wards
  where st_contains(geom, st_lineinterpolatepoint(new.geom, 0.5))
  limit 1;
  if found then
    new.ward_id := w.id;
    new.constituency := w.constituency;
  end if;
  return new;
end $$;

create trigger trg_set_report_ward
  before insert on reports
  for each row execute function set_report_ward();
```

- [ ] **Step 3: Apply migrations**

Run (against the Supabase project — operator may use the SQL editor or CLI):
```bash
# Option A (CLI): supabase db push
# Option B: paste each migration into Supabase Studio > SQL editor and run
```
Expected: tables `reports`, `corroborations`, `wards` exist; PostGIS enabled.

- [ ] **Step 4: Add RLS policies (anon insert + read, no update/delete)**

```sql
alter table reports enable row level security;
alter table corroborations enable row level security;

create policy reports_read on reports for select using (true);
create policy reports_insert on reports for insert with check (true);
create policy corr_read on corroborations for select using (true);
create policy corr_insert on corroborations for insert with check (true);
```
Append to `0001_init.sql`, re-run.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations && git commit -m "feat: postgis schema, corroboration + ward derivation"
```

---

## Task 7: Supabase clients

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Browser client**

```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] **Step 2: Server client (service role, server-only)**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

Run: `pnpm add server-only`

- [ ] **Step 3: Commit**

```bash
git add lib/supabase && git commit -m "feat: supabase clients"
```

---

## Task 8: Reports API (`POST` create, `GET` list)

**Files:**
- Create: `app/api/reports/route.ts`
- Test: `app/api/reports/route.test.ts`

- [ ] **Step 1: Write the failing test** (mock the supabase server client)

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const insert = vi.fn();
const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: () => ({
    from: () => ({ insert: (...a: unknown[]) => insert(...a) }),
    rpc: (...a: unknown[]) => rpc(...a),
  }),
}));

import { POST } from "@/app/api/reports/route";

const body = {
  geometry: { type: "LineString", coordinates: [[77.59, 12.97], [77.60, 12.98]] },
  lengthM: 1100,
  severity: 2,
  damageTypes: ["potholes"],
  sessionId: "s1",
};

beforeEach(() => { insert.mockReset(); rpc.mockReset(); });

describe("POST /api/reports", () => {
  it("rejects invalid input with 400", async () => {
    const res = await POST(new Request("http://x/api/reports", {
      method: "POST", body: JSON.stringify({ ...body, severity: 9 }),
    }));
    expect(res.status).toBe(400);
  });

  it("inserts a valid report and returns 201", async () => {
    insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "r1" }, error: null }) }) });
    const res = await POST(new Request("http://x/api/reports", {
      method: "POST", body: JSON.stringify(body),
    }));
    expect(res.status).toBe(201);
    expect(insert).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run app/api/reports/route.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
import { NextResponse } from "next/server";
import { newReportSchema } from "@/lib/schema";
import { lineLengthMeters } from "@/lib/geo/length";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = newReportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const r = parsed.data;
  // trust geometry, recompute length server-side
  const lengthM = lineLengthMeters(r.geometry);
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("reports")
    .insert({
      geom: r.geometry, // PostGIS accepts GeoJSON via supabase-js -> use ST_GeomFromGeoJSON in a view if needed
      length_m: lengthM,
      severity: r.severity,
      damage_types: r.damageTypes,
      note: r.note ?? null,
      session_id: r.sessionId,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET() {
  const sb = supabaseServer();
  // returns reports as GeoJSON FeatureCollection via an RPC (Task 8b)
  const { data, error } = await sb.rpc("reports_geojson");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 3b: Add `reports_geojson` RPC + GeoJSON insert handling to `0001_init.sql`**

```sql
-- accept GeoJSON text on insert via a BEFORE trigger that converts to geometry
-- (supabase-js sends geom as JSON; store into a jsonb staging column then convert)
alter table reports add column if not exists geom_json jsonb;

create or replace function reports_geojson()
returns jsonb language sql stable as $$
  select coalesce(jsonb_build_object(
    'type','FeatureCollection',
    'features', jsonb_agg(jsonb_build_object(
      'type','Feature',
      'id', r.id,
      'geometry', st_asgeojson(r.geom)::jsonb,
      'properties', jsonb_build_object(
        'severity', r.severity,
        'lengthM', r.length_m,
        'damageTypes', r.damage_types,
        'corroborations', (select count(*) from corroborations c where c.report_id = r.id),
        'createdAt', r.created_at
      )
    ))
  ), jsonb_build_object('type','FeatureCollection','features','[]'::jsonb))
  from reports r;
$$;
```

> **Geometry insert note:** supabase-js cannot directly write a `geometry` column from JS. Use one of: (a) an RPC `create_report(geojson jsonb, ...)` that calls `ST_GeomFromGeoJSON`, or (b) PostgREST with a `text`/`jsonb` column + BEFORE-INSERT trigger converting `geom_json` → `geom`. **Recommended:** implement an RPC `create_report` and call `sb.rpc("create_report", {...})` instead of `.insert`. Update Task 8 Step 3 to call the RPC; update the test mock accordingly (`rpc` instead of `insert`). This keeps geometry handling in Postgres.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run app/api/reports/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/reports supabase/migrations && git commit -m "feat: reports create+list API"
```

---

## Task 9: Corroborate API

**Files:**
- Create: `app/api/reports/[id]/confirm/route.ts`

- [ ] **Step 1: Implement** (insert is idempotent via PK; conflict = already confirmed)

```ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionId } = await req.json().catch(() => ({ sessionId: null }));
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  const sb = supabaseServer();
  const { error } = await sb
    .from("corroborations")
    .upsert({ report_id: id, session_id: sessionId }, { onConflict: "report_id,session_id", ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { count } = await sb
    .from("corroborations")
    .select("*", { count: "exact", head: true })
    .eq("report_id", id);
  return NextResponse.json({ count: count ?? 0 });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/reports && git commit -m "feat: corroborate endpoint"
```

---

## Task 10: Map screen — render + existing reports

**Files:**
- Create: `components/map/MapView.tsx`, `components/map/ReportLayers.tsx`
- Modify: `app/page.tsx`

> Map interactions are verified manually in the browser (Mapbox GL can't render in jsdom). Keep logic in tested lib funcs; keep components thin.

- [ ] **Step 1: `MapView.tsx`** — mount Mapbox centered on Bengaluru (12.9716, 77.5946), expose map via callback.

```tsx
"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function MapView({ onReady }: { onReady: (m: mapboxgl.Map) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.5946, 12.9716],
      zoom: 12,
    });
    map.on("load", () => onReady(map));
    return () => map.remove();
  }, [onReady]);
  return <div ref={ref} className="absolute inset-0" />;
}
```

- [ ] **Step 2: `ReportLayers.tsx`** — fetch `/api/reports`, add a `line` layer colored by severity, width by corroborations.

```tsx
"use client";
import { useEffect } from "react";
import type mapboxgl from "mapbox-gl";

export function useReportLayer(map: mapboxgl.Map | null) {
  useEffect(() => {
    if (!map) return;
    let cancelled = false;
    (async () => {
      const fc = await fetch("/api/reports").then((r) => r.json());
      if (cancelled || !map) return;
      if (map.getSource("reports")) (map.getSource("reports") as mapboxgl.GeoJSONSource).setData(fc);
      else {
        map.addSource("reports", { type: "geojson", data: fc });
        map.addLayer({
          id: "reports-line",
          type: "line",
          source: "reports",
          paint: {
            "line-width": ["interpolate", ["linear"], ["coalesce", ["get", "corroborations"], 0], 0, 3, 50, 10],
            "line-color": ["match", ["get", "severity"], 1, "#f59e0b", 2, "#f97316", 3, "#dc2626", "#9ca3af"],
            "line-opacity": 0.85,
          },
        });
      }
    })();
    return () => { cancelled = true; };
  }, [map]);
}
```

- [ ] **Step 3: Wire `app/page.tsx`** to mount `MapView` + apply `useReportLayer`. Manual verify: `pnpm dev`, see Bengaluru map + any seeded reports as colored lines.

- [ ] **Step 4: Commit**

```bash
git add app components && git commit -m "feat: map view + report layer"
```

---

## Task 11: Draw + snap flow

**Files:**
- Create: `components/map/DrawController.tsx`

- [ ] **Step 1: Implement** — on "Add a bad road" click, enter draw mode: each map click pushes a waypoint marker; "Done" calls `snapWaypoints` and shows the snapped preview line + computed length.

Key behaviors:
- Tapping the map appends a `[lng,lat]` waypoint and renders a pin.
- A "preview" GeoJSON source shows the raw waypoint line; after Done, replaced by the snapped line.
- On Done: `const { geometry, lengthM } = await snapWaypoints(points, token)`, show `ReportSheet` (Task 12) with the result.
- "Undo" pops the last waypoint; "Cancel" clears.

(Full component code written during implementation; depends on `MapView` map instance + `snapWaypoints`.)

- [ ] **Step 2: Manual verify** — drop 2+ points along a road, Done snaps the line to the road and shows length in meters.

- [ ] **Step 3: Commit**

```bash
git add components/map/DrawController.tsx && git commit -m "feat: draw + snap flow"
```

---

## Task 12: Report sheet (severity, damage, note, submit)

**Files:**
- Create: `components/report/ReportSheet.tsx`, `SeveritySelect.tsx`, `DamageTypeChips.tsx`

- [ ] **Step 1: `SeveritySelect.tsx`** — three shadcn `ToggleGroup` buttons: 1 Annoying / 2 Damaging / 3 Dangerous, color-coded amber/orange/red.

- [ ] **Step 2: `DamageTypeChips.tsx`** — optional multi-select chips for the 5 damage types (shadcn `Badge`/`Toggle`).

- [ ] **Step 3: `ReportSheet.tsx`** — shadcn `Sheet` showing: computed length (read-only), required `SeveritySelect`, optional chips + `Textarea`. Submit `POST /api/reports` with `getSessionId()`; on success show `ShareCard` (Task 13) and refresh the report layer. Disable submit until severity chosen; `sonner` toast on error.

- [ ] **Step 4: Manual verify** — full path: draw → snap → pick severity → submit → new line appears on the map.

- [ ] **Step 5: Commit**

```bash
git add components/report && git commit -m "feat: report submission sheet"
```

---

## Task 13: Corroborate prompt

**Files:**
- Create: `components/report/CorroboratePrompt.tsx`
- Modify: `DrawController.tsx`

- [ ] **Step 1:** After the user finishes drawing (before opening a fresh report sheet), call `nearby_reports` (via a small RPC endpoint or `/api/reports?near=...`). If overlap_ratio > 0.4 for any existing report, show `CorroboratePrompt`: "This stretch looks already flagged (N reports). Confirm it / Add a different part."
- [ ] **Step 2:** "Confirm" → `POST /api/reports/[id]/confirm` with sessionId; toast the new count; refresh layer (line gets thicker). "It's different" → continue to a fresh `ReportSheet`.
- [ ] **Step 3: Add the near-query endpoint** `app/api/reports/near/route.ts` calling `sb.rpc("nearby_reports", { candidate, buffer_m })`.
- [ ] **Step 4: Manual verify** — draw over an existing reported stretch → prompt appears → confirm bumps the count + thickens the line.
- [ ] **Step 5: Commit**

```bash
git add app components && git commit -m "feat: corroboration prompt"
```

---

## Task 14: Share card + report detail + OG image

**Files:**
- Create: `components/report/ShareCard.tsx`, `lib/share.ts`, `lib/geo/staticMap.ts`, `app/r/[id]/page.tsx`, `app/r/[id]/opengraph-image.tsx`

- [ ] **Step 1: `lib/geo/staticMap.ts`** — build a Mapbox Static Images URL overlaying the report's GeoJSON line.

```ts
export function staticMapUrl(geojson: GeoJSON.LineString, token: string, w = 1200, h = 630) {
  const overlay = encodeURIComponent(
    JSON.stringify({ type: "Feature", properties: { stroke: "#dc2626", "stroke-width": 5 }, geometry: geojson })
  );
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${overlay})/auto/${w}x${h}?padding=60&access_token=${token}`;
}
```

- [ ] **Step 2: `lib/share.ts`** — `reportUrl(id)` and `whatsappShareUrl(text, url)` (`https://wa.me/?text=...`).

- [ ] **Step 3: `app/r/[id]/page.tsx`** — server-fetch the report, show static map + severity + length + a "Report another / Open the map" CTA.

- [ ] **Step 4: `app/r/[id]/opengraph-image.tsx`** — return the static map image so WhatsApp/Twitter render a rich preview.

- [ ] **Step 5: `ShareCard.tsx`** — after submit, show the static map thumbnail + a WhatsApp share button (deep link) + copy-link.

- [ ] **Step 6: Manual verify** — submit, open the share link, confirm the OG preview renders the map (test with WhatsApp/Twitter card validator).

- [ ] **Step 7: Commit**

```bash
git add app components lib && git commit -m "feat: shareable report card + OG image"
```

---

## Task 15: Landing polish + empty/loading states

**Files:**
- Modify: `app/page.tsx`; Create: `components/map/MapChrome.tsx`

- [ ] **Step 1:** Add a top bar (app name, one-line non-partisan tagline: "Help make Bengaluru's roads better - map the bad stretches"), a floating "Add a bad road" primary button (shadcn), and a legend (severity colors). Skeleton while reports load. NO party/CM language anywhere.
- [ ] **Step 2:** Mobile-first layout: bottom sheet on small screens, side panel on desktop (responsive Tailwind).
- [ ] **Step 3: Manual verify** on a phone viewport.
- [ ] **Step 4: Commit**

```bash
git add app components && git commit -m "feat: landing chrome + responsive polish"
```

---

## Deferred to later phases (NOT in v1)

- Phone OTP (swap `lib/session.ts` impl).
- Photos (Supabase Storage + face/plate blur).
- Real BBMP ward boundary import into `wards` (derivation trigger already ready).
- Phase-2 accountability: ingest official relaying list (RTI/tender), gap comparison view.
- Kannada i18n (keep copy in a string table from the start to ease this).
- Moderation auto-hide-below-threshold (v1 = rate-limit + manual review).
- Offline queue-and-sync.

---

## Self-Review

- **Spec coverage:** draw (T11) → snap (T5, T11) → length (T4, T8) → severity (T12) → corroboration (T6, T13) → live heatmap/line layer (T10) → WhatsApp share (T14). Anon session/auth seam (T2). Ward instrumentation (T6). Non-partisan framing (T15). All v1 spec items mapped.
- **Open dependency:** geometry insert from supabase-js needs the `create_report` RPC (flagged in Task 8 Step 3b) — implement the RPC form, not raw `.insert`, and adjust the Task 8 test mock to spy on `rpc`.
- **Mapbox vs MapLibre:** v1 uses Mapbox GL JS for one-vendor simplicity within the free tier; stored geometry is ours, so OSM/MapLibre swap stays open. No lock-in on the data.
