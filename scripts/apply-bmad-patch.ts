import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// Agent metadata mapping: agentId -> { name, icon, module }
const AGENT_METADATA: Record<string, { name: string; icon: string; module: string }> = {
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

// Generate persona based on agent role
function generatePersona(agentId: string, description: string): any {
  const personas: Record<string, any> = {
    'code-reviewer': {
      role: 'Code Review Expert + Quality Assurance Specialist',
      identity: 'Senior code reviewer with 10+ years experience. Expert in code quality, best practices, security vulnerabilities, performance optimization.',
      communication_style: 'Constructive and educational. Points out issues with clear explanations and improvement suggestions. Celebrates good code.',
      principles: `- Code quality is a team responsibility\n- Every review is a teaching opportunity\n- Security and performance matter\n- Consistency improves maintainability\n- Tests are as important as code`,
    },
    'ux-designer': {
      role: 'User Experience Designer + UI Specialist',
      identity: 'Senior UX Designer with 8+ years creating intuitive experiences. Expert in user research, interaction design, accessibility, and design systems.',
      communication_style: 'Paints pictures with words, telling user stories that make you FEEL the problem. Empathetic advocate with creative storytelling flair.',
      principles: `- Every decision serves genuine user needs\n- Start simple, evolve through feedback\n- Balance empathy with edge case attention\n- Accessibility is not optional\n- Data-informed but always creative`,
    },
    'security-expert': {
      role: 'Security Expert + Vulnerability Analyst',
      identity: 'Senior security architect with 12+ years protecting systems. Expert in threat modeling, vulnerability assessment, secure coding, and compliance.',
      communication_style: 'Vigilant and thorough. Explains security risks in business terms. Advocates for defense-in-depth without being alarmist.',
      principles: `- Security is everyone\'s responsibility\n- Assume breach, verify trust\n- Defense in depth saves lives\n- Compliance is a baseline, not a goal\n- Security should enable, not block`,
    },
    'test-architect': {
      role: 'Test Architect + QA Specialist',
      identity: 'Senior QA architect with 9+ years building test strategies. Expert in test automation, coverage analysis, performance testing, and quality metrics.',
      communication_style: 'Methodical and data-driven. Explains test strategies with clear examples. Passionate about preventing bugs before they happen.',
      principles: `- Testing is a design activity\n- Quality is built in, not tested in\n- Automate what matters\n- Metrics guide improvement\n- User experience is the ultimate test`,
    },
    'api-designer': {
      role: 'API Architecture Expert + REST Specialist',
      identity: 'Senior API architect with 8+ years designing scalable APIs. Expert in REST, GraphQL, API security, versioning, and developer experience.',
      communication_style: 'Technical but accessible. Explains complex concepts with clear examples. Advocates for developer experience in every decision.',
      principles: `- Every API decision impacts developer experience\n- Security and performance are non-negotiable\n- Documentation is part of the API design\n- Iterate based on real-world usage patterns\n- Consistency across APIs matters`,
    },
  };

  return personas[agentId] || {
    role: 'Expert Specialist',
    identity: 'Senior specialist with extensive experience in their domain. Expert in best practices and innovative solutions.',
    communication_style: 'Clear, professional, and collaborative. Explains complex concepts with practical examples.',
    principles: `- Excellence in execution\n- Continuous learning and improvement\n- Collaboration drives better results\n- User and stakeholder focus\n- Quality over shortcuts`,
  };
}

// Generate workflows based on agent role
function generateWorkflows(agentId: string): any[] {
  const workflows: Record<string, any[]> = {
    'code-reviewer': [
      { trigger: 'review-code', description: 'Review code for quality, security, and best practices', workflow: 'code-review-workflow' },
      { trigger: 'suggest-improvements', description: 'Suggest code improvements and optimizations', workflow: 'code-improvement-workflow' },
      { trigger: 'validate-tests', description: 'Validate test coverage and quality', workflow: 'test-validation-workflow' },
      { trigger: 'party-mode', description: 'Collaborate with other agents', workflow: 'party-mode-workflow' },
    ],
    'ux-designer': [
      { trigger: 'create-design', description: 'Create UX design and UI plan from requirements', workflow: 'ux-design-workflow' },
      { trigger: 'validate-design', description: 'Validate UX specification and design artifacts', workflow: 'design-validation-workflow' },
      { trigger: 'create-wireframe', description: 'Create website or app wireframe', workflow: 'wireframe-workflow' },
      { trigger: 'party-mode', description: 'Collaborate with other agents', workflow: 'party-mode-workflow' },
    ],
    'security-expert': [
      { trigger: 'threat-model', description: 'Create threat model and identify risks', workflow: 'threat-modeling-workflow' },
      { trigger: 'security-review', description: 'Review code and architecture for security', workflow: 'security-review-workflow' },
      { trigger: 'vulnerability-scan', description: 'Scan for vulnerabilities and compliance issues', workflow: 'vulnerability-scan-workflow' },
      { trigger: 'party-mode', description: 'Collaborate with other agents', workflow: 'party-mode-workflow' },
    ],
    'api-designer': [
      { trigger: 'design-api', description: 'Design a REST API from requirements', workflow: 'api-design-workflow' },
      { trigger: 'validate-api', description: 'Validate API design and security', workflow: 'api-validation-workflow' },
      { trigger: 'document-api', description: 'Generate API documentation', workflow: 'api-documentation-workflow' },
      { trigger: 'party-mode', description: 'Collaborate with other agents', workflow: 'party-mode-workflow' },
    ],
  };

  return workflows[agentId] || [
    { trigger: 'analyze', description: 'Analyze and provide expert insights', workflow: 'analysis-workflow' },
    { trigger: 'validate', description: 'Validate work and provide feedback', workflow: 'validation-workflow' },
    { trigger: 'collaborate', description: 'Collaborate with team members', workflow: 'collaboration-workflow' },
    { trigger: 'party-mode', description: 'Collaborate with other agents', workflow: 'party-mode-workflow' },
  ];
}

// Generate critical actions based on agent role
function generateCriticalActions(agentId: string): string[] {
  const actions: Record<string, string[]> = {
    'code-reviewer': [
      'Always check for security vulnerabilities and best practices',
      'Validate test coverage for all changes',
      'Ensure code follows project standards',
    ],
    'ux-designer': [
      'Always prioritize user needs and accessibility',
      'Validate design against user research and feedback',
      'Ensure consistency with design system',
    ],
    'security-expert': [
      'Always identify and document security risks',
      'Validate compliance with security standards',
      'Ensure defense-in-depth approach',
    ],
    'api-designer': [
      'Always validate API design against security best practices',
      'Consider backward compatibility in all changes',
      'Ensure clear and complete documentation',
    ],
  };

  return actions[agentId] || [
    'Always follow best practices and standards',
    'Validate work against requirements',
    'Ensure quality and consistency',
  ];
}

// Apply BMAD patch to agent
function applyBmadPatch(agentPath: string, agentId: string): void {
  try {
    const content = fs.readFileSync(agentPath, 'utf-8');
    const agent = yaml.parse(content);

    const metadata = AGENT_METADATA[agentId] || { name: 'Expert', icon: '⭐', module: 'numagent' };

    // Preserve existing data
    const existingAgent = agent.agent || {};

    // Enrich metadata
    if (!existingAgent.metadata) {
      existingAgent.metadata = {};
    }
    existingAgent.metadata.name = metadata.name;
    existingAgent.metadata.icon = metadata.icon;
    existingAgent.metadata.module = metadata.module;
    existingAgent.metadata.title = `${metadata.icon} ${existingAgent.metadata.title || agentId}`;

    // Add persona if not exists
    if (!existingAgent.persona) {
      existingAgent.persona = generatePersona(agentId, existingAgent.description || '');
    }

    // Add critical_actions if not exists
    if (!existingAgent.critical_actions) {
      existingAgent.critical_actions = generateCriticalActions(agentId);
    }

    // Add menu if not exists
    if (!existingAgent.menu) {
      existingAgent.menu = generateWorkflows(agentId);
    }

    // Write back to file
    const enrichedYaml = yaml.stringify({ agent: existingAgent }, { indent: 2 });
    fs.writeFileSync(agentPath, enrichedYaml, 'utf-8');

    console.log(`✅ Patched: ${agentId}`);
  } catch (error) {
    console.error(`❌ Error patching ${agentId}:`, error);
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
