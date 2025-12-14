import type { TaskEnvelope, UniversalMode } from "./schemas.js";
export type RunPromptPack = {
    system: string;
    developer: string;
    task: TaskEnvelope;
    outputContract: string;
};
export type ReviewPromptPack = {
    system: string;
    developer: string;
    patchToReview: string;
    outputContract: string;
};
export declare function buildRunPrompt(mode: UniversalMode, task: TaskEnvelope): RunPromptPack;
export declare function buildReviewPrompt(mode: UniversalMode, patch: string): ReviewPromptPack;
