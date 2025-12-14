export type LLMMessage = {
    role: "system" | "developer" | "user";
    content: string;
};
export type ExpectedSchemaName = "PlanJSON" | "RunJSON" | "ReviewJSON";
export interface LLMAdapter {
    id: string;
    completeJSON(opts: {
        messages: LLMMessage[];
        expected: ExpectedSchemaName;
        maxRetries?: number;
    }): Promise<string>;
}
//# sourceMappingURL=adapter.d.ts.map