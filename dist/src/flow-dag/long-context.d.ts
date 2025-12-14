export interface DocumentMetadata {
    name: string;
    displayName: string;
    mimeType: string;
    size: number;
    pageCount?: number;
    duration?: number;
    createdTime?: string;
    uri?: string;
}
export interface ContextWindowInfo {
    model: string;
    inputLimit: number;
    outputLimit: number;
    contextWindow: number;
    estimatedCapacity: {
        codeLines: number;
        textMessages: number;
        novels: number;
        podcastEpisodes: number;
    };
}
export interface DocumentProcessingConfig {
    extractText?: boolean;
    analyzeImages?: boolean;
    extractTables?: boolean;
    preserveFormatting?: boolean;
    mediaResolution?: 'low' | 'medium' | 'high';
}
export interface ProcessingResult {
    documentName: string;
    status: 'success' | 'failed' | 'processing';
    tokensUsed: number;
    extractedContent?: string;
    tables?: Record<string, unknown>[];
    images?: Array<{
        description: string;
        tokens: number;
    }>;
    error?: string;
}
export declare class ContextWindowManager {
    private contextWindows;
    getContextWindow(model: string): ContextWindowInfo | null;
    fitsInContext(model: string, tokenCount: number): boolean;
    getAvailableContext(model: string, usedTokens: number): number;
    calculateCapacity(model: string): ContextWindowInfo['estimatedCapacity'] | null;
}
export declare class PDFDocumentProcessor {
    private maxFileSize;
    private maxPages;
    private tokensPerPage;
    processPDF(config: DocumentProcessingConfig): ProcessingResult;
    extractText(pdfData: Buffer): {
        text: string;
        tokens: number;
    };
    analyzeImages(pdfData: Buffer): Array<{
        description: string;
        tokens: number;
    }>;
    extractTables(pdfData: Buffer): Record<string, unknown>[];
    getMaxFileSize(): number;
    getMaxPages(): number;
    getTokensPerPage(): number;
    validatePDF(size: number, pageCount: number): {
        valid: boolean;
        error?: string;
    };
}
export declare class VideoProcessor {
    private tokensPerSecond;
    private maxDuration;
    countVideoTokens(durationSeconds: number): number;
    processVideo(durationSeconds: number): ProcessingResult;
    getTokensPerSecond(): number;
    getMaxDuration(): number;
    validateVideo(durationSeconds: number): {
        valid: boolean;
        error?: string;
    };
}
export declare class AudioProcessor {
    private tokensPerSecond;
    private maxDuration;
    countAudioTokens(durationSeconds: number): number;
    processAudio(durationSeconds: number): ProcessingResult;
    getTokensPerSecond(): number;
    getMaxDuration(): number;
    validateAudio(durationSeconds: number): {
        valid: boolean;
        error?: string;
    };
}
export declare class LongContextHandler {
    private contextWindowManager;
    private pdfProcessor;
    private videoProcessor;
    private audioProcessor;
    constructor();
    getContextWindow(model: string): ContextWindowInfo | null;
    fitsInContext(model: string, tokenCount: number): boolean;
    getAvailableContext(model: string, usedTokens: number): number;
    processPDF(config: DocumentProcessingConfig): ProcessingResult;
    processVideo(durationSeconds: number): ProcessingResult;
    processAudio(durationSeconds: number): ProcessingResult;
    getProcessingRecommendations(): string[];
    getLongContextUseCases(): Record<string, string[]>;
    getOptimizationStrategies(): Record<string, string>;
    getComprehensiveStats(): {
        models: Record<string, ContextWindowInfo>;
        processors: {
            pdf: {
                maxSize: number;
                maxPages: number;
                tokensPerPage: number;
            };
            video: {
                tokensPerSecond: number;
                maxDuration: number;
            };
            audio: {
                tokensPerSecond: number;
                maxDuration: number;
            };
        };
    };
}
export declare function createLongContextHandler(): LongContextHandler;
