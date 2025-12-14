import { MCP_TOOLS, type McpTool } from "./mcpTools.js";

export type AgentToolBinding = {
  agentId: string;
  toolName: string;
  enabled: boolean;
  requiredPermissions?: string[];
};

export type ToolRegistry = {
  tools: Map<string, McpTool>;
  agentBindings: Map<string, AgentToolBinding[]>;
};

class ToolRegistryManager {
  private registry: ToolRegistry = {
    tools: new Map(),
    agentBindings: new Map(),
  };

  constructor() {
    this.initializeTools();
  }

  private initializeTools() {
    for (const tool of MCP_TOOLS) {
      this.registry.tools.set(tool.name, tool);
    }
  }

  registerAgentTools(agentId: string, toolNames: string[], permissions?: string[]): void {
    const bindings: AgentToolBinding[] = [];
    for (const toolName of toolNames) {
      if (this.registry.tools.has(toolName)) {
        bindings.push({
          agentId,
          toolName,
          enabled: true,
          requiredPermissions: permissions,
        });
      }
    }
    if (bindings.length > 0) {
      this.registry.agentBindings.set(agentId, bindings);
    }
  }

  getAgentTools(agentId: string): McpTool[] {
    const bindings = this.registry.agentBindings.get(agentId) || [];
    return bindings
      .filter((b) => b.enabled)
      .map((b) => this.registry.tools.get(b.toolName))
      .filter((t): t is McpTool => t !== undefined);
  }

  getToolsByCategory(category: string): McpTool[] {
    return Array.from(this.registry.tools.values()).filter((t) => t.category === category);
  }

  getAllTools(): McpTool[] {
    return Array.from(this.registry.tools.values());
  }

  getTool(name: string): McpTool | undefined {
    return this.registry.tools.get(name);
  }

  getAgentBindings(agentId: string): AgentToolBinding[] {
    return this.registry.agentBindings.get(agentId) || [];
  }

  enableToolForAgent(agentId: string, toolName: string): void {
    const bindings = this.registry.agentBindings.get(agentId);
    if (bindings) {
      const binding = bindings.find((b) => b.toolName === toolName);
      if (binding) {
        binding.enabled = true;
      }
    }
  }

  disableToolForAgent(agentId: string, toolName: string): void {
    const bindings = this.registry.agentBindings.get(agentId);
    if (bindings) {
      const binding = bindings.find((b) => b.toolName === toolName);
      if (binding) {
        binding.enabled = false;
      }
    }
  }

  getStats(): {
    totalTools: number;
    totalAgents: number;
    toolsByCategory: Record<string, number>;
  } {
    const toolsByCategory: Record<string, number> = {};
    for (const tool of this.registry.tools.values()) {
      toolsByCategory[tool.category] = (toolsByCategory[tool.category] || 0) + 1;
    }

    return {
      totalTools: this.registry.tools.size,
      totalAgents: this.registry.agentBindings.size,
      toolsByCategory,
    };
  }
}

export const toolRegistry = new ToolRegistryManager();

// Default tool bindings for common agent types
export function setupDefaultToolBindings() {
  // Code-related agents get filesystem + git + search tools
  const codeTools = ["read_file", "write_file", "list_directory", "git_status", "git_diff", "git_commit", "grep_search", "code_search"];

  // API-related agents get all tools
  const apiTools = MCP_TOOLS.map((t) => t.name);

  // Analysis agents get read + search tools
  const analysisTools = ["read_file", "list_directory", "grep_search", "code_search", "analyze_code"];

  // Register default bindings
  toolRegistry.registerAgentTools("api-designer", apiTools);
  toolRegistry.registerAgentTools("api-documenter", apiTools);
  toolRegistry.registerAgentTools("api-governance-lead", apiTools);
  toolRegistry.registerAgentTools("code-reviewer", codeTools);
  toolRegistry.registerAgentTools("swift-expert", codeTools);
  toolRegistry.registerAgentTools("ai-engineer", codeTools);
  toolRegistry.registerAgentTools("ai-prompt-security-specialist", analysisTools);
}
