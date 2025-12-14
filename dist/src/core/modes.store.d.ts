import { type Mode } from "./modes.schema.js";
export declare class ModesStore {
    private opts;
    constructor(opts: {
        modesPath: string;
    });
    private modeFile;
    get(id: string): Promise<Mode>;
}
