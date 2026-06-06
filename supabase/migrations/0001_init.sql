-- Bengaluru Roads v1 - core schema
create extension if not exists postgis;

create table if not exists reports (
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
create index if not exists reports_geom_gix on reports using gist (geom);
create index if not exists reports_created_idx on reports (created_at desc);

-- one corroboration per session per report
create table if not exists corroborations (
  report_id uuid not null references reports(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (report_id, session_id)
);

-- Create a report from GeoJSON. Length is computed authoritatively in PostGIS
-- (geography metres), never trusting any client-supplied value.
create or replace function create_report(
  p_geojson jsonb,
  p_severity smallint,
  p_damage_types text[],
  p_note text,
  p_session_id text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  g geometry;
  new_id uuid;
begin
  g := st_setsrid(st_geomfromgeojson(p_geojson::text), 4326);
  if st_geometrytype(g) <> 'ST_LineString' then
    raise exception 'geometry must be a LineString';
  end if;
  insert into reports (geom, length_m, severity, damage_types, note, session_id)
  values (
    g,
    st_length(g::geography),
    p_severity,
    coalesce(p_damage_types, '{}'),
    nullif(btrim(coalesce(p_note, '')), ''),
    p_session_id
  )
  returning id into new_id;
  return new_id;
end $$;

-- All reports as a GeoJSON FeatureCollection, with live corroboration counts.
create or replace function reports_geojson()
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(jsonb_build_object(
      'type', 'Feature',
      'id', r.id,
      'geometry', st_asgeojson(r.geom)::jsonb,
      'properties', jsonb_build_object(
        'id', r.id,
        'severity', r.severity,
        'lengthM', r.length_m,
        'damageTypes', r.damage_types,
        'corroborations', (select count(*) from corroborations c where c.report_id = r.id),
        'createdAt', r.created_at
      )
    ))
  ), jsonb_build_object('type', 'FeatureCollection', 'features', '[]'::jsonb))
  from reports r;
$$;

-- Existing reports overlapping a candidate line (within buffer_m metres),
-- ranked by how much of the existing report the candidate covers.
create or replace function nearby_reports(p_geojson jsonb, buffer_m double precision default 25)
returns table (
  id uuid,
  severity smallint,
  length_m double precision,
  corroborations bigint,
  overlap_ratio double precision
)
language sql
stable
set search_path = public
as $$
  with cand as (
    select st_transform(st_setsrid(st_geomfromgeojson(p_geojson::text), 4326), 3857) as g
  )
  select
    r.id,
    r.severity,
    r.length_m,
    (select count(*) from corroborations c where c.report_id = r.id) as corroborations,
    st_length(
      st_intersection(st_buffer((select g from cand), buffer_m), st_transform(r.geom, 3857))
    ) / nullif(st_length(st_transform(r.geom, 3857)), 0) as overlap_ratio
  from reports r
  where st_dwithin(st_transform(r.geom, 3857), (select g from cand), buffer_m)
  order by overlap_ratio desc nulls last
  limit 10;
$$;

-- RLS: public read. All writes go through the server (service role) via the
-- RPCs above, which bypass RLS. No anon write policy is granted.
alter table reports enable row level security;
alter table corroborations enable row level security;

drop policy if exists reports_read on reports;
create policy reports_read on reports for select using (true);

drop policy if exists corr_read on corroborations;
create policy corr_read on corroborations for select using (true);
