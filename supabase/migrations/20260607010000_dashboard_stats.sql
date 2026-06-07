-- Aggregate stats for the public dashboard. Returns only rollups + a small
-- leaderboard, never the full per-report dump.
create or replace function dashboard_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'totalReports', (select count(*) from reports),
    'totalKm', round((coalesce((select sum(length_m) from reports), 0) / 1000.0)::numeric, 1),
    'bySeverity', coalesce((
      select jsonb_agg(s order by s ->> 'severity')
      from (
        select jsonb_build_object(
          'severity', severity,
          'count', count(*),
          'km', round((sum(length_m) / 1000.0)::numeric, 1)
        ) as s
        from reports
        group by severity
      ) bs
    ), '[]'::jsonb),
    'worst', coalesce((
      select jsonb_agg(w)
      from (
        select jsonb_build_object(
          'id', r.id,
          'severity', r.severity,
          'lengthM', r.length_m,
          'corroborations', (select count(*) from corroborations c where c.report_id = r.id)
        ) as w
        from reports r
        order by (select count(*) from corroborations c where c.report_id = r.id) desc, r.length_m desc
        limit 10
      ) lw
    ), '[]'::jsonb)
  );
$$;
