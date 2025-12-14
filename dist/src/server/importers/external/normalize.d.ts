import { ExternalAgent, ImportWarning } from "./types.js";
type ModeLike = Record<string, unknown>;
export declare function selectFlowTemplate(groups?: string[]): "num.flow.plan-implement-review-security" | "num.flow.plan-research-synthesize" | "num.flow.tool-driven" | "num.flow.solo";
export declare function groupsToTags(groups?: string[]): string[];
export type NormalizeOpts = {
    idPrefix: string;
    aliasChefs?: boolean;
    ensureChefStubs?: boolean;
    chefStubMode?: "disabled" | "enabled";
};
export declare function normalizeExternalAgents(input: ExternalAgent[], opts: NormalizeOpts): {
    modes: ModeLike[];
    warnings: ImportWarning[];
};
export {};
