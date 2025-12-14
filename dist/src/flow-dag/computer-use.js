// Computer Use Handler - Browser automation with Gemini
// Supports UI actions: click, type, scroll, navigate, etc.
// Supported UI Actions
export const SUPPORTED_UI_ACTIONS = [
    'open_web_browser',
    'wait_5_seconds',
    'go_back',
    'go_forward',
    'search',
    'navigate',
    'click_at',
    'hover_at',
    'type_text_at',
    'key_combination',
    'scroll_document',
    'scroll_at',
    'drag_and_drop',
];
// Coordinate normalization (0-1000 grid to actual pixels)
export class CoordinateNormalizer {
    screenWidth;
    screenHeight;
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }
    denormalizeX(x) {
        return Math.round((x / 1000) * this.screenWidth);
    }
    denormalizeY(y) {
        return Math.round((y / 1000) * this.screenHeight);
    }
    normalizeX(x) {
        return Math.round((x / this.screenWidth) * 1000);
    }
    normalizeY(y) {
        return Math.round((y / this.screenHeight) * 1000);
    }
}
// Computer Use Handler - Manages browser automation
export class ComputerUseHandler {
    normalizer;
    actionHistory = [];
    maxIterations = 10;
    constructor(screenWidth = 1440, screenHeight = 900) {
        this.normalizer = new CoordinateNormalizer(screenWidth, screenHeight);
    }
    // Parse Computer Use response
    parseResponse(response) {
        const functionCalls = [];
        const safetyDecisions = [];
        let text = '';
        if (response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            const parts = candidate.content?.parts || [];
            parts.forEach((part) => {
                if (part.text) {
                    text += part.text;
                }
                if (part.function_call) {
                    functionCalls.push({
                        name: part.function_call.name,
                        args: part.function_call.args,
                    });
                    // Check for safety decision
                    if (part.function_call.args?.safety_decision) {
                        safetyDecisions.push(part.function_call.args.safety_decision);
                    }
                }
            });
        }
        return {
            text: text || undefined,
            functionCalls,
            safetyDecisions: safetyDecisions.length > 0 ? safetyDecisions : undefined,
        };
    }
    // Validate UI action
    validateAction(action) {
        if (!SUPPORTED_UI_ACTIONS.includes(action.name)) {
            return {
                valid: false,
                error: `Unsupported action: ${action.name}`,
            };
        }
        // Validate coordinates if present
        if (action.args.x !== undefined) {
            if (action.args.x < 0 || action.args.x > 999) {
                return {
                    valid: false,
                    error: `Invalid X coordinate: ${action.args.x}`,
                };
            }
        }
        if (action.args.y !== undefined) {
            if (action.args.y < 0 || action.args.y > 999) {
                return {
                    valid: false,
                    error: `Invalid Y coordinate: ${action.args.y}`,
                };
            }
        }
        return { valid: true };
    }
    // Check if action requires confirmation
    requiresConfirmation(action) {
        const confirmationActions = [
            'click_at',
            'type_text_at',
            'key_combination',
            'drag_and_drop',
        ];
        return confirmationActions.includes(action.name);
    }
    // Get denormalized coordinates for execution
    getDenormalizedCoordinates(x, y) {
        return {
            x: this.normalizer.denormalizeX(x),
            y: this.normalizer.denormalizeY(y),
        };
    }
    // Record action in history
    recordAction(action) {
        this.actionHistory.push(action);
    }
    // Get action history
    getActionHistory() {
        return [...this.actionHistory];
    }
    // Clear history
    clearHistory() {
        this.actionHistory = [];
    }
    // Get max iterations
    getMaxIterations() {
        return this.maxIterations;
    }
    // Set max iterations
    setMaxIterations(max) {
        this.maxIterations = Math.max(1, Math.min(max, 20));
    }
}
export class FileSearchHandler {
    stores = new Map();
    // Create file search store
    createStore(config) {
        const store = {
            name: `fileSearchStores/${Date.now()}`,
            displayName: config.displayName,
            createdTime: new Date().toISOString(),
        };
        this.stores.set(store.name, store);
        return store;
    }
    // Get store
    getStore(name) {
        return this.stores.get(name);
    }
    // List stores
    listStores() {
        return Array.from(this.stores.values());
    }
    // Delete store
    deleteStore(name) {
        return this.stores.delete(name);
    }
    // Validate file type
    isValidFileType(mimeType) {
        const validTypes = [
            'application/pdf',
            'text/plain',
            'text/html',
            'application/json',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        return validTypes.includes(mimeType);
    }
}
export class URLContextHandler {
    maxUrlsPerRequest = 20;
    maxUrlContentSize = 34 * 1024 * 1024; // 34MB
    // Validate URL
    validateUrl(url) {
        try {
            const urlObj = new URL(url);
            if (!['http', 'https'].includes(urlObj.protocol.replace(':', ''))) {
                return {
                    valid: false,
                    error: 'Only HTTP and HTTPS URLs are supported',
                };
            }
            return { valid: true };
        }
        catch {
            return {
                valid: false,
                error: 'Invalid URL format',
            };
        }
    }
    // Check if URL is supported
    isSupportedContent(url) {
        const unsupportedDomains = [
            'youtube.com',
            'youtu.be',
            'docs.google.com',
            'sheets.google.com',
        ];
        try {
            const urlObj = new URL(url);
            return !unsupportedDomains.some(domain => urlObj.hostname.includes(domain));
        }
        catch {
            return false;
        }
    }
    // Validate URL batch
    validateUrlBatch(urls) {
        if (urls.length > this.maxUrlsPerRequest) {
            return {
                valid: false,
                error: `Maximum ${this.maxUrlsPerRequest} URLs per request`,
            };
        }
        for (const url of urls) {
            const validation = this.validateUrl(url);
            if (!validation.valid) {
                return validation;
            }
            if (!this.isSupportedContent(url)) {
                return {
                    valid: false,
                    error: `Unsupported content type for URL: ${url}`,
                };
            }
        }
        return { valid: true };
    }
    // Get max URLs per request
    getMaxUrlsPerRequest() {
        return this.maxUrlsPerRequest;
    }
    // Get max URL content size
    getMaxUrlContentSize() {
        return this.maxUrlContentSize;
    }
}
// Export factory functions
export function createComputerUseHandler(screenWidth, screenHeight) {
    return new ComputerUseHandler(screenWidth, screenHeight);
}
export function createFileSearchHandler() {
    return new FileSearchHandler();
}
export function createURLContextHandler() {
    return new URLContextHandler();
}
