-- Optional 1-10 condition score (10 = smooth like Cubbon Park, 1 = worst).
alter table reports
  add column if not exists condition smallint check (condition is null or condition between 1 and 10);

-- Recreate create_report with the new optional p_condition parameter.
drop function if exists create_report(jsonb, smallint, text[], text, text);

create or replace function create_report(
  p_geojson jsonb,
  p_severity smallint,
  p_damage_types text[],
  p_note text,
  p_session_id text,
  p_condition smallint default null
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
  insert into reports (geom, length_m, severity, damage_types, note, session_id, condition)
  values (
    g,
    st_length(g::geography),
    p_severity,
    coalesce(p_damage_types, '{}'),
    nullif(btrim(coalesce(p_note, '')), ''),
    p_session_id,
    p_condition
  )
  returning id into new_id;
  return new_id;
end $$;

-- Expose condition on the single-report feature (share / detail page).
create or replace function report_feature(p_id uuid)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'id', r.id,
    'geometry', st_asgeojson(r.geom)::jsonb,
    'severity', r.severity,
    'lengthM', r.length_m,
    'damageTypes', r.damage_types,
    'condition', r.condition,
    'corroborations', (select count(*) from corroborations c where c.report_id = r.id),
    'createdAt', r.created_at
  )
  from reports r
  where r.id = p_id;
$$;
