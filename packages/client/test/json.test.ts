import { describe, expect, it } from "vitest";
import { extractLikelyJSON, parseJSONStrict } from "../src/llm/prompt/json.js";

describe("extractLikelyJSON", () => {
  it("extracts fenced json", () => {
    const t = "hello\n```json\n{\"a\":1}\n```\nbye";
    expect(extractLikelyJSON(t)).toBe("{\"a\":1}");
  });

  it("extracts any fenced block", () => {
    const t = "Sure:\n```\n{\"x\": 2}\n```\nend";
    expect(extractLikelyJSON(t)).toBe("{\"x\": 2}");
  });

  it("extracts first object from prose", () => {
    const t = "Sure. {\"a\": {\"b\": 2}} trailing";
    expect(extractLikelyJSON(t)).toBe("{\"a\": {\"b\": 2}}");
  });

  it("handles nested braces", () => {
    const t = "Here: {\"x\": {\"y\": {\"z\": 1}}} done";
    expect(extractLikelyJSON(t)).toBe("{\"x\": {\"y\": {\"z\": 1}}}");
  });

  it("handles strings with braces", () => {
    const t = "{\"msg\": \"hello { world }\"}";
    expect(extractLikelyJSON(t)).toBe("{\"msg\": \"hello { world }\"}");
  });

  it("returns original if no object", () => {
    const t = "no json here";
    expect(extractLikelyJSON(t)).toBe("no json here");
  });
});

describe("parseJSONStrict", () => {
  it("parses clean JSON", () => {
    expect(parseJSONStrict("{\"a\":1}")).toEqual({ a: 1 });
  });

  it("parses fenced JSON", () => {
    expect(parseJSONStrict("```json\n{\"b\":2}\n```")).toEqual({ b: 2 });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseJSONStrict("not json")).toThrow();
  });
});
