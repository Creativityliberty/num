import { ExternalAgent, ImportWarning } from "./types.js";
export declare function readCustomModesYaml(inputPath: string): {
    agents: ExternalAgent[];
    warnings: ImportWarning[];
};
