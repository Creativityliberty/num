const fs = require('fs');
const path = require('path');

// Agent metadata mapping
const AGENT_METADATA = {
  'code-reviewer': { name: 'Jordan', icon: '👀', module: 'numagent' },
  'ux-designer': { name: 'Sam', icon: '🎨', module: 'numagent' },
  'security-expert': { name: 'Casey', icon: '🔒', module: 'numagent' },
  'test-architect': { name: 'Morgan', icon: '✅', module: 'numagent' },
  'prompt-engineer': { name: 'Riley', icon: '🧠', module: 'numagent' },
  'swift-expert': { name: 'Taylor', icon: '🍎', module: 'numagent' },
  'api-designer': { name: 'Alex', icon: '🔌', module: 'numagent' },
  'api-documenter': { name: 'Jordan', icon: '📚', module: 'numagent' },
  'backend-architect': { name: 'Morgan', icon: '🏗️', module: 'numagent' },
  'frontend-expert': { name: 'Sam', icon: '🎯', module: 'numagent' },
  'devops-engineer': { name: 'Casey', icon: '⚙️', module: 'numagent' },
  'database-architect': { name: 'Riley', icon: '🗄️', module: 'numagent' },
  'ml-engineer': { name: 'Alex', icon: '🤖', module: 'numagent' },
  'qa-specialist': { name: 'Morgan', icon: '🧪', module: 'numagent' },
};

// Simple YAML parser for basic key-value pairs
function parseYaml(content) {
  const lines = content.split('\n');
  const result = {};
  let currentKey = null;
  let currentValue = '';

  for (const line of lines) {
    if (line.trim().startsWith('#') || !line.trim()) continue;

    if (line.match(/^\w+:/)) {
      if (currentKey) {
        result[currentKey] = currentValue.trim();
      }
      const match = line.match(/^(\w+):\s*(.*)/);
      currentKey = match[1];
      currentValue = match[2] || '';
    } else if (currentKey && line.startsWith('  ')) {
      currentValue += '\n' + line;
    }
  }

  if (currentKey) {
    result[currentKey] = currentValue.trim();
  }

  return result;
}

// Generate persona based on agent role
function generatePersona(agentId) {
  const personas = {
    'code-reviewer': {
      role: 'Code Review Expert + Quality Assurance Specialist',
      identity: 'Senior code reviewer with 10+ years experience. Expert in code quality, best practices, security vulnerabilities, performance optimization.',
      communication_style: 'Constructive and educational. Points out issues with clear explanations and improvement suggestions. Celebrates good code.',
      principles: '- Code quality is a team responsibility\n      - Every review is a teaching opportunity\n      - Security and performance matter\n      - Consistency improves maintainability\n      - Tests are as important as code',
    },
    'ux-designer': {
      role: 'User Experience Designer + UI Specialist',
      identity: 'Senior UX Designer with 8+ years creating intuitive experiences. Expert in user research, interaction design, accessibility, and design systems.',
      communication_style: 'Paints pictures with words, telling user stories that make you FEEL the problem. Empathetic advocate with creative storytelling flair.',
      principles: '- Every decision serves genuine user needs\n      - Start simple, evolve through feedback\n      - Balance empathy with edge case attention\n      - Accessibility is not optional\n      - Data-informed but always creative',
    },
    'security-expert': {
      role: 'Security Expert + Vulnerability Analyst',
      identity: 'Senior security architect with 12+ years protecting systems. Expert in threat modeling, vulnerability assessment, secure coding, and compliance.',
      communication_style: 'Vigilant and thorough. Explains security risks in business terms. Advocates for defense-in-depth without being alarmist.',
      principles: '- Security is everyone\'s responsibility\n      - Assume breach, verify trust\n      - Defense in depth saves lives\n      - Compliance is a baseline, not a goal\n      - Security should enable, not block',
    },
    'api-designer': {
      role: 'API Architecture Expert + REST Specialist',
      identity: 'Senior API architect with 8+ years designing scalable APIs. Expert in REST, GraphQL, API security, versioning, and developer experience.',
      communication_style: 'Technical but accessible. Explains complex concepts with clear examples. Advocates for developer experience in every decision.',
      principles: '- Every API decision impacts developer experience\n      - Security and performance are non-negotiable\n      - Documentation is part of the API design\n      - Iterate based on real-world usage patterns\n      - Consistency across APIs matters',
    },
  };

  return personas[agentId] || {
    role: 'Expert Specialist',
    identity: 'Senior specialist with extensive experience in their domain. Expert in best practices and innovative solutions.',
    communication_style: 'Clear, professional, and collaborative. Explains complex concepts with practical examples.',
    principles: '- Excellence in execution\n      - Continuous learning and improvement\n      - Collaboration drives better results\n      - User and stakeholder focus\n      - Quality over shortcuts',
  };
}

// Generate workflows based on agent role
function generateWorkflows(agentId) {
  const workflows = {
    'code-reviewer': [
      '    - trigger: review-code\n      description: "Review code for quality, security, and best practices"\n      workflow: "code-review-workflow"',
      '    - trigger: suggest-improvements\n      description: "Suggest code improvements and optimizations"\n      workflow: "code-improvement-workflow"',
      '    - trigger: validate-tests\n      description: "Validate test coverage and quality"\n      workflow: "test-validation-workflow"',
      '    - trigger: party-mode\n      description: "Collaborate with other agents"\n      workflow: "party-mode-workflow"',
    ],
    'ux-designer': [
      '    - trigger: create-design\n      description: "Create UX design and UI plan from requirements"\n      workflow: "ux-design-workflow"',
      '    - trigger: validate-design\n      description: "Validate UX specification and design artifacts"\n      workflow: "design-validation-workflow"',
      '    - trigger: create-wireframe\n      description: "Create website or app wireframe"\n      workflow: "wireframe-workflow"',
      '    - trigger: party-mode\n      description: "Collaborate with other agents"\n      workflow: "party-mode-workflow"',
    ],
    'security-expert': [
      '    - trigger: threat-model\n      description: "Create threat model and identify risks"\n      workflow: "threat-modeling-workflow"',
      '    - trigger: security-review\n      description: "Review code and architecture for security"\n      workflow: "security-review-workflow"',
      '    - trigger: vulnerability-scan\n      description: "Scan for vulnerabilities and compliance issues"\n      workflow: "vulnerability-scan-workflow"',
      '    - trigger: party-mode\n      description: "Collaborate with other agents"\n      workflow: "party-mode-workflow"',
    ],
    'api-designer': [
      '    - trigger: design-api\n      description: "Design a REST API from requirements"\n      workflow: "api-design-workflow"',
      '    - trigger: validate-api\n      description: "Validate API design and security"\n      workflow: "api-validation-workflow"',
      '    - trigger: document-api\n      description: "Generate API documentation"\n      workflow: "api-documentation-workflow"',
      '    - trigger: party-mode\n      description: "Collaborate with other agents"\n      workflow: "party-mode-workflow"',
    ],
  };

  return workflows[agentId] || [
    '    - trigger: analyze\n      description: "Analyze and provide expert insights"\n      workflow: "analysis-workflow"',
    '    - trigger: validate\n      description: "Validate work and provide feedback"\n      workflow: "validation-workflow"',
    '    - trigger: collaborate\n      description: "Collaborate with team members"\n      workflow: "collaboration-workflow"',
    '    - trigger: party-mode\n      description: "Collaborate with other agents"\n      workflow: "party-mode-workflow"',
  ];
}

// Generate critical actions
function generateCriticalActions(agentId) {
  const actions = {
    'code-reviewer': [
      '    - "Always check for security vulnerabilities and best practices"',
      '    - "Validate test coverage for all changes"',
      '    - "Ensure code follows project standards"',
    ],
    'ux-designer': [
      '    - "Always prioritize user needs and accessibility"',
      '    - "Validate design against user research and feedback"',
      '    - "Ensure consistency with design system"',
    ],
    'security-expert': [
      '    - "Always identify and document security risks"',
      '    - "Validate compliance with security standards"',
      '    - "Ensure defense-in-depth approach"',
    ],
    'api-designer': [
      '    - "Always validate API design against security best practices"',
      '    - "Consider backward compatibility in all changes"',
      '    - "Ensure clear and complete documentation"',
    ],
  };

  return actions[agentId] || [
    '    - "Always follow best practices and standards"',
    '    - "Validate work against requirements"',
    '    - "Ensure quality and consistency"',
  ];
}

// Apply BMAD patch to agent
function applyBmadPatch(agentPath, agentId) {
  try {
    let content = fs.readFileSync(agentPath, 'utf-8');
    const metadata = AGENT_METADATA[agentId] || { name: 'Expert', icon: '⭐', module: 'numagent' };

    // Extract existing agent section
    const agentMatch = content.match(/^agent:\n([\s\S]*)/);
    if (!agentMatch) {
      console.log(`⚠️  Skipped: ${agentId} (no agent section)`);
      return;
    }

    // Build enriched YAML
    let enriched = 'agent:\n';
    enriched += '  metadata:\n';
    enriched += `    id: custom:${agentId}\n`;
    enriched += `    name: ${metadata.name}\n`;
    enriched += `    title: ${metadata.icon} ${agentId}\n`;
    enriched += `    icon: ${metadata.icon}\n`;
    enriched += `    module: ${metadata.module}\n`;

    // Add existing metadata fields (preserve original id if exists)
    const metadataMatch = content.match(/metadata:\n([\s\S]*?)(?=\n  \w|$)/);
    if (metadataMatch) {
      const existingMetadata = metadataMatch[1];
      if (existingMetadata.includes('description:')) {
        const descMatch = existingMetadata.match(/description:\s*"([^"]*)"/);
        if (descMatch) {
          enriched += `    description: "${descMatch[1]}"\n`;
        }
      }
    }

    // Add persona
    const persona = generatePersona(agentId);
    enriched += '\n  persona:\n';
    enriched += `    role: ${persona.role}\n`;
    enriched += `    identity: ${persona.identity}\n`;
    enriched += `    communication_style: "${persona.communication_style}"\n`;
    enriched += `    principles: |\n      ${persona.principles}\n`;

    // Add critical_actions
    enriched += '\n  critical_actions:\n';
    generateCriticalActions(agentId).forEach(action => {
      enriched += action + '\n';
    });

    // Add menu
    enriched += '\n  menu:\n';
    generateWorkflows(agentId).forEach(workflow => {
      enriched += workflow + '\n';
    });

    // Preserve other fields from original
    const otherFields = content.replace(/^agent:\n/, '').replace(/metadata:\n[\s\S]*?(?=\n  \w|$)/, '');
    if (otherFields.trim() && !otherFields.includes('persona:') && !otherFields.includes('critical_actions:') && !otherFields.includes('menu:')) {
      enriched += '\n' + otherFields;
    }

    fs.writeFileSync(agentPath, enriched, 'utf-8');
    console.log(`✅ Patched: ${agentId}`);
  } catch (error) {
    console.error(`❌ Error patching ${agentId}:`, error.message);
  }
}

// Main function
function main() {
  const customModesDir = path.join(__dirname, '../custom_modes.d');

  if (!fs.existsSync(customModesDir)) {
    console.error(`❌ Directory not found: ${customModesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(customModesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  console.log(`🚀 Applying BMAD patch to ${files.length} agents...`);

  files.forEach(file => {
    const agentId = file.replace(/\.(yaml|yml|agent\.yaml)$/, '');
    const agentPath = path.join(customModesDir, file);
    applyBmadPatch(agentPath, agentId);
  });

  console.log(`✅ BMAD patch applied to all agents!`);
}

main();
