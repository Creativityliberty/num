import { z } from "zod";

export const PackImportUrlSchema = z.object({
  url: z.string().url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  allowOverwrite: z.boolean().optional().default(false),
});

export type PackImportUrl = z.infer<typeof PackImportUrlSchema>;
