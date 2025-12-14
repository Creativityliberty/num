export class MCPToolError extends Error {
  tool: string;
  constructor(tool: string, message: string) {
    super(message);
    this.name = "MCPToolError";
    this.tool = tool;
  }
}

export class InvalidModelJSONError extends Error {
  expected: string;
  raw: string;
  constructor(expected: string, raw: string, message?: string) {
    super(message ?? "Model output is not valid JSON.");
    this.name = "InvalidModelJSONError";
    this.expected = expected;
    this.raw = raw;
  }
}

export class SchemaValidationError extends Error {
  expected: string;
  issues: unknown;
  constructor(expected: string, issues: unknown) {
    super("Model JSON does not match expected schema.");
    this.name = "SchemaValidationError";
    this.expected = expected;
    this.issues = issues;
  }
}
