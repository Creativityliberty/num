export interface BatchRequest {
    key: string;
    request: {
        contents: any[];
        config?: any;
    };
}
export interface BatchJob {
    name: string;
    displayName: string;
    state: BatchJobState;
    createdTime?: string;
    completedTime?: string;
    error?: string;
    dest?: {
        fileName?: string;
        inlinedResponses?: any[];
    };
}
export type BatchJobState = 'JOB_STATE_PENDING' | 'JOB_STATE_RUNNING' | 'JOB_STATE_SUCCEEDED' | 'JOB_STATE_FAILED' | 'JOB_STATE_CANCELLED' | 'JOB_STATE_EXPIRED';
export interface BatchConfig {
    displayName: string;
    maxRetries?: number;
    timeoutSeconds?: number;
}
export declare class BatchJobManager {
    private jobs;
    private requestQueues;
    private maxBatchSize;
    private maxFileSize;
    createJob(config: BatchConfig): BatchJob;
    addRequest(jobName: string, request: BatchRequest): boolean;
    getJob(jobName: string): BatchJob | undefined;
    listJobs(): BatchJob[];
    updateJobStatus(jobName: string, state: BatchJobState, error?: string): void;
    cancelJob(jobName: string): boolean;
    deleteJob(jobName: string): boolean;
    getRequests(jobName: string): BatchRequest[];
    getMaxBatchSize(): number;
    getMaxFileSize(): number;
    isJobCompleted(jobName: string): boolean;
    getJobStats(jobName: string): {
        totalRequests: number;
        completedRequests: number;
        failedRequests: number;
    };
}
export interface FileMetadata {
    name: string;
    displayName: string;
    mimeType: string;
    size: number;
    createdTime?: string;
    expiresTime?: string;
    uri?: string;
}
export declare class FilesAPIHandler {
    private files;
    private maxFileSize;
    private maxStoragePerProject;
    private fileRetentionHours;
    uploadFile(displayName: string, mimeType: string, size: number): FileMetadata | null;
    getFile(name: string): FileMetadata | undefined;
    listFiles(): FileMetadata[];
    deleteFile(name: string): boolean;
    isValidFileType(mimeType: string): boolean;
    getMaxFileSize(): number;
    getMaxStoragePerProject(): number;
    getFileRetentionHours(): number;
    getTotalStorageUsed(): number;
}
export declare class BatchProcessingHandler {
    private jobManager;
    private filesHandler;
    constructor();
    createInlineBatch(displayName: string, requests: BatchRequest[]): BatchJob | null;
    createFileBatch(displayName: string, fileName: string): BatchJob | null;
    getJobStatus(jobName: string): BatchJob | undefined;
    monitorJob(jobName: string, pollIntervalMs?: number, maxWaitMs?: number): Promise<BatchJob | null>;
    cancelJob(jobName: string): boolean;
    deleteJob(jobName: string): boolean;
    uploadFile(displayName: string, mimeType: string, size: number): FileMetadata | null;
    getFile(name: string): FileMetadata | undefined;
    listFiles(): FileMetadata[];
    deleteFile(name: string): boolean;
    getBatchStats(jobName: string): {
        jobState: BatchJobState;
        requestCount: number;
        completedCount: number;
        failedCount: number;
        costReduction: string;
    };
    getStorageInfo(): {
        used: number;
        max: number;
        percentageUsed: number;
    };
}
export declare function createBatchProcessingHandler(): BatchProcessingHandler;
