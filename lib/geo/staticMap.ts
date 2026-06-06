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
      geometry: geojson,
    })
  );
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `geojson(${overlay})/auto/${width}x${height}` +
    `?padding=60&access_token=${token}`
  );
}
