import { describe, expect, it } from "vitest";
import { sha256 } from "../src/server/packs/download.js";

describe("13.2.1 sha256", () => {
  it("returns 64 hex chars", () => {
    const hash = sha256("abc");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic", () => {
    const h1 = sha256("test content");
    const h2 = sha256("test content");
    expect(h1).toBe(h2);
  });

  it("differs for different inputs", () => {
    const h1 = sha256("input1");
    const h2 = sha256("input2");
    expect(h1).not.toBe(h2);
  });
});
