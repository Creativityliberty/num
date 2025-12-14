export class MCPToolError extends Error {
    tool;
    constructor(tool, message) {
        super(message);
        this.name = "MCPToolError";
        this.tool = tool;
    }
}
export class InvalidModelJSONError extends Error {
    expected;
    raw;
    constructor(expected, raw, message) {
        super(message ?? "Model output is not valid JSON.");
        this.name = "InvalidModelJSONError";
        this.expected = expected;
        this.raw = raw;
    }
}
export class SchemaValidationError extends Error {
    expected;
    issues;
    constructor(expected, issues) {
        super("Model JSON does not match expected schema.");
        this.name = "SchemaValidationError";
        this.expected = expected;
        this.issues = issues;
    }
}
//# sourceMappingURL=errors.js.map