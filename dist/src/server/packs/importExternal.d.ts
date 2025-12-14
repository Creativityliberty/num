import { ExternalImportInput } from "../../core/externalImport.schema.js";
export declare function importExternalModes(input: ExternalImportInput): Promise<{
    ok: boolean;
    importedCount: number;
    writtenFiles: string[];
    packJsonPath: string;
    warnings: any[];
}>;
