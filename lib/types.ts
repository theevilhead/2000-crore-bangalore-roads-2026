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
  "open_manhole",
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  potholes: "Potholes",
  no_asphalt: "No asphalt / broken surface",
  flooding: "Waterlogging / flooding",
  utility_dig: "Dug up (utility work)",
  under_construction: "Under construction",
  open_manhole: "Open manhole / missing cover",
};

// Optional 1-10 condition vs the well-kept roads around Cubbon Park.
// Higher = better: 10 is "smooth, like Cubbon Park", 1 is the worst you have seen.
export const CONDITION_MIN = 1;
export const CONDITION_MAX = 10;
export const CONDITION_ANCHOR_LOW = "Worst";
export const CONDITION_ANCHOR_HIGH = "Smooth, like Cubbon Park";

export interface NewReport {
  geometry: GeoJSON.LineString; // snapped, WGS84
  lengthM: number;
  severity: Severity;
  damageTypes: DamageType[];
  condition?: number; // 1-10, optional; 10 = smooth like Cubbon Park
  note?: string;
  sessionId: string;
}

export interface Report extends NewReport {
  id: string;
  corroborationCount: number;
  createdAt: string;
}
