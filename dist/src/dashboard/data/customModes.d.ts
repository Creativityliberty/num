export type CustomMode = {
    id: string;
    slug: string;
    name: string;
    description?: string;
    tags: string[];
    capabilities: string[];
    isChef: boolean;
    isStub: boolean;
    roleDefinition?: string;
    whenToUse?: string;
    groups?: string[];
    source: "custom-yaml";
};
export declare function loadCustomModes(customModesDir: string): CustomMode[];
export declare function getCustomModesStats(modes: CustomMode[]): Record<string, unknown>;
