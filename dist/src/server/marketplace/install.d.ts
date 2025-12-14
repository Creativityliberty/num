export type InstallResult = {
    ok: boolean;
    packId?: string;
    modesInstalled?: number;
    modesDir?: string;
    packJsonPath?: string;
    error?: string;
};
export declare function installPackFromBundle(opts: {
    bundlePath: string;
    workspaceRoot: string;
}): Promise<InstallResult>;
