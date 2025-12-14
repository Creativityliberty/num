type Warn = {
    kind: string;
    message: string;
    ref?: string;
};
export declare function buildNumPack(opts: {
    modes: any[];
    outModesDir: string;
    packId: string;
    packOutDir: string;
    dryRun?: boolean;
    warnings?: Warn[];
}): Promise<{
    writtenFiles: string[];
    packJsonPath: string;
}>;
export {};
