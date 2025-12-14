export declare function exportPack(opts: {
    repoPath: string;
    packDirName: string;
    outDir: string;
}): Promise<{
    outPath: string;
}>;
export declare function importPack(opts: {
    bundlePath: string;
    repoPath: string;
    allowOverwrite?: boolean;
}): Promise<{
    ok: boolean;
    packId?: string;
    version?: string;
    targetDir?: string;
    message?: string;
}>;
export declare function importPackFromUrl(opts: {
    url: string;
    sha256?: string;
    repoPath: string;
    allowOverwrite?: boolean;
}): Promise<{
    ok: boolean;
    packId?: string;
    version?: string;
    targetDir?: string;
    message?: string;
    expected?: string;
    got?: string;
}>;
