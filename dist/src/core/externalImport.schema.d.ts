import { z } from "zod";
export declare const ExternalImportSourceSchema: z.ZodEnum<["customModesYaml", "docDump"]>;
export declare const ExternalImportInputSchema: z.ZodObject<{
    sourceType: z.ZodEnum<["customModesYaml", "docDump"]>;
    inputPath: z.ZodString;
    outModesDir: z.ZodDefault<z.ZodString>;
    packId: z.ZodDefault<z.ZodString>;
    packOutDir: z.ZodDefault<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idPrefix: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    aliasChefs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    ensureChefStubs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    chefStubMode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["disabled", "enabled"]>>>;
    writePackYaml: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    writeManifestYaml: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    dryRun?: boolean;
    packId?: string;
    sourceType?: "customModesYaml" | "docDump";
    inputPath?: string;
    outModesDir?: string;
    packOutDir?: string;
    idPrefix?: string;
    aliasChefs?: boolean;
    ensureChefStubs?: boolean;
    chefStubMode?: "enabled" | "disabled";
    writePackYaml?: boolean;
    writeManifestYaml?: boolean;
}, {
    dryRun?: boolean;
    packId?: string;
    sourceType?: "customModesYaml" | "docDump";
    inputPath?: string;
    outModesDir?: string;
    packOutDir?: string;
    idPrefix?: string;
    aliasChefs?: boolean;
    ensureChefStubs?: boolean;
    chefStubMode?: "enabled" | "disabled";
    writePackYaml?: boolean;
    writeManifestYaml?: boolean;
}>;
export declare const ExternalImportWarningSchema: z.ZodObject<{
    kind: z.ZodString;
    message: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    kind?: string;
    ref?: string;
}, {
    message?: string;
    kind?: string;
    ref?: string;
}>;
export declare const ExternalImportResultSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    importedCount: z.ZodNumber;
    writtenFiles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    packJsonPath: z.ZodOptional<z.ZodString>;
    packBundlePath: z.ZodOptional<z.ZodString>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        kind: z.ZodString;
        message: z.ZodString;
        ref: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        kind?: string;
        ref?: string;
    }, {
        message?: string;
        kind?: string;
        ref?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    ok?: boolean;
    importedCount?: number;
    warnings?: {
        message?: string;
        kind?: string;
        ref?: string;
    }[];
    writtenFiles?: string[];
    packJsonPath?: string;
    packBundlePath?: string;
}, {
    ok?: boolean;
    importedCount?: number;
    warnings?: {
        message?: string;
        kind?: string;
        ref?: string;
    }[];
    writtenFiles?: string[];
    packJsonPath?: string;
    packBundlePath?: string;
}>;
export type ExternalImportInput = z.infer<typeof ExternalImportInputSchema>;
export type ExternalImportResult = z.infer<typeof ExternalImportResultSchema>;
