export class FlowRunner {
    flow;
    store;
    nodeResults = new Map();
    llmCall;
    toolCall;
    constructor(flow, store, llmCall, toolCall) {
        this.flow = flow;
        this.store = store;
        this.llmCall = llmCall;
        this.toolCall = toolCall;
    }
    async run() {
        const startTime = Date.now();
        const runId = `run-${this.flow.id}-${Date.now()}`;
        console.log(`\n🚀 Starting Flow: ${this.flow.name} (${runId})`);
        console.log(`📊 Pattern: ${this.flow.pattern}\n`);
        try {
            if (this.flow.pattern === 'serial') {
                await this.runSerial();
            }
            else if (this.flow.pattern === 'parallel') {
                await this.runParallel();
            }
            else if (this.flow.pattern === 'consensus') {
                await this.runConsensus();
            }
            const duration = Date.now() - startTime;
            const status = this.getFlowStatus();
            console.log(`\n✅ Flow completed: ${status}`);
            console.log(`⏱️  Duration: ${duration}ms\n`);
            return {
                flowId: this.flow.id,
                runId,
                status,
                nodeResults: this.nodeResults,
                store: this.store,
                duration,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`\n❌ Flow failed: ${error}`);
            return {
                flowId: this.flow.id,
                runId,
                status: 'failed',
                nodeResults: this.nodeResults,
                store: this.store,
                duration,
                timestamp: new Date(),
            };
        }
    }
    async runSerial() {
        // Execute nodes in order
        for (const node of this.flow.nodes) {
            const nodeId = node.getId();
            console.log(`⏳ Executing node: ${nodeId} (${node.getRole()})`);
            const result = await node.execute({
                store: this.store,
                llmCall: this.llmCall,
                toolCall: this.toolCall,
            });
            this.nodeResults.set(nodeId, result);
            if (result.status === 'ok') {
                console.log(`✅ Node completed: ${nodeId}`);
            }
            else if (result.status === 'blocked') {
                console.log(`🚫 Node blocked: ${nodeId} - ${result.error}`);
                this.store.updateState({ status: 'blocked' });
                throw new Error(`Node ${nodeId} blocked: ${result.error}`);
            }
            else if (result.status === 'fail') {
                console.log(`❌ Node failed: ${nodeId} - ${result.error}`);
                throw new Error(`Node ${nodeId} failed: ${result.error}`);
            }
        }
    }
    async runParallel() {
        // Find parallel groups based on edges
        const parallelGroups = this.findParallelGroups();
        for (const group of parallelGroups) {
            console.log(`⏳ Executing parallel group: ${group.map(n => n.getId()).join(', ')}`);
            const promises = group.map(node => node.execute({
                store: this.store,
                llmCall: this.llmCall,
                toolCall: this.toolCall,
            }));
            const results = await Promise.all(promises);
            group.forEach((node, index) => {
                const result = results[index];
                if (result) {
                    this.nodeResults.set(node.getId(), result);
                    if (result.status === 'ok') {
                        console.log(`✅ Node completed: ${node.getId()}`);
                    }
                    else if (result.status === 'blocked') {
                        console.log(`🚫 Node blocked: ${node.getId()}`);
                        this.store.updateState({ status: 'blocked' });
                    }
                    else {
                        console.log(`❌ Node failed: ${node.getId()}`);
                    }
                }
            });
            // Check if any node failed or blocked
            const failedOrBlocked = results.some(r => r.status !== 'ok');
            if (failedOrBlocked) {
                throw new Error('One or more nodes in parallel group failed or blocked');
            }
        }
    }
    async runConsensus() {
        // Execute all nodes, then use arbiter to choose
        console.log(`⏳ Executing consensus group: ${this.flow.nodes.map(n => n.getId()).join(', ')}`);
        const promises = this.flow.nodes.map(node => node.execute({
            store: this.store,
            llmCall: this.llmCall,
            toolCall: this.toolCall,
        }));
        const results = await Promise.all(promises);
        this.flow.nodes.forEach((node, index) => {
            const result = results[index];
            this.nodeResults.set(node.getId(), result);
            if (result.status === 'ok') {
                console.log(`✅ Node completed: ${node.getId()}`);
            }
            else {
                console.log(`⚠️  Node result: ${node.getId()} - ${result.status}`);
            }
        });
        // Consensus logic: choose the best result
        const okResults = results.filter(r => r.status === 'ok');
        if (okResults.length === 0) {
            throw new Error('No nodes reached consensus');
        }
        console.log(`✅ Consensus reached: ${okResults.length}/${this.flow.nodes.length} nodes agreed`);
    }
    findParallelGroups() {
        // Simple parallel grouping: nodes with no dependencies can run in parallel
        const groups = [];
        const processed = new Set();
        for (const node of this.flow.nodes) {
            if (processed.has(node.getId()))
                continue;
            const group = [node];
            processed.add(node.getId());
            // Find other nodes that can run in parallel
            for (const otherNode of this.flow.nodes) {
                if (processed.has(otherNode.getId()))
                    continue;
                const hasEdgeTo = this.flow.edges.some(e => e.from === node.getId() && e.to === otherNode.getId());
                const hasEdgeFrom = this.flow.edges.some(e => e.from === otherNode.getId() && e.to === node.getId());
                if (!hasEdgeTo && !hasEdgeFrom) {
                    group.push(otherNode);
                    processed.add(otherNode.getId());
                }
            }
            groups.push(group);
        }
        return groups;
    }
    getFlowStatus() {
        const state = this.store.getState();
        if (state.status === 'blocked') {
            return 'blocked';
        }
        if (state.failedNodes.length > 0) {
            return 'failed';
        }
        if (state.completedNodes.length === this.flow.nodes.length) {
            return 'completed';
        }
        return 'failed';
    }
}
