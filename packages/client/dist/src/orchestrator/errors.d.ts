export declare class MCPToolError extends Error {
    tool: string;
    constructor(tool: string, message: string);
}
export declare class InvalidModelJSONError extends Error {
    expected: string;
    raw: string;
    constructor(expected: string, raw: string, message?: string);
}
export declare class SchemaValidationError extends Error {
    expected: string;
    issues: unknown;
    constructor(expected: string, issues: unknown);
}
//# sourceMappingURL=errors.d.ts.map