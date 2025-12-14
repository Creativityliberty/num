import { ModesRegistry } from "../../core/modes.registry.js";
export declare function defaultModeTemplate(modeId: string, name?: string): {
    id: string;
    name: string;
    tags: string[];
    flow: {
        version: string;
        nodes: {
            id: string;
            role: string;
            goal: string;
            expectedSchema: string;
            prompt: {
                system: string;
                user: string;
            };
        }[];
        edges: any[];
    };
};
export declare function modePathFromId(root: string, modeId: string, outModesDir: string): string;
export declare function openMode(registry: ModesRegistry, modeId: string): Promise<import("../../core/modes.registry.js").ModeDetail>;
export declare function writeMode(root: string, outModesDir: string, modeId: string, modeObj: any): {
    path: string;
};
export declare function createMode(root: string, outModesDir: string, slug: string, name?: string): {
    modeId: string;
    path: string;
    mode: {
        id: string;
        name: string;
        tags: string[];
        flow: {
            version: string;
            nodes: {
                id: string;
                role: string;
                goal: string;
                expectedSchema: string;
                prompt: {
                    system: string;
                    user: string;
                };
            }[];
            edges: any[];
        };
    };
};
export declare function duplicateMode(root: string, outModesDir: string, fromMode: any, slug: string, name?: string): {
    modeId: string;
    path: string;
    mode: any;
};
