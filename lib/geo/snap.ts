type LngLat = [number, number];

export interface SnapResult {
  geometry: GeoJSON.LineString;
  lengthM: number;
}

// Snaps user-clicked waypoints to road centerlines via the Mapbox Directions API.
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
