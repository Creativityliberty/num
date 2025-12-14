import { z } from 'zod';
import { Node } from './node.js';
import type { FlowDefinition } from './runner.js';

// NumFlow: 4-Phase Orchestration System
// Phase 1: Analysis (Brainstorm, Research, Explore)
// Phase 2: Planning (PRD, Tech Spec, Architecture)
// Phase 3: Solutioning (Design, UX, Implementation Plan)
// Phase 4: Implementation (Code, Test, Security, Deploy)

export const numflowPhase1Analysis: FlowDefinition = {
  id: 'numflow-phase1-analysis',
  name: 'NumFlow Phase 1: Analysis',
  description: 'Brainstorm, research, and explore solutions',
  pattern: 'parallel',
  nodes: [
    new Node({
      id: 'analysis-brainstorm',
      role: 'Business Analyst',
      goal: 'Brainstorm and identify requirements',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Conduct brainstorming:
- Identify stakeholders
- List requirements
- Document constraints
- Suggest approaches

Return as JSON.`,
      expectedSchema: z.object({
        stakeholders: z.array(z.string()),
        requirements: z.array(z.string()),
        constraints: z.array(z.string()),
        approaches: z.array(z.string()),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec'] },
    }),

    new Node({
      id: 'analysis-research',
      role: 'Research Specialist',
      goal: 'Research market and technical feasibility',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Conduct research:
- Analyze competitors
- Identify trends
- Document best practices
- Assess feasibility

Return as JSON.`,
      expectedSchema: z.object({
        competitors: z.array(z.string()),
        trends: z.array(z.string()),
        bestPractices: z.array(z.string()),
        feasibility: z.string(),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec'] },
    }),
  ],
  edges: [],
};

export const numflowPhase2Planning: FlowDefinition = {
  id: 'numflow-phase2-planning',
  name: 'NumFlow Phase 2: Planning',
  description: 'Create PRD, tech spec, and architecture',
  pattern: 'serial',
  nodes: [
    new Node({
      id: 'planning-prd',
      role: 'Product Manager',
      goal: 'Create Product Requirements Document',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Create PRD:
- Define features
- Set acceptance criteria
- Prioritize requirements
- Document user stories

Return as JSON.`,
      expectedSchema: z.object({
        features: z.array(z.string()),
        acceptanceCriteria: z.array(z.string()),
        priorities: z.array(z.string()),
        userStories: z.array(z.string()),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec', 'write'] },
    }),

    new Node({
      id: 'planning-architecture',
      role: 'Solution Architect',
      goal: 'Design system architecture',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Design architecture:
- Define components
- Specify interfaces
- Plan scalability
- Document decisions

Return as JSON.`,
      expectedSchema: z.object({
        components: z.array(z.string()),
        interfaces: z.array(z.string()),
        scalability: z.string(),
        decisions: z.array(z.string()),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec', 'write'] },
    }),
  ],
  edges: [
    { from: 'planning-prd', to: 'planning-architecture', condition: 'ok' },
  ],
};

export const numflowPhase3Solutioning: FlowDefinition = {
  id: 'numflow-phase3-solutioning',
  name: 'NumFlow Phase 3: Solutioning',
  description: 'Design UX and create implementation plan',
  pattern: 'parallel',
  nodes: [
    new Node({
      id: 'solutioning-ux',
      role: 'UX Designer',
      goal: 'Design user experience and interface',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Design UX:
- Create user flows
- Design wireframes
- Define interactions
- Plan accessibility

Return as JSON.`,
      expectedSchema: z.object({
        userFlows: z.array(z.string()),
        wireframes: z.array(z.string()),
        interactions: z.array(z.string()),
        accessibility: z.array(z.string()),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec', 'write'] },
    }),

    new Node({
      id: 'solutioning-implementation-plan',
      role: 'Technical Lead',
      goal: 'Create implementation plan',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Create implementation plan:
- Break down tasks
- Estimate effort
- Plan dependencies
- Define milestones

Return as JSON.`,
      expectedSchema: z.object({
        tasks: z.array(z.string()),
        estimates: z.array(z.string()),
        dependencies: z.array(z.string()),
        milestones: z.array(z.string()),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec', 'write'] },
    }),
  ],
  edges: [],
};

export const numflowPhase4Implementation: FlowDefinition = {
  id: 'numflow-phase4-implementation',
  name: 'NumFlow Phase 4: Implementation',
  description: 'Code, test, security review, and deploy',
  pattern: 'serial',
  nodes: [
    new Node({
      id: 'implementation-code',
      role: 'Developer',
      goal: 'Implement features',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Implement features:
- Write code
- Follow standards
- Add documentation
- Create tests

Return as JSON.`,
      expectedSchema: z.object({
        code: z.array(z.string()),
        standards: z.array(z.string()),
        documentation: z.array(z.string()),
        tests: z.array(z.string()),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec', 'write', 'git'] },
    }),

    new Node({
      id: 'implementation-test',
      role: 'QA Specialist',
      goal: 'Test implementation',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Test implementation:
- Execute test cases
- Report issues
- Verify fixes
- Sign off

Return as JSON.`,
      expectedSchema: z.object({
        testCases: z.array(z.string()),
        issues: z.array(z.string()),
        fixes: z.array(z.string()),
        signOff: z.boolean(),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec'] },
    }),

    new Node({
      id: 'implementation-security',
      role: 'Security Expert',
      goal: 'Security review',
      promptTemplate: `You are a {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Security review:
- Identify vulnerabilities
- Check compliance
- Recommend fixes
- Approve deployment

Return as JSON.`,
      expectedSchema: z.object({
        vulnerabilities: z.array(z.string()),
        compliance: z.array(z.string()),
        fixes: z.array(z.string()),
        approved: z.boolean(),
      }),
      retryPolicy: { maxRetries: 2, onlyOnInvalidJSON: true },
      gates: { requires: ['exec'] },
    }),
  ],
  edges: [
    { from: 'implementation-code', to: 'implementation-test', condition: 'ok' },
    { from: 'implementation-test', to: 'implementation-security', condition: 'ok' },
  ],
};

// NumFlow Orchestrator: Manages all 4 phases
export class NumFlowOrchestrator {
  private phases = [
    numflowPhase1Analysis,
    numflowPhase2Planning,
    numflowPhase3Solutioning,
    numflowPhase4Implementation,
  ];

  getPhase(index: number): FlowDefinition | null {
    return this.phases[index] || null;
  }

  getAllPhases(): FlowDefinition[] {
    return this.phases;
  }

  getPhaseByName(name: string): FlowDefinition | null {
    return this.phases.find(p => p.name.includes(name)) || null;
  }

  getPhaseCount(): number {
    return this.phases.length;
  }

  // Get the next phase after current
  getNextPhase(currentPhaseId: string): FlowDefinition | null {
    const currentIndex = this.phases.findIndex(p => p.id === currentPhaseId);
    if (currentIndex === -1 || currentIndex === this.phases.length - 1) {
      return null;
    }
    const nextPhase = this.phases[currentIndex + 1];
    return nextPhase || null;
  }
}
