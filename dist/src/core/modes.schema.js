import { z } from "zod";
import { AgentRuntimePolicySchema } from "./models.schema.js";
import { FlowSpecSchema } from "./schemas.js";
// Minimal mode schema extension: allow embedding flow DSL in mode json
export const ModeSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    prompt: z.any().optional(),
    tags: z.array(z.string()).optional(),
    // 13.1: runtime policy (model/budget/rateLimit)
    runtimePolicy: AgentRuntimePolicySchema.optional(),
    // 12.6.1: flow DSL embedded in mode
    flow: FlowSpecSchema.optional(),
}).passthrough();
