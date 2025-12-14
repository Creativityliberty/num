import { type ModeFeedback, type ModeStats } from "./feedback.schema.js";
export declare class FeedbackStore {
    private root;
    constructor(root: string);
    private file;
    append(fb: ModeFeedback): Promise<void>;
    readAll(): Promise<ModeFeedback[]>;
    computeStats(modeId: string): Promise<ModeStats>;
    computeAllStats(): Promise<ModeStats[]>;
}
