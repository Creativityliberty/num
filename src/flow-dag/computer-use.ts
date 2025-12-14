// Computer Use Handler - Browser automation with Gemini
// Supports UI actions: click, type, scroll, navigate, etc.

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
] as const;

export type UIActionName = typeof SUPPORTED_UI_ACTIONS[number];

// Coordinate normalization (0-1000 grid to actual pixels)
export class CoordinateNormalizer {
  constructor(private screenWidth: number, private screenHeight: number) {}

  denormalizeX(x: number): number {
    return Math.round((x / 1000) * this.screenWidth);
  }

  denormalizeY(y: number): number {
    return Math.round((y / 1000) * this.screenHeight);
  }

  normalizeX(x: number): number {
    return Math.round((x / this.screenWidth) * 1000);
  }

  normalizeY(y: number): number {
    return Math.round((y / this.screenHeight) * 1000);
  }
}

// Computer Use Handler - Manages browser automation
export class ComputerUseHandler {
  private normalizer: CoordinateNormalizer;
  private actionHistory: UIAction[] = [];
  private maxIterations: number = 10;

  constructor(screenWidth: number = 1440, screenHeight: number = 900) {
    this.normalizer = new CoordinateNormalizer(screenWidth, screenHeight);
  }

  // Parse Computer Use response
  parseResponse(response: any): ComputerUseResponse {
    const functionCalls: UIAction[] = [];
    const safetyDecisions: SafetyDecision[] = [];
    let text = '';

    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      const parts = candidate.content?.parts || [];

      parts.forEach((part: any) => {
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
  validateAction(action: UIAction): { valid: boolean; error?: string } {
    if (!SUPPORTED_UI_ACTIONS.includes(action.name as UIActionName)) {
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
  requiresConfirmation(action: UIAction): boolean {
    const confirmationActions = [
      'click_at',
      'type_text_at',
      'key_combination',
      'drag_and_drop',
    ];
    return confirmationActions.includes(action.name);
  }

  // Get denormalized coordinates for execution
  getDenormalizedCoordinates(x: number, y: number): { x: number; y: number } {
    return {
      x: this.normalizer.denormalizeX(x),
      y: this.normalizer.denormalizeY(y),
    };
  }

  // Record action in history
  recordAction(action: UIAction): void {
    this.actionHistory.push(action);
  }

  // Get action history
  getActionHistory(): UIAction[] {
    return [...this.actionHistory];
  }

  // Clear history
  clearHistory(): void {
    this.actionHistory = [];
  }

  // Get max iterations
  getMaxIterations(): number {
    return this.maxIterations;
  }

  // Set max iterations
  setMaxIterations(max: number): void {
    this.maxIterations = Math.max(1, Math.min(max, 20));
  }
}

// File Search Handler - Document retrieval and indexing
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

export class FileSearchHandler {
  private stores: Map<string, FileSearchStore> = new Map();

  // Create file search store
  createStore(config: FileSearchConfig): FileSearchStore {
    const store: FileSearchStore = {
      name: `fileSearchStores/${Date.now()}`,
      displayName: config.displayName,
      createdTime: new Date().toISOString(),
    };
    this.stores.set(store.name, store);
    return store;
  }

  // Get store
  getStore(name: string): FileSearchStore | undefined {
    return this.stores.get(name);
  }

  // List stores
  listStores(): FileSearchStore[] {
    return Array.from(this.stores.values());
  }

  // Delete store
  deleteStore(name: string): boolean {
    return this.stores.delete(name);
  }

  // Validate file type
  isValidFileType(mimeType: string): boolean {
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

// URL Context Handler - URL content retrieval
export interface URLContextMetadata {
  retrievedUrl: string;
  retrievalStatus: 'success' | 'failed' | 'unsafe' | 'unsupported';
}

export class URLContextHandler {
  private maxUrlsPerRequest: number = 20;
  private maxUrlContentSize: number = 34 * 1024 * 1024; // 34MB

  // Validate URL
  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      if (!['http', 'https'].includes(urlObj.protocol.replace(':', ''))) {
        return {
          valid: false,
          error: 'Only HTTP and HTTPS URLs are supported',
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }

  // Check if URL is supported
  isSupportedContent(url: string): boolean {
    const unsupportedDomains = [
      'youtube.com',
      'youtu.be',
      'docs.google.com',
      'sheets.google.com',
    ];

    try {
      const urlObj = new URL(url);
      return !unsupportedDomains.some(domain =>
        urlObj.hostname.includes(domain)
      );
    } catch {
      return false;
    }
  }

  // Validate URL batch
  validateUrlBatch(urls: string[]): {
    valid: boolean;
    error?: string;
  } {
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
  getMaxUrlsPerRequest(): number {
    return this.maxUrlsPerRequest;
  }

  // Get max URL content size
  getMaxUrlContentSize(): number {
    return this.maxUrlContentSize;
  }
}

// Export factory functions
export function createComputerUseHandler(
  screenWidth?: number,
  screenHeight?: number
): ComputerUseHandler {
  return new ComputerUseHandler(screenWidth, screenHeight);
}

export function createFileSearchHandler(): FileSearchHandler {
  return new FileSearchHandler();
}

export function createURLContextHandler(): URLContextHandler {
  return new URLContextHandler();
}
