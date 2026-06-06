import { describe, it, expect, beforeEach } from "vitest";
import { getSessionId } from "@/lib/session";

describe("getSessionId", () => {
  beforeEach(() => localStorage.clear());

  it("creates and persists a stable id", () => {
    const a = getSessionId();
    const b = getSessionId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).toBe(b);
  });
});
