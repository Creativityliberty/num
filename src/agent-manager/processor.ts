import * as fs from 'fs';
import type { AgentTask } from './queue.js';

export interface ProcessorConfig {
  validateOnly?: boolean;
  dryRun?: boolean;
}

export class AgentProcessor {
  constructor(private config: ProcessorConfig = {}) {}

  async processAgent(task: AgentTask): Promise<void> {
    // Read the agent file
    const content = fs.readFileSync(task.filePath, 'utf-8');

    // Validate YAML structure
    this.validateYaml(content, task.agentId);

    // Check for required fields
    this.validateAgentStructure(content, task.agentId);

    // Check for unique trigger
    this.validateUniqueTrigger(content, task.agentId);

    // Check for persona
    this.validatePersona(content, task.agentId);

    // Check for critical_actions
    this.validateCriticalActions(content, task.agentId);

    // Check for menu/workflows
    this.validateMenu(content, task.agentId);

    if (!this.config.dryRun) {
      // Additional processing could go here
      // For now, just validate
    }
  }

  private validateYaml(content: string, agentId: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error(`Empty YAML file for agent: ${agentId}`);
    }

    // Basic YAML structure check
    const lines = content.split('\n');
    const indentationValid = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().length === 0) continue;

      const match = line.match(/^(\s*)/);
      const indent = match ? match[1].length : 0;

      // Check for consistent indentation (multiples of 2)
      if (indent > 0 && indent % 2 !== 0) {
        console.warn(`⚠️  Agent ${agentId}: Inconsistent indentation at line ${i + 1}`);
      }
    }
  }

  private validateAgentStructure(content: string, agentId: string): void {
    // Check for required top-level fields
    const hasSlug = content.includes('slug:') || content.includes(`slug: ${agentId}`);
    const hasName = content.includes('name:');
    const hasModule = content.includes('module:');

    if (!hasName) {
      throw new Error(`Missing 'name' field in agent: ${agentId}`);
    }

    if (!hasModule) {
      throw new Error(`Missing 'module' field in agent: ${agentId}`);
    }
  }

  private validateUniqueTrigger(content: string, agentId: string): void {
    // Check if agent has at least one trigger in menu
    const menuMatch = content.match(/menu:\n([\s\S]*?)(?=\n\w|$)/);
    if (!menuMatch) {
      throw new Error(`Missing 'menu' section in agent: ${agentId}`);
    }

    const menuContent = menuMatch[1];
    const triggerMatch = menuContent.match(/trigger:\s*(\w+)/);
    if (!triggerMatch) {
      throw new Error(`No triggers found in menu for agent: ${agentId}`);
    }

    const trigger = triggerMatch[1];
    console.log(`  ✓ Trigger: ${trigger}`);
  }

  private validatePersona(content: string, agentId: string): void {
    const hasPersona = content.includes('persona:');
    if (!hasPersona) {
      throw new Error(`Missing 'persona' section in agent: ${agentId}`);
    }

    const personaMatch = content.match(/persona:\n([\s\S]*?)(?=\n\w|$)/);
    if (!personaMatch) {
      throw new Error(`Invalid 'persona' section in agent: ${agentId}`);
    }

    const personaContent = personaMatch[1];
    const hasRole = personaContent.includes('role:');
    const hasIdentity = personaContent.includes('identity:');
    const hasCommunicationStyle = personaContent.includes('communication_style:');
    const hasPrinciples = personaContent.includes('principles:');

    if (!hasRole || !hasIdentity || !hasCommunicationStyle || !hasPrinciples) {
      console.warn(`⚠️  Agent ${agentId}: Incomplete persona (missing role, identity, communication_style, or principles)`);
    }

    console.log(`  ✓ Persona: Complete`);
  }

  private validateCriticalActions(content: string, agentId: string): void {
    const hasCriticalActions = content.includes('critical_actions:');
    if (!hasCriticalActions) {
      throw new Error(`Missing 'critical_actions' section in agent: ${agentId}`);
    }

    const actionsMatch = content.match(/critical_actions:\n([\s\S]*?)(?=\n\w|$)/);
    if (!actionsMatch) {
      throw new Error(`Invalid 'critical_actions' section in agent: ${agentId}`);
    }

    const actionsContent = actionsMatch[1];
    const actions = actionsContent.match(/- "/g) || [];
    if (actions.length === 0) {
      throw new Error(`No critical actions defined for agent: ${agentId}`);
    }

    console.log(`  ✓ Critical Actions: ${actions.length} defined`);
  }

  private validateMenu(content: string, agentId: string): void {
    const menuMatch = content.match(/menu:\n([\s\S]*?)(?=\n\w|$)/);
    if (!menuMatch) {
      throw new Error(`Missing 'menu' section in agent: ${agentId}`);
    }

    const menuContent = menuMatch[1];
    const workflows = menuContent.match(/trigger:/g) || [];
    if (workflows.length === 0) {
      throw new Error(`No workflows defined in menu for agent: ${agentId}`);
    }

    console.log(`  ✓ Menu: ${workflows.length} workflows defined`);
  }
}
