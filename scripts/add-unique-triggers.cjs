const fs = require('fs');
const path = require('path');

// Mapping: agent ID -> unique trigger
const UNIQUE_TRIGGERS = {
  'code-reviewer': { trigger: 'review-code', description: 'Review code for quality and best practices' },
  'ux-designer': { trigger: 'design-ux', description: 'Design UX and UI from requirements' },
  'security-expert': { trigger: 'audit-security', description: 'Audit security and identify risks' },
  'test-architect': { trigger: 'design-tests', description: 'Design test strategy and test cases' },
  'prompt-engineer': { trigger: 'optimize-prompt', description: 'Optimize prompt for better LLM output' },
  'swift-expert': { trigger: 'develop-swift', description: 'Develop Swift code and iOS apps' },
  'api-designer': { trigger: 'design-api', description: 'Design REST API from requirements' },
  'api-documenter': { trigger: 'document-api', description: 'Generate API documentation' },
  'backend-architect': { trigger: 'architect-backend', description: 'Design backend architecture' },
  'frontend-expert': { trigger: 'build-frontend', description: 'Build frontend UI and components' },
  'devops-engineer': { trigger: 'configure-devops', description: 'Configure DevOps and infrastructure' },
  'database-architect': { trigger: 'design-database', description: 'Design database schema and queries' },
  'ml-engineer': { trigger: 'train-model', description: 'Train and optimize ML models' },
  'qa-specialist': { trigger: 'test-quality', description: 'Test quality and validate functionality' },
  'accessibility-tester': { trigger: 'audit-accessibility', description: 'Audit accessibility and compliance' },
  'adaptive-swarm-coordinator': { trigger: 'coordinate-swarm', description: 'Coordinate adaptive swarm agents' },
  'agent-organizer': { trigger: 'organize-agents', description: 'Organize and manage agents' },
  'agents': { trigger: 'manage-agents', description: 'Manage agent lifecycle' },
  'ai-engineer': { trigger: 'engineer-ai', description: 'Engineer AI solutions' },
  'ai-prompt-security-specialist': { trigger: 'secure-prompts', description: 'Secure prompts against attacks' },
  'analyst': { trigger: 'analyze-data', description: 'Analyze data and provide insights' },
  'api-governance-lead': { trigger: 'govern-apis', description: 'Govern API standards and policies' },
  'test-agents': { trigger: 'test-agents', description: 'Test agent functionality' },
};

function addUniqueTrigger(agentPath, agentId) {
  try {
    let content = fs.readFileSync(agentPath, 'utf-8');
    const triggerConfig = UNIQUE_TRIGGERS[agentId] || {
      trigger: `${agentId}-action`,
      description: `Execute ${agentId} action`
    };

    // Check if menu already has the unique trigger
    if (content.includes(`trigger: ${triggerConfig.trigger}`)) {
      console.log(`⏭️  Already has trigger: ${agentId}`);
      return;
    }

    // Find the menu section and add unique trigger as first item
    const menuMatch = content.match(/menu:\n/);
    if (!menuMatch) {
      console.log(`⚠️  No menu found: ${agentId}`);
      return;
    }

    // Insert unique trigger as first menu item
    const uniqueTriggerYaml = `  - trigger: ${triggerConfig.trigger}\n    description: "${triggerConfig.description}"\n    workflow: "${triggerConfig.trigger}-workflow"\n`;
    
    const newContent = content.replace(
      /menu:\n/,
      `menu:\n${uniqueTriggerYaml}`
    );

    fs.writeFileSync(agentPath, newContent, 'utf-8');
    console.log(`✅ Added trigger: ${agentId} → ${triggerConfig.trigger}`);
  } catch (error) {
    console.error(`❌ Error processing ${agentId}:`, error.message);
  }
}

function main() {
  const customModesDir = path.join(__dirname, '../custom_modes.d');

  if (!fs.existsSync(customModesDir)) {
    console.error(`❌ Directory not found: ${customModesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(customModesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  console.log(`🚀 Adding unique triggers to ${files.length} agents...\n`);

  files.forEach(file => {
    const agentId = file.replace(/\.(yaml|yml|agent\.yaml)$/, '');
    const agentPath = path.join(customModesDir, file);
    addUniqueTrigger(agentPath, agentId);
  });

  console.log(`\n✅ Unique triggers added to all agents!`);
}

main();
