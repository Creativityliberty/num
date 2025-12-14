export type LoadedYamlFile = {
    absPath: string;
    relPath: string;
    doc: unknown;
};
export declare function loadYamlFiles(opts: {
    modesPath: string;
    patterns?: string[];
}): Promise<LoadedYamlFile[]>;
