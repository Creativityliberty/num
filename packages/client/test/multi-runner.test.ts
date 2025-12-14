import { describe, expect, it } from "vitest";
import { runMultiAgentsSerial } from "../src/orchestrator/multiRunner.js";

// Placeholder test - full integration requires MCP server running
describe("multiRunner (12.1)", () => {
  it("exports runMultiAgentsSerial", () => {
    expect(typeof runMultiAgentsSerial).toBe("function");
  });
});
