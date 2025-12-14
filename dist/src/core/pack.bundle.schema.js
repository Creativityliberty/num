import { z } from "zod";
import { PackSchema } from "./pack.schema.js";
export const PackFileEntrySchema = z.object({
    path: z.string().min(1),
    content: z.string(),
});
export const PackBundleSchema = z.object({
    format: z.literal("mcp-agents-pack").default("mcp-agents-pack"),
    version: z.literal("1").default("1"),
    pack: PackSchema,
    files: z.array(PackFileEntrySchema).default([]),
});
