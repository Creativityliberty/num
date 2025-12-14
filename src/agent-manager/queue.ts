import * as fs from 'fs';
import * as path from 'path';

export interface AgentTask {
  id: string;
  agentId: string;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  startTime?: number;
  endTime?: number;
}

export class AgentQueue {
  private tasks: Map<string, AgentTask> = new Map();
  private queue: string[] = [];

  constructor(private customModesDir: string) {
    this.discoverAgents();
  }

  private discoverAgents(): void {
    if (!fs.existsSync(this.customModesDir)) {
      throw new Error(`Directory not found: ${this.customModesDir}`);
    }

    const files = fs.readdirSync(this.customModesDir)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    files.forEach(file => {
      const agentId = file.replace(/\.(yaml|yml|agent\.yaml)$/, '');
      const filePath = path.join(this.customModesDir, file);
      const taskId = `task-${agentId}-${Date.now()}`;

      const task: AgentTask = {
        id: taskId,
        agentId,
        filePath,
        status: 'pending',
      };

      this.tasks.set(taskId, task);
      this.queue.push(taskId);
    });
  }

  getNextTask(): AgentTask | null {
    const taskId = this.queue.find(id => {
      const task = this.tasks.get(id);
      return task?.status === 'pending';
    });

    if (!taskId) return null;

    const task = this.tasks.get(taskId)!;
    task.status = 'processing';
    task.startTime = Date.now();
    return task;
  }

  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.endTime = Date.now();
    }
  }

  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.error = error;
      task.endTime = Date.now();
    }
  }

  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    this.tasks.forEach(task => {
      if (task.status === 'pending') pending++;
      else if (task.status === 'processing') processing++;
      else if (task.status === 'completed') completed++;
      else if (task.status === 'failed') failed++;
    });

    return {
      total: this.tasks.size,
      pending,
      processing,
      completed,
      failed,
    };
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }
}
