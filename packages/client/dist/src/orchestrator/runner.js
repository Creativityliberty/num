import { parseJSONStrict } from "../llm/prompt/json.js";
import { promptPackToMessages } from "../llm/prompt/normalize.js";
import { McpToolClient as McpToolClientClass } from "../mcp/client.js";
import { withRetries } from "../util/retry.js";
import { InvalidModelJSONError, MCPToolError, SchemaValidationError } from "./errors.js";
import { explainManualNextStep, formatPolicyBlockHint } from "./policy.js";
import { PlanPayloadSchema, ReviewOutputPayloadSchema, RunOutputPayloadSchema } from "./schemas.js";
function schemaFor(expected) {
    if (expected === "PlanJSON")
        return PlanPayloadSchema;
    if (expected === "RunJSON")
        return RunOutputPayloadSchema;
    return ReviewOutputPayloadSchema;
}
async function ensureClient(mcp) {
    if (typeof mcp.callToolJSON === "function") {
        return { client: mcp, close: async () => { } };
    }
    const client = await McpToolClientClass.connectStdio(mcp);
    return { client, close: async () => client.close() };
}
export async function runOrchestration(opts) {
    const log = opts.onLog ?? (() => { });
    const maxModelJSONRetries = opts.maxModelJSONRetries ?? 2;
    const { client, close } = await ensureClient(opts.mcp);
    try {
        log("Starting orchestrate.run ...");
        const start = await client.callToolJSON("orchestrate.run", {
            task: opts.task,
            flow: opts.flow ?? {},
            modeId: opts.modeId,
        });
        let cur = start;
        log(`runId=${cur.runId} state=${cur.state}`);
        while (true) {
            const step = cur.nextStep;
            if (step.kind === "done") {
                const doneResult = { status: "done", runId: cur.runId, sessionId: cur.sessionId };
                if (cur.bundlePath !== undefined)
                    doneResult.bundlePath = cur.bundlePath;
                if (cur.git !== undefined)
                    doneResult.git = cur.git;
                return doneResult;
            }
            if (step.kind === "manual") {
                const msg = formatPolicyBlockHint(explainManualNextStep(step));
                const manualResult = { status: "manual", runId: cur.runId, sessionId: cur.sessionId, message: msg };
                if (step.suggestedTools !== undefined)
                    manualResult.suggestedTools = step.suggestedTools;
                return manualResult;
            }
            if (step.kind !== "llm") {
                return { status: "failed", runId: cur.runId, sessionId: cur.sessionId, error: { message: "Unknown nextStep" } };
            }
            log(`LLM step=${step.stepId} expected=${step.expected}`);
            const messages = promptPackToMessages(step.promptPack);
            const expected = step.expected;
            const zschema = schemaFor(expected);
            const payload = await withRetries(async (attempt) => {
                const raw = await opts.adapter.completeJSON({ messages, expected, maxRetries: 0 });
                let parsed;
                try {
                    parsed = parseJSONStrict(raw);
                }
                catch {
                    if (attempt < maxModelJSONRetries) {
                        const jsonOnly = [
                            ...messages,
                            {
                                role: "user",
                                content: "Return ONLY valid JSON. No markdown, no prose. Ensure it parses with JSON.parse().",
                            },
                        ];
                        const raw2 = await opts.adapter.completeJSON({ messages: jsonOnly, expected, maxRetries: 0 });
                        try {
                            parsed = parseJSONStrict(raw2);
                        }
                        catch {
                            throw new InvalidModelJSONError(expected, raw2);
                        }
                    }
                    else {
                        throw new InvalidModelJSONError(expected, raw);
                    }
                }
                const v = zschema.safeParse(parsed);
                if (!v.success) {
                    if (attempt < maxModelJSONRetries) {
                        const fix = [
                            ...messages,
                            {
                                role: "user",
                                content: `Your JSON did not match the required schema. Fix it and return ONLY valid JSON.\nIssues:\n${JSON.stringify(v.error.issues, null, 2)}`,
                            },
                        ];
                        const raw3 = await opts.adapter.completeJSON({ messages: fix, expected, maxRetries: 0 });
                        const parsed3 = parseJSONStrict(raw3);
                        const v3 = zschema.safeParse(parsed3);
                        if (!v3.success)
                            throw new SchemaValidationError(expected, v3.error.issues);
                        return v3.data;
                    }
                    throw new SchemaValidationError(expected, v.error.issues);
                }
                return v.data;
            }, {
                retries: 0,
            });
            log(`Submitting orchestrate.continue stepId=${step.stepId} ...`);
            try {
                cur = await client.callToolJSON("orchestrate.continue", {
                    runId: cur.runId,
                    stepId: step.stepId,
                    payload,
                });
                log(`state=${cur.state}`);
            }
            catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                throw new MCPToolError("orchestrate.continue", msg);
            }
        }
    }
    catch (e) {
        const err = e instanceof Error ? { name: e.name, message: e.message } : { message: String(e) };
        return { status: "failed", error: err };
    }
    finally {
        await close();
    }
}
//# sourceMappingURL=runner.js.map