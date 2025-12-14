import type { TaskEnvelope, UniversalMode } from "./schemas.js";
export type Suggestion = {
    modeId: string;
    confidence: number;
    score: number;
    rationale: string[];
};
export declare function suggestModes(allModes: UniversalMode[], task: TaskEnvelope, topK: number): Suggestion[];
