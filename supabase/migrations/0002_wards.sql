-- Ward / constituency instrumentation for phase-2 joins.
-- Boundary rows are imported separately (BBMP ward shapefiles); the derivation
-- trigger below is ready now and is a no-op until `wards` is populated.
create table if not exists wards (
  id bigserial primary key,
  name text not null,
  constituency text,
  geom geometry(MultiPolygon, 4326) not null
);
create index if not exists wards_geom_gix on wards using gist (geom);

-- Set ward_id + constituency for a report by point-in-polygon on its midpoint.
create or replace function set_report_ward()
returns trigger
language plpgsql
set search_path = public
as $$
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

drop trigger if exists trg_set_report_ward on reports;
create trigger trg_set_report_ward
  before insert on reports
  for each row execute function set_report_ward();
