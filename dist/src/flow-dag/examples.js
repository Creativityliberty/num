import { z } from 'zod';
import { Node } from './node.js';
// Example: API Design Flow (Serial pattern)
export const apiDesignFlowDefinition = {
    id: 'api-design-flow',
    name: 'API Design Flow',
    description: 'Design a REST API from requirements',
    pattern: 'serial',
    nodes: [
        new Node({
            id: 'plan-api',
            role: 'API Architect',
            goal: 'Create a detailed API design plan',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Create a comprehensive API design plan including:
- Endpoints
- Request/Response schemas
- Authentication
- Rate limiting
- Error handling

Return as JSON.`,
            expectedSchema: z.object({
                endpoints: z.array(z.object({
                    method: z.string(),
                    path: z.string(),
                    description: z.string(),
                })),
                authentication: z.string(),
                rateLimit: z.string(),
                errorHandling: z.string(),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
        new Node({
            id: 'validate-api',
            role: 'API Security Expert',
            goal: 'Validate API design for security and best practices',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Validate the API design and provide:
- Security issues found
- Best practices violations
- Recommendations

Return as JSON.`,
            expectedSchema: z.object({
                securityIssues: z.array(z.string()),
                bestPracticesViolations: z.array(z.string()),
                recommendations: z.array(z.string()),
                approved: z.boolean(),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
        new Node({
            id: 'document-api',
            role: 'API Documentation Expert',
            goal: 'Generate API documentation',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Generate comprehensive API documentation including:
- Overview
- Authentication guide
- Endpoint reference
- Examples
- Error codes

Return as JSON.`,
            expectedSchema: z.object({
                overview: z.string(),
                authenticationGuide: z.string(),
                endpointReference: z.array(z.any()),
                examples: z.array(z.string()),
                errorCodes: z.array(z.object({
                    code: z.number(),
                    message: z.string(),
                })),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec', 'write'],
            },
        }),
    ],
    edges: [
        { from: 'plan-api', to: 'validate-api', condition: 'ok' },
        { from: 'validate-api', to: 'document-api', condition: 'ok' },
    ],
};
// Example: Code Review Flow (Parallel pattern)
export const codeReviewFlowDefinition = {
    id: 'code-review-flow',
    name: 'Code Review Flow',
    description: 'Review code for quality and security in parallel',
    pattern: 'parallel',
    nodes: [
        new Node({
            id: 'review-quality',
            role: 'Code Quality Expert',
            goal: 'Review code for quality and best practices',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Review the code and provide:
- Code quality issues
- Best practices violations
- Refactoring suggestions

Return as JSON.`,
            expectedSchema: z.object({
                qualityIssues: z.array(z.string()),
                bestPractices: z.array(z.string()),
                refactoringSuggestions: z.array(z.string()),
                overallScore: z.number(),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
        new Node({
            id: 'review-security',
            role: 'Security Expert',
            goal: 'Review code for security vulnerabilities',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Review the code for security issues:
- Vulnerabilities
- Injection risks
- Authentication/Authorization issues
- Data exposure risks

Return as JSON.`,
            expectedSchema: z.object({
                vulnerabilities: z.array(z.string()),
                injectionRisks: z.array(z.string()),
                authIssues: z.array(z.string()),
                dataExposureRisks: z.array(z.string()),
                severity: z.enum(['low', 'medium', 'high', 'critical']),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
        new Node({
            id: 'review-tests',
            role: 'Test Architect',
            goal: 'Review test coverage and quality',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Review the test coverage:
- Coverage gaps
- Test quality issues
- Missing test cases

Return as JSON.`,
            expectedSchema: z.object({
                coverageGaps: z.array(z.string()),
                testQualityIssues: z.array(z.string()),
                missingTestCases: z.array(z.string()),
                coveragePercentage: z.number(),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
    ],
    edges: [
    // All nodes can run in parallel
    ],
};
// Example: UX Design Flow (Consensus pattern)
export const uxDesignFlowDefinition = {
    id: 'ux-design-flow',
    name: 'UX Design Flow',
    description: 'Design UX with consensus from multiple experts',
    pattern: 'consensus',
    nodes: [
        new Node({
            id: 'design-ux-expert1',
            role: 'UX Designer',
            goal: 'Design UX from user perspective',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Design the UX including:
- User flows
- Wireframes
- Interaction patterns
- Accessibility considerations

Return as JSON.`,
            expectedSchema: z.object({
                userFlows: z.array(z.string()),
                wireframes: z.array(z.string()),
                interactionPatterns: z.array(z.string()),
                accessibility: z.array(z.string()),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
        new Node({
            id: 'design-ux-expert2',
            role: 'UI Designer',
            goal: 'Design UI with visual consistency',
            promptTemplate: `You are an {{ROLE}}.
Goal: {{GOAL}}

Context:
{{CONTEXT}}

Design the UI including:
- Visual hierarchy
- Color scheme
- Typography
- Component library

Return as JSON.`,
            expectedSchema: z.object({
                visualHierarchy: z.array(z.string()),
                colorScheme: z.array(z.string()),
                typography: z.array(z.string()),
                componentLibrary: z.array(z.string()),
            }),
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: ['exec'],
            },
        }),
    ],
    edges: [
    // Consensus: both nodes run, then arbiter chooses
    ],
};
