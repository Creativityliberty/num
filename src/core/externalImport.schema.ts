import { z } from "zod";

export const ExternalImportSourceSchema = z.enum(["customModesYaml", "docDump"]);

export const ExternalImportInputSchema = z.object({
  sourceType: ExternalImportSourceSchema,
  inputPath: z.string(),
  outModesDir: z.string().default("./modes/num"),
  packId: z.string().default("num-pack"),
  packOutDir: z.string().default("./packs/num-pack"),
  dryRun: z.boolean().optional().default(false),
  idPrefix: z.string().optional().default("num:"),
  // 20.0.1: alias chefs (sparc -> orchestrator)
  aliasChefs: z.boolean().optional().default(true),
  // 20.0.2: ensure chef stubs exist (disabled by default)
  ensureChefStubs: z.boolean().optional().default(true),
  chefStubMode: z.enum(["disabled", "enabled"]).optional().default("disabled"),
  // Bonus: write YAML files for humans
  writePackYaml: z.boolean().optional().default(true),
  writeManifestYaml: z.boolean().optional().default(true),
});

export const ExternalImportWarningSchema = z.object({
  kind: z.string(),
  message: z.string(),
  ref: z.string().optional(),
});

export const ExternalImportResultSchema = z.object({
  ok: z.boolean(),
  importedCount: z.number(),
  writtenFiles: z.array(z.string()).default([]),
  packJsonPath: z.string().optional(),
  packBundlePath: z.string().optional(),
  warnings: z.array(ExternalImportWarningSchema).default([]),
});

export type ExternalImportInput = z.infer<typeof ExternalImportInputSchema>;
export type ExternalImportResult = z.infer<typeof ExternalImportResultSchema>;
