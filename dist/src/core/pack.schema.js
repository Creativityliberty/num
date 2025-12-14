import { z } from "zod";
import { AgentRuntimePolicySchema } from "./models.schema.js";
export const PackSchema = z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
    enabled: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional(),
    // 13.1: runtime policy for all modes in this pack
    runtimePolicy: AgentRuntimePolicySchema.optional(),
});
