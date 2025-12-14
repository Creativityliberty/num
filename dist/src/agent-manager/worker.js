export class Worker {
    id;
    queue;
    processor;
    isRunning = false;
    processedTasks = 0;
    constructor(config) {
        this.id = config.id;
        this.queue = config.queue;
        this.processor = config.processor;
    }
    async start() {
        this.isRunning = true;
        console.log(`🔄 Worker ${this.id} started`);
        while (this.isRunning) {
            const task = this.queue.getNextTask();
            if (!task) {
                // No more tasks
                break;
            }
            try {
                console.log(`⏳ Worker ${this.id} processing: ${task.agentId}`);
                await this.processor.processAgent(task);
                this.queue.completeTask(task.id);
                this.processedTasks++;
                console.log(`✅ Worker ${this.id} completed: ${task.agentId}`);
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                this.queue.failTask(task.id, errorMsg);
                console.error(`❌ Worker ${this.id} failed: ${task.agentId} - ${errorMsg}`);
            }
            // Small delay to prevent CPU spinning
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log(`🛑 Worker ${this.id} stopped (processed ${this.processedTasks} tasks)`);
    }
    stop() {
        this.isRunning = false;
    }
    getProcessedCount() {
        return this.processedTasks;
    }
}
export class WorkerPool {
    poolSize;
    queue;
    processor;
    workers = [];
    workerPromises = [];
    constructor(poolSize, queue, processor) {
        this.poolSize = poolSize;
        this.queue = queue;
        this.processor = processor;
        this.initializeWorkers();
    }
    initializeWorkers() {
        for (let i = 0; i < this.poolSize; i++) {
            const worker = new Worker({
                id: i + 1,
                queue: this.queue,
                processor: this.processor,
            });
            this.workers.push(worker);
        }
    }
    async run() {
        console.log(`🚀 Starting worker pool with ${this.poolSize} workers\n`);
        this.workerPromises = this.workers.map(worker => worker.start());
        // Monitor progress
        const monitorInterval = setInterval(() => {
            const stats = this.queue.getStats();
            const progress = `[${stats.completed}/${stats.total}] Pending: ${stats.pending}, Processing: ${stats.processing}, Completed: ${stats.completed}, Failed: ${stats.failed}`;
            console.log(`📊 ${progress}`);
        }, 2000);
        await Promise.all(this.workerPromises);
        clearInterval(monitorInterval);
        const finalStats = this.queue.getStats();
        console.log(`\n✅ Worker pool finished!`);
        console.log(`📊 Final stats: ${finalStats.completed}/${finalStats.total} completed, ${finalStats.failed} failed`);
    }
    stopAll() {
        this.workers.forEach(worker => worker.stop());
    }
}
