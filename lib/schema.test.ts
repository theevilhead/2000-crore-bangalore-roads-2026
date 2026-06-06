import { describe, it, expect } from "vitest";
import { newReportSchema } from "@/lib/schema";

const valid = {
  geometry: { type: "LineString", coordinates: [[77.59, 12.97], [77.6, 12.98]] },
  lengthM: 1234.5,
  severity: 2,
  damageTypes: ["potholes"],
  sessionId: "abc",
};

describe("newReportSchema", () => {
  it("accepts a valid report", () => {
    expect(newReportSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects severity out of range", () => {
    expect(newReportSchema.safeParse({ ...valid, severity: 5 }).success).toBe(false);
  });
  it("rejects a non-LineString geometry", () => {
    expect(
      newReportSchema.safeParse({ ...valid, geometry: { type: "Point", coordinates: [0, 0] } }).success
    ).toBe(false);
  });
  it("rejects a line with fewer than 2 points", () => {
    expect(
      newReportSchema.safeParse({ ...valid, geometry: { type: "LineString", coordinates: [[0, 0]] } }).success
    ).toBe(false);
  });
});
