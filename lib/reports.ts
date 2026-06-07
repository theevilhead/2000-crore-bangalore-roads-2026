import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { DamageType, Severity } from "@/lib/types";

export interface ReportFeature {
  id: string;
  geometry: GeoJSON.LineString;
  severity: Severity;
  lengthM: number;
  damageTypes: DamageType[];
  condition: number | null;
  corroborations: number;
  createdAt: string;
}

export async function getReportFeature(id: string): Promise<ReportFeature | null> {
  const sb = supabaseServer();
  const { data, error } = await sb.rpc("report_feature", { p_id: id });
  if (error || !data) return null;
  return data as ReportFeature;
}
