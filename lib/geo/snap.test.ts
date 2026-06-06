import { describe, it, expect, vi, afterEach } from "vitest";
import { snapWaypoints } from "@/lib/geo/snap";

const fakeResponse = {
  routes: [
    {
      distance: 842.3,
      geometry: { type: "LineString", coordinates: [[77.59, 12.97], [77.595, 12.975], [77.6, 12.98]] },
    },
  ],
};

afterEach(() => vi.restoreAllMocks());

describe("snapWaypoints", () => {
  it("returns snapped geometry + length from Directions", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(fakeResponse), { status: 200 })));
    const r = await snapWaypoints([[77.59, 12.97], [77.6, 12.98]], "tok");
    expect(r.lengthM).toBeCloseTo(842.3, 1);
    expect(r.geometry.coordinates.length).toBe(3);
  });

  it("throws when no route found", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ routes: [] }), { status: 200 })));
    await expect(snapWaypoints([[0, 0], [1, 1]], "tok")).rejects.toThrow();
  });
});
