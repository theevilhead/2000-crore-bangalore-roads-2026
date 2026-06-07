import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Severity } from "@/lib/types";

const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

// Full report set as GeoJSON, fetched server-side (no public bulk endpoint).
export async function getReportsGeoJSON(): Promise<GeoJSON.FeatureCollection> {
  const sb = supabaseServer();
  const { data, error } = await sb.rpc("reports_geojson");
  if (error || !data?.type) return EMPTY_FC;
  return data as GeoJSON.FeatureCollection;
}

export interface SeverityStat {
  severity: Severity;
  count: number;
  km: number;
}

export interface WorstStretch {
  id: string;
  severity: Severity;
  lengthM: number;
  corroborations: number;
}

export interface DashboardStats {
  totalReports: number;
  totalKm: number;
  bySeverity: SeverityStat[];
  worst: WorstStretch[];
}

const EMPTY_STATS: DashboardStats = { totalReports: 0, totalKm: 0, bySeverity: [], worst: [] };

export async function getDashboardStats(): Promise<DashboardStats> {
  const sb = supabaseServer();
  const { data, error } = await sb.rpc("dashboard_stats");
  if (error || !data) return EMPTY_STATS;
  return data as DashboardStats;
}
