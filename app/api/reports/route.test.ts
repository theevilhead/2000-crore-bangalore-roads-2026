import { describe, it, expect, vi, beforeEach } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: () => ({ rpc: (...a: unknown[]) => rpc(...a) }),
}));

import { POST } from "@/app/api/reports/route";

const body = {
  geometry: { type: "LineString", coordinates: [[77.59, 12.97], [77.6, 12.98]] },
  lengthM: 1100,
  severity: 2,
  damageTypes: ["potholes"],
  sessionId: "s1",
};

beforeEach(() => rpc.mockReset());

describe("POST /api/reports", () => {
  it("rejects invalid input with 400 and does not touch the db", async () => {
    const res = await POST(
      new Request("http://x/api/reports", { method: "POST", body: JSON.stringify({ ...body, severity: 9 }) })
    );
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("creates a valid report via create_report and returns 201", async () => {
    rpc.mockResolvedValue({ data: "r1", error: null });
    const res = await POST(
      new Request("http://x/api/reports", { method: "POST", body: JSON.stringify(body) })
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "r1" });
    expect(rpc).toHaveBeenCalledWith("create_report", expect.objectContaining({ p_severity: 2, p_session_id: "s1" }));
  });
});
