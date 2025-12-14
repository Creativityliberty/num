import { z } from "zod";
import { FlowSpecSchema } from "./schemas.js";
export const CatalogAgentSchema = z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    flow: FlowSpecSchema,
    enabled: z.boolean().optional().default(true),
});
export const CatalogSchema = z.object({
    version: z.literal("1").default("1"),
    namespace: z.string().optional(),
    agents: z.array(CatalogAgentSchema).min(1),
});
