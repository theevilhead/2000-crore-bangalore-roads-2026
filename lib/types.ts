export type Severity = 1 | 2 | 3;

export const SEVERITY_META: Record<Severity, { label: string; help: string; color: string }> = {
  1: { label: "Annoying", help: "Rough surface or minor potholes. Uncomfortable, not damaging.", color: "#f59e0b" },
  2: { label: "Damaging", help: "Potholes or breaks that risk tyre, suspension or vehicle damage.", color: "#f97316" },
  3: { label: "Dangerous", help: "Impassable, accident risk, or unsafe (deep craters, missing slab, flooding).", color: "#dc2626" },
};

export const DAMAGE_TYPES = [
  "potholes",
  "no_asphalt",
  "flooding",
  "utility_dig",
  "under_construction",
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  potholes: "Potholes",
  no_asphalt: "No asphalt / broken surface",
  flooding: "Waterlogging / flooding",
  utility_dig: "Dug up (utility work)",
  under_construction: "Under construction",
};

export interface NewReport {
  geometry: GeoJSON.LineString; // snapped, WGS84
  lengthM: number;
  severity: Severity;
  damageTypes: DamageType[];
  note?: string;
  sessionId: string;
}

export interface Report extends NewReport {
  id: string;
  corroborationCount: number;
  createdAt: string;
}
