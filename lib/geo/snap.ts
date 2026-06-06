type LngLat = [number, number];

export interface SnapResult {
  geometry: GeoJSON.LineString;
  lengthM: number;
}

// Snaps user-clicked waypoints to road centerlines via the Mapbox Directions API.
// Uses the `walking` profile on purpose: we are tracing a physical road stretch,
// not planning a legal drive, so one-way and turn restrictions must be ignored.
// Walking treats roads as bidirectional, so the line follows what the user drew.
export async function snapWaypoints(
  waypoints: LngLat[],
  token: string,
  profile: "walking" | "driving" | "cycling" = "walking"
): Promise<SnapResult> {
  if (waypoints.length < 2) throw new Error("need at least two waypoints");
  const coords = waypoints.map((c) => c.join(",")).join(";");
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}` +
    `?geometries=geojson&overview=full&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("no route found for these points");
  return { geometry: route.geometry as GeoJSON.LineString, lengthM: route.distance as number };
}
