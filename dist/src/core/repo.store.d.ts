export type RepoMode = {
    packId: string;
    packVersion?: string;
    packTags?: string[];
    mode: any;
};
export declare class RepoStore {
    private opts;
    constructor(opts: {
        repoPath: string;
    });
    load(): Promise<RepoMode[]>;
}
