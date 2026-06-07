"use server";

import { getReportsGeoJSON } from "@/lib/reports-data";

// Used by the client map to refresh after a submit/corroborate, instead of a
// public GET endpoint.
export async function fetchReports(): Promise<GeoJSON.FeatureCollection> {
  return getReportsGeoJSON();
}
