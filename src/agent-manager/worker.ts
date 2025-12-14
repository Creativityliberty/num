import type { AgentProcessor } from './processor.js';
import type { AgentQueue } from './queue.js';

export interface WorkerConfig {
  id: number;
  queue: AgentQueue;
  processor: AgentProcessor;
}

export class Worker {
  private id: number;
  private queue: AgentQueue;
  private processor: AgentProcessor;
  private isRunning: boolean = false;
  private processedTasks: number = 0;

  constructor(config: WorkerConfig) {
    this.id = config.id;
    this.queue = config.queue;
    this.processor = config.processor;
  }

  async start(): Promise<void> {
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
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.queue.failTask(task.id, errorMsg);
        console.error(`❌ Worker ${this.id} failed: ${task.agentId} - ${errorMsg}`);
      }

      // Small delay to prevent CPU spinning
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🛑 Worker ${this.id} stopped (processed ${this.processedTasks} tasks)`);
  }

  stop(): void {
    this.isRunning = false;
  }

  getProcessedCount(): number {
    return this.processedTasks;
  }
}

export class WorkerPool {
  private workers: Worker[] = [];
  private workerPromises: Promise<void>[] = [];

  constructor(
    private poolSize: number,
    private queue: AgentQueue,
    private processor: AgentProcessor
  ) {
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker({
        id: i + 1,
        queue: this.queue,
        processor: this.processor,
      });
      this.workers.push(worker);
    }
  }

  async run(): Promise<void> {
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

  stopAll(): void {
    this.workers.forEach(worker => worker.stop());
  }
}
