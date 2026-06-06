import { simplify, lineString } from "@turf/turf";

// Mapbox Static Images encodes the overlay geometry in the URL, which has a
// length limit (~8KB). Long stretches have hundreds of points and overflow it,
// returning a broken image. Reduce the geometry to a bounded number of points.
function reduceForUrl(geom: GeoJSON.LineString, maxPoints = 80): GeoJSON.LineString {
  let coords = geom.coordinates;
  if (coords.length > maxPoints) {
    const s = simplify(lineString(coords), { tolerance: 0.0002, highQuality: false });
    coords = s.geometry.coordinates;
  }
  if (coords.length > maxPoints) {
    const step = Math.ceil(coords.length / maxPoints);
    const sampled = coords.filter((_, i) => i % step === 0);
    const last = coords[coords.length - 1];
    if (sampled[sampled.length - 1] !== last) sampled.push(last);
    coords = sampled;
  }
  return { type: "LineString", coordinates: coords };
}

// Builds a Mapbox Static Images URL with the report line overlaid, for share
// cards and Open Graph previews.
export function staticMapUrl(
  geojson: GeoJSON.LineString,
  token: string,
  width = 1200,
  height = 630
): string {
  const overlay = encodeURIComponent(
    JSON.stringify({
      type: "Feature",
      properties: { stroke: "#dc2626", "stroke-width": 5 },
      geometry: reduceForUrl(geojson),
    })
  );
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `geojson(${overlay})/auto/${width}x${height}` +
    `?padding=60&access_token=${token}`
  );
}
