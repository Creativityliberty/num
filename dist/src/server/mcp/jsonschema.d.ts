import { z } from "zod";
export type JsonSchema = Record<string, unknown>;
export declare function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema;
