export interface UIAction {
    name: string;
    args: Record<string, any>;
}
export interface SafetyDecision {
    decision: 'regular' | 'require_confirmation' | 'block';
    explanation?: string;
}
export interface ComputerUseResponse {
    text?: string;
    functionCalls: UIAction[];
    safetyDecisions?: SafetyDecision[];
}
export declare const SUPPORTED_UI_ACTIONS: readonly ["open_web_browser", "wait_5_seconds", "go_back", "go_forward", "search", "navigate", "click_at", "hover_at", "type_text_at", "key_combination", "scroll_document", "scroll_at", "drag_and_drop"];
export type UIActionName = typeof SUPPORTED_UI_ACTIONS[number];
export declare class CoordinateNormalizer {
    private screenWidth;
    private screenHeight;
    constructor(screenWidth: number, screenHeight: number);
    denormalizeX(x: number): number;
    denormalizeY(y: number): number;
    normalizeX(x: number): number;
    normalizeY(y: number): number;
}
export declare class ComputerUseHandler {
    private normalizer;
    private actionHistory;
    private maxIterations;
    constructor(screenWidth?: number, screenHeight?: number);
    parseResponse(response: any): ComputerUseResponse;
    validateAction(action: UIAction): {
        valid: boolean;
        error?: string;
    };
    requiresConfirmation(action: UIAction): boolean;
    getDenormalizedCoordinates(x: number, y: number): {
        x: number;
        y: number;
    };
    recordAction(action: UIAction): void;
    getActionHistory(): UIAction[];
    clearHistory(): void;
    getMaxIterations(): number;
    setMaxIterations(max: number): void;
}
export interface FileSearchConfig {
    displayName: string;
    maxTokensPerChunk?: number;
    maxOverlapTokens?: number;
}
export interface FileSearchStore {
    name: string;
    displayName: string;
    createdTime?: string;
}
export declare class FileSearchHandler {
    private stores;
    createStore(config: FileSearchConfig): FileSearchStore;
    getStore(name: string): FileSearchStore | undefined;
    listStores(): FileSearchStore[];
    deleteStore(name: string): boolean;
    isValidFileType(mimeType: string): boolean;
}
export interface URLContextMetadata {
    retrievedUrl: string;
    retrievalStatus: 'success' | 'failed' | 'unsafe' | 'unsupported';
}
export declare class URLContextHandler {
    private maxUrlsPerRequest;
    private maxUrlContentSize;
    validateUrl(url: string): {
        valid: boolean;
        error?: string;
    };
    isSupportedContent(url: string): boolean;
    validateUrlBatch(urls: string[]): {
        valid: boolean;
        error?: string;
    };
    getMaxUrlsPerRequest(): number;
    getMaxUrlContentSize(): number;
}
export declare function createComputerUseHandler(screenWidth?: number, screenHeight?: number): ComputerUseHandler;
export declare function createFileSearchHandler(): FileSearchHandler;
export declare function createURLContextHandler(): URLContextHandler;
