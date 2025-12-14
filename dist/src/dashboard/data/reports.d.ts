export type ReportKind = "packops" | "smoke";
export declare function ensureDir(p: string): void;
export declare function reportsDir(root: string, kind: ReportKind): string;
export declare function writeReport(root: string, kind: ReportKind, id: string, payload: unknown): string;
export declare function listReports(root: string, kind: ReportKind): {
    id: string;
    file: string;
}[];
export declare function loadReport(root: string, kind: ReportKind, id: string): any;
