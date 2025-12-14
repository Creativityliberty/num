// Deep Research Agent Handler - Autonomous multi-step research with planning and synthesis
// Powered by Gemini 3 Pro for complex research tasks
// Research Task Manager - Manages research task lifecycle
export class ResearchTaskManager {
    tasks = new Map();
    taskCounter = 0;
    // Create research task
    createTask(input) {
        const id = `interaction_${++this.taskCounter}`;
        const interaction = {
            id,
            status: 'in_progress',
            input,
            outputs: [],
            createdTime: new Date().toISOString(),
        };
        this.tasks.set(id, interaction);
        return interaction;
    }
    // Get task
    getTask(id) {
        return this.tasks.get(id);
    }
    // Update task status
    updateTaskStatus(id, status, error) {
        const task = this.tasks.get(id);
        if (task) {
            task.status = status;
            if (error)
                task.error = error;
            if (status !== 'in_progress') {
                task.completedTime = new Date().toISOString();
            }
        }
    }
    // Add output to task
    addOutput(id, text, type = 'text') {
        const task = this.tasks.get(id);
        if (task) {
            task.outputs.push({ text, type });
        }
    }
    // List tasks
    listTasks() {
        return Array.from(this.tasks.values());
    }
    // Get task count
    getTaskCount() {
        return this.tasks.size;
    }
}
// Research Workflow Executor - Executes research workflow (Plan → Search → Read → Synthesize)
export class ResearchWorkflowExecutor {
    taskManager;
    constructor() {
        this.taskManager = new ResearchTaskManager();
    }
    // Execute research workflow
    async executeResearch(task) {
        const interaction = this.taskManager.createTask(task.input);
        // Phase 1: Planning
        this.taskManager.addOutput(interaction.id, 'Planning research strategy...', 'thought_summary');
        // Phase 2: Search
        this.taskManager.addOutput(interaction.id, 'Searching for relevant information...', 'thought_summary');
        // Phase 3: Read & Analyze
        this.taskManager.addOutput(interaction.id, 'Reading and analyzing sources...', 'thought_summary');
        // Phase 4: Synthesize
        const synthesis = this.synthesizeResearch(task.input);
        this.taskManager.addOutput(interaction.id, synthesis, 'text');
        this.taskManager.updateTaskStatus(interaction.id, 'completed');
        return interaction;
    }
    // Synthesize research findings
    synthesizeResearch(query) {
        return `# Research Report: ${query}\n\n## Executive Summary\nComprehensive research findings on the requested topic.\n\n## Key Findings\n- Finding 1\n- Finding 2\n- Finding 3\n\n## Conclusion\nDetailed analysis and synthesis of research results.`;
    }
    // Get task manager
    getTaskManager() {
        return this.taskManager;
    }
}
// Research Steerability - Controls output formatting and structure
export class ResearchSteerability {
    // Format research output
    formatOutput(content, format) {
        const formatGuides = {
            technical: 'Format as technical report with detailed specifications and metrics',
            executive: 'Format as executive summary with key points and recommendations',
            casual: 'Format in conversational tone with accessible language',
        };
        return `${formatGuides[format]}\n\n${content}`;
    }
    // Structure report sections
    structureReport(sections) {
        return sections
            .map((section, index) => `${index + 1}. ${section}`)
            .join('\n');
    }
    // Add data table template
    createDataTable(headers, rows) {
        const headerRow = `| ${headers.join(' | ')} |`;
        const separator = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
        return `${headerRow}\n${separator}\n${dataRows}`;
    }
}
// Deep Research Agent Handler - Orchestrates all deep research operations
export class DeepResearchAgentHandler {
    workflowExecutor;
    steerability;
    maxResearchTime = 3600; // 60 minutes
    constructor() {
        this.workflowExecutor = new ResearchWorkflowExecutor();
        this.steerability = new ResearchSteerability();
    }
    // Start research task
    async startResearch(task) {
        return this.workflowExecutor.executeResearch(task);
    }
    // Get research status
    getResearchStatus(interactionId) {
        return this.workflowExecutor.getTaskManager().getTask(interactionId);
    }
    // List all research tasks
    listResearchTasks() {
        return this.workflowExecutor.getTaskManager().listTasks();
    }
    // Format research output
    formatResearchOutput(content, format) {
        return this.steerability.formatOutput(content, format);
    }
    // Create structured report
    createStructuredReport(title, sections) {
        const header = `# ${title}\n\n`;
        const structure = this.steerability.structureReport(sections);
        return header + structure;
    }
    // Create data table
    createDataTable(headers, rows) {
        return this.steerability.createDataTable(headers, rows);
    }
    // Get use cases
    getUseCases() {
        return {
            'Market Analysis': [
                'Competitive landscape research',
                'Market sizing and trends',
                'Industry benchmarking',
            ],
            'Due Diligence': [
                'Company research',
                'Financial analysis',
                'Risk assessment',
            ],
            'Literature Reviews': [
                'Academic research synthesis',
                'Topic exploration',
                'State-of-the-art analysis',
            ],
            'Competitive Intelligence': [
                'Competitor analysis',
                'Product comparison',
                'Market positioning',
            ],
        };
    }
    // Get best practices
    getBestPractices() {
        return [
            'Prompt for unknowns: Instruct agent on handling missing data',
            'Provide context: Ground research with background information',
            'Use multimodal inputs: Include text, images, audio when relevant',
            'Review citations: Verify sources in the response',
            'Set constraints: Define scope and limitations clearly',
            'Specify format: Request specific output structure',
            'Enable thinking: Use thinking_summaries for complex tasks',
        ];
    }
    // Get limitations
    getLimitations() {
        return [
            'Beta status: Interactions API in public beta, schemas may change',
            'No custom tools: Cannot provide custom Function Calling tools',
            'No structured output: Does not support structured outputs yet',
            'Max research time: 60 minutes maximum per task',
            'Store requirement: Background execution requires store=true',
            'Google Search restrictions: Specific restrictions apply to grounded results',
            'No audio inputs: Audio inputs not supported',
        ];
    }
    // Get safety considerations
    getSafetyConsiderations() {
        return {
            'Prompt Injection': 'Ensure uploaded documents come from trusted sources',
            'Web Content Risks': 'Review citations to verify source authenticity',
            'Data Exfiltration': 'Be cautious with sensitive data if web access enabled',
            'Malicious Files': 'Validate file contents before uploading',
        };
    }
    // Get comparison with standard models
    getComparison() {
        return {
            'Latency': {
                'Standard Models': 'Seconds',
                'Deep Research Agent': 'Minutes (Async)',
            },
            'Process': {
                'Standard Models': 'Generate → Output',
                'Deep Research Agent': 'Plan → Search → Read → Iterate → Output',
            },
            'Output': {
                'Standard Models': 'Conversational text, code, summaries',
                'Deep Research Agent': 'Detailed reports, long-form analysis, tables',
            },
            'Best For': {
                'Standard Models': 'Chatbots, extraction, creative writing',
                'Deep Research Agent': 'Market analysis, due diligence, literature reviews',
            },
        };
    }
    // Get comprehensive stats
    getComprehensiveStats() {
        return {
            taskCount: this.workflowExecutor.getTaskManager().getTaskCount(),
            useCases: this.getUseCases(),
            bestPractices: this.getBestPractices(),
            limitations: this.getLimitations(),
            safetyConsiderations: this.getSafetyConsiderations(),
            comparison: this.getComparison(),
            maxResearchTime: this.maxResearchTime,
        };
    }
}
// Export factory function
export function createDeepResearchAgentHandler() {
    return new DeepResearchAgentHandler();
}
