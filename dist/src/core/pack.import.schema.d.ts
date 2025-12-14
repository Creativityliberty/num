import { z } from "zod";
export declare const PackImportUrlSchema: z.ZodObject<{
    url: z.ZodString;
    sha256: z.ZodOptional<z.ZodString>;
    allowOverwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    url?: string;
    sha256?: string;
    allowOverwrite?: boolean;
}, {
    url?: string;
    sha256?: string;
    allowOverwrite?: boolean;
}>;
export type PackImportUrl = z.infer<typeof PackImportUrlSchema>;
