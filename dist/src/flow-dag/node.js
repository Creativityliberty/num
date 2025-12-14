export class Node {
    config;
    retryCount = 0;
    constructor(config) {
        this.config = {
            retryPolicy: {
                maxRetries: 2,
                onlyOnInvalidJSON: true,
            },
            gates: {
                requires: [],
            },
            actions: ['ok', 'retry', 'blocked', 'fail'],
            ...config,
        };
    }
    async execute(context) {
        const { store, llmCall, toolCall } = context;
        try {
            // PREP phase
            const prepResult = await this.prep(store);
            if (!prepResult.ok) {
                return { status: 'blocked', error: prepResult.error };
            }
            // Check gates
            const gateCheck = this.checkGates(store);
            if (!gateCheck.ok) {
                store.markNodeBlocked(this.config.id);
                return { status: 'blocked', error: gateCheck.error };
            }
            // EXEC phase
            const prompt = this.buildPrompt(store);
            let output;
            let lastError = null;
            for (let attempt = 0; attempt <= (this.config.retryPolicy?.maxRetries || 2); attempt++) {
                try {
                    output = await llmCall(prompt, this.config.expectedSchema);
                    this.retryCount = attempt;
                    break;
                }
                catch (error) {
                    lastError = error instanceof Error ? error.message : String(error);
                    if (attempt < (this.config.retryPolicy?.maxRetries || 2)) {
                        console.log(`⏳ Node ${this.config.id}: Retry ${attempt + 1}/${this.config.retryPolicy?.maxRetries}`);
                    }
                }
            }
            if (!output) {
                store.markNodeFailed(this.config.id);
                return { status: 'fail', error: lastError || 'LLM call failed', retryCount: this.retryCount };
            }
            // POST phase
            const postResult = await this.post(store, output);
            if (!postResult.ok) {
                return { status: 'fail', error: postResult.error };
            }
            // Success
            store.markNodeCompleted(this.config.id);
            return { status: 'ok', output, retryCount: this.retryCount };
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            store.markNodeFailed(this.config.id);
            return { status: 'fail', error: errorMsg };
        }
    }
    async prep(store) {
        // Validate that required artifacts exist
        const state = store.getState();
        if (state.status === 'blocked') {
            return { ok: false, error: 'Store is blocked' };
        }
        return { ok: true };
    }
    checkGates(store) {
        const policy = store.get().policySnapshot;
        const requiredTools = this.config.gates?.requires || [];
        for (const tool of requiredTools) {
            if (policy.blockedTools.includes(tool)) {
                return { ok: false, error: `Tool ${tool} is blocked by policy` };
            }
        }
        return { ok: true };
    }
    buildPrompt(store) {
        const storeData = store.get();
        const context = JSON.stringify(storeData.artifacts, null, 2);
        return this.config.promptTemplate
            .replace('{{GOAL}}', this.config.goal)
            .replace('{{ROLE}}', this.config.role)
            .replace('{{CONTEXT}}', context);
    }
    async post(store, output) {
        // Validate output against expected schema
        try {
            const validated = this.config.expectedSchema.parse(output);
            // Store the output as an artifact
            const artifactKey = `${this.config.id}_output`;
            store.setArtifact(artifactKey, validated);
            return { ok: true };
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return { ok: false, error: `Validation failed: ${errorMsg}` };
        }
    }
    getId() {
        return this.config.id;
    }
    getRole() {
        return this.config.role;
    }
}
