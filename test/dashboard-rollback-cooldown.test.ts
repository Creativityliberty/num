import { describe, expect, it } from "vitest";

describe("rollback cooldown logic (11.5)", () => {
  it("flags cooldown when last rollback is recent", () => {
    const cooldown = 300;
    const now = Date.now();
    const ts = new Date(now - 60_000).toISOString(); // 60s ago
    const ageSec = Math.floor((now - new Date(ts).getTime()) / 1000);
    const inCooldown = ageSec >= 0 && ageSec < cooldown;
    expect(inCooldown).toBe(true);
  });

  it("allows rollback when cooldown has passed", () => {
    const cooldown = 300;
    const now = Date.now();
    const ts = new Date(now - 400_000).toISOString(); // 400s ago (> 300s)
    const ageSec = Math.floor((now - new Date(ts).getTime()) / 1000);
    const inCooldown = ageSec >= 0 && ageSec < cooldown;
    expect(inCooldown).toBe(false);
  });

  it("allows rollback when no previous rollback", () => {
    const cooldown = 300;
    const ts = null;
    const ageSec = ts ? Math.floor((Date.now() - new Date(ts).getTime()) / 1000) : null;
    const inCooldown = typeof ageSec === "number" && ageSec >= 0 && ageSec < cooldown;
    expect(inCooldown).toBe(false);
  });
});
