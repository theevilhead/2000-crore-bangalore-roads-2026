import { length as turfLength, lineString } from "@turf/turf";

export function lineLengthMeters(geom: GeoJSON.LineString): number {
  return turfLength(lineString(geom.coordinates), { units: "meters" });
}
