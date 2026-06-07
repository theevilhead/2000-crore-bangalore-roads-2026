export interface PlaceResult {
  id: string;
  name: string;
  center: [number, number];
}

// Forward geocoding via Mapbox, biased to Bengaluru.
export async function searchPlaces(
  query: string,
  token: string,
  signal?: AbortSignal
): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 3 || !token) return [];
  const params = new URLSearchParams({
    q,
    access_token: token,
    limit: "6",
    country: "in",
    language: "en",
    proximity: "77.5946,12.9716",
    bbox: "77.35,12.75,77.85,13.20",
    types: "address,street,place,locality,neighborhood",
  });
  const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features ?? [])
    .map((f: {
      id?: string;
      properties?: { mapbox_id?: string; full_address?: string; name?: string; place_formatted?: string };
      geometry?: { coordinates?: [number, number] };
    }) => ({
      id: f.properties?.mapbox_id ?? f.id ?? f.properties?.full_address ?? crypto.randomUUID(),
      name: f.properties?.full_address ?? f.properties?.name ?? f.properties?.place_formatted ?? "",
      center: f.geometry?.coordinates as [number, number],
    }))
    .filter((r: PlaceResult) => Array.isArray(r.center) && r.name);
}
