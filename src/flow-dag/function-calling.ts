
// Function Declaration for Gemini Function Calling
export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

// Function Call Response from LLM
export interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

// Function Registry - Maps function names to implementations
export class FunctionRegistry {
  private functions: Map<string, Function> = new Map();
  private declarations: Map<string, FunctionDeclaration> = new Map();

  // Register a function with its declaration
  register(declaration: FunctionDeclaration, implementation: Function): void {
    this.functions.set(declaration.name, implementation);
    this.declarations.set(declaration.name, declaration);
  }

  // Get function declaration
  getDeclaration(name: string): FunctionDeclaration | undefined {
    return this.declarations.get(name);
  }

  // Get all declarations for API request
  getAllDeclarations(): FunctionDeclaration[] {
    return Array.from(this.declarations.values());
  }

  // Execute a function call
  async execute(call: FunctionCall): Promise<any> {
    const fn = this.functions.get(call.name);
    if (!fn) {
      throw new Error(`Function not found: ${call.name}`);
    }
    return fn(call.args);
  }

  // Execute multiple function calls (parallel)
  async executeMultiple(calls: FunctionCall[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const promises = calls.map(call =>
      this.execute(call)
        .then(result => {
          results[call.name] = result;
        })
        .catch(error => {
          results[call.name] = { error: error.message };
        })
    );
    await Promise.all(promises);
    return results;
  }
}

// Built-in Tool Functions for Agents
export const builtInTools = {
  // Get current date/time
  get_current_time: async () => {
    return { timestamp: new Date().toISOString() };
  },

  // Search knowledge base
  search_knowledge_base: async (args: { query: string; limit?: number }) => {
    // Placeholder - integrate with actual knowledge base
    return {
      results: [
        { id: '1', title: 'Result 1', content: 'Matching content...' },
      ],
      total: 1,
    };
  },

  // Get agent status
  get_agent_status: async (args: { agent_id: string }) => {
    return {
      agent_id: args.agent_id,
      status: 'active',
      uptime_seconds: 3600,
    };
  },

  // Execute shell command (with safety checks)
  execute_command: async (args: { command: string; timeout?: number }) => {
    // Placeholder - implement with safety checks
    return {
      command: args.command,
      exit_code: 0,
      stdout: 'Command executed',
      stderr: '',
    };
  },

  // Store artifact
  store_artifact: async (args: { key: string; value: any; ttl?: number }) => {
    return {
      key: args.key,
      stored: true,
      ttl: args.ttl || 3600,
    };
  },

  // Retrieve artifact
  retrieve_artifact: async (args: { key: string }) => {
    return {
      key: args.key,
      value: null,
      found: false,
    };
  },

  // Call another agent
  call_agent: async (args: { agent_id: string; prompt: string }) => {
    return {
      agent_id: args.agent_id,
      response: 'Agent response...',
    };
  },

  // Log message
  log_message: async (args: { level: 'info' | 'warn' | 'error'; message: string }) => {
    console.log(`[${args.level.toUpperCase()}] ${args.message}`);
    return { logged: true };
  },
};

// Create function declarations for built-in tools
export function createBuiltInDeclarations(): FunctionDeclaration[] {
  return [
    {
      name: 'get_current_time',
      description: 'Get the current date and time',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'search_knowledge_base',
      description: 'Search the knowledge base for relevant information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Maximum results to return' },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_agent_status',
      description: 'Get the status of an agent',
      parameters: {
        type: 'object',
        properties: {
          agent_id: { type: 'string', description: 'Agent ID' },
        },
        required: ['agent_id'],
      },
    },
    {
      name: 'execute_command',
      description: 'Execute a shell command (with safety checks)',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
          timeout: { type: 'number', description: 'Timeout in seconds' },
        },
        required: ['command'],
      },
    },
    {
      name: 'store_artifact',
      description: 'Store an artifact in the shared store',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Artifact key' },
          value: { description: 'Artifact value' },
          ttl: { type: 'number', description: 'Time to live in seconds' },
        },
        required: ['key', 'value'],
      },
    },
    {
      name: 'retrieve_artifact',
      description: 'Retrieve an artifact from the shared store',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Artifact key' },
        },
        required: ['key'],
      },
    },
    {
      name: 'call_agent',
      description: 'Call another agent with a prompt',
      parameters: {
        type: 'object',
        properties: {
          agent_id: { type: 'string', description: 'Target agent ID' },
          prompt: { type: 'string', description: 'Prompt for the agent' },
        },
        required: ['agent_id', 'prompt'],
      },
    },
    {
      name: 'log_message',
      description: 'Log a message',
      parameters: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['info', 'warn', 'error'],
            description: 'Log level',
          },
          message: { type: 'string', description: 'Message to log' },
        },
        required: ['level', 'message'],
      },
    },
  ];
}

// Function Calling Handler - Manages the function calling loop
export class FunctionCallingHandler {
  private registry: FunctionRegistry;

  constructor(registry?: FunctionRegistry) {
    this.registry = registry || new FunctionRegistry();
    this.initializeBuiltInTools();
  }

  private initializeBuiltInTools(): void {
    const declarations = createBuiltInDeclarations();
    declarations.forEach(decl => {
      const impl = (builtInTools as any)[decl.name];
      if (impl) {
        this.registry.register(decl, impl);
      }
    });
  }

  // Get function declarations for LLM request
  getDeclarations(): FunctionDeclaration[] {
    return this.registry.getAllDeclarations();
  }

  // Handle function calling loop
  async handleFunctionCalls(
    functionCalls: FunctionCall[],
    maxIterations: number = 5
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (let i = 0; i < maxIterations; i++) {
      if (functionCalls.length === 0) break;

      console.log(`\n📞 Function Calling Iteration ${i + 1}`);
      console.log(`Executing ${functionCalls.length} function(s)...`);

      // Execute all function calls (parallel)
      const iterationResults = await this.registry.executeMultiple(functionCalls);
      Object.assign(results, iterationResults);

      // Log results
      functionCalls.forEach(call => {
        const result = iterationResults[call.name];
        console.log(`  ✅ ${call.name}: ${JSON.stringify(result).substring(0, 100)}`);
      });

      // In a real implementation, you would:
      // 1. Send results back to the model
      // 2. Get new function calls from the model
      // 3. Continue the loop if there are new calls
      // For now, we break after one iteration
      break;
    }

    return results;
  }

  // Register custom function
  registerCustomFunction(declaration: FunctionDeclaration, implementation: Function): void {
    this.registry.register(declaration, implementation);
  }
}

// Export factory function
export function createFunctionCallingHandler(): FunctionCallingHandler {
  return new FunctionCallingHandler();
}
