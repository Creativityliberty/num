import { MCP_TOOLS } from "./mcpTools.js";
class ToolRegistryManager {
    registry = {
        tools: new Map(),
        agentBindings: new Map(),
    };
    constructor() {
        this.initializeTools();
    }
    initializeTools() {
        for (const tool of MCP_TOOLS) {
            this.registry.tools.set(tool.name, tool);
        }
    }
    registerAgentTools(agentId, toolNames, permissions) {
        const bindings = [];
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
    getAgentTools(agentId) {
        const bindings = this.registry.agentBindings.get(agentId) || [];
        return bindings
            .filter((b) => b.enabled)
            .map((b) => this.registry.tools.get(b.toolName))
            .filter((t) => t !== undefined);
    }
    getToolsByCategory(category) {
        return Array.from(this.registry.tools.values()).filter((t) => t.category === category);
    }
    getAllTools() {
        return Array.from(this.registry.tools.values());
    }
    getTool(name) {
        return this.registry.tools.get(name);
    }
    getAgentBindings(agentId) {
        return this.registry.agentBindings.get(agentId) || [];
    }
    enableToolForAgent(agentId, toolName) {
        const bindings = this.registry.agentBindings.get(agentId);
        if (bindings) {
            const binding = bindings.find((b) => b.toolName === toolName);
            if (binding) {
                binding.enabled = true;
            }
        }
    }
    disableToolForAgent(agentId, toolName) {
        const bindings = this.registry.agentBindings.get(agentId);
        if (bindings) {
            const binding = bindings.find((b) => b.toolName === toolName);
            if (binding) {
                binding.enabled = false;
            }
        }
    }
    getStats() {
        const toolsByCategory = {};
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
