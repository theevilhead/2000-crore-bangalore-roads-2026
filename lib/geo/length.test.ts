import { describe, it, expect } from "vitest";
import { lineLengthMeters } from "@/lib/geo/length";

describe("lineLengthMeters", () => {
  it("computes ~1.1km for a ~0.01deg latitude step", () => {
    const m = lineLengthMeters({
      type: "LineString",
      coordinates: [[77.59, 12.97], [77.59, 12.98]],
    });
    expect(m).toBeGreaterThan(1000);
    expect(m).toBeLessThan(1200);
  });
});
