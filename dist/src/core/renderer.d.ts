import type { ModesRenderInput, TaskEnvelope, UniversalMode } from "./schemas.js";
export type PromptPack = {
    mode: {
        id: string;
        name: string;
        description?: string;
        tags: string[];
        categoryPath?: string[];
    };
    system: string;
    developer: string;
    task: TaskEnvelope;
    output: {
        format: "plan" | "patch" | "checklist";
        instructions: string;
    };
    policies: {
        permissions?: TaskEnvelope["permissions"];
        notes: string[];
    };
};
export declare function renderPromptPack(mode: UniversalMode, input: ModesRenderInput): PromptPack;
