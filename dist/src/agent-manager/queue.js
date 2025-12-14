import * as fs from 'fs';
import * as path from 'path';
export class AgentQueue {
    customModesDir;
    tasks = new Map();
    queue = [];
    constructor(customModesDir) {
        this.customModesDir = customModesDir;
        this.discoverAgents();
    }
    discoverAgents() {
        if (!fs.existsSync(this.customModesDir)) {
            throw new Error(`Directory not found: ${this.customModesDir}`);
        }
        const files = fs.readdirSync(this.customModesDir)
            .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
        files.forEach(file => {
            const agentId = file.replace(/\.(yaml|yml|agent\.yaml)$/, '');
            const filePath = path.join(this.customModesDir, file);
            const taskId = `task-${agentId}-${Date.now()}`;
            const task = {
                id: taskId,
                agentId,
                filePath,
                status: 'pending',
            };
            this.tasks.set(taskId, task);
            this.queue.push(taskId);
        });
    }
    getNextTask() {
        const taskId = this.queue.find(id => {
            const task = this.tasks.get(id);
            return task?.status === 'pending';
        });
        if (!taskId)
            return null;
        const task = this.tasks.get(taskId);
        task.status = 'processing';
        task.startTime = Date.now();
        return task;
    }
    completeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'completed';
            task.endTime = Date.now();
        }
    }
    failTask(taskId, error) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'failed';
            task.error = error;
            task.endTime = Date.now();
        }
    }
    getStats() {
        let pending = 0;
        let processing = 0;
        let completed = 0;
        let failed = 0;
        this.tasks.forEach(task => {
            if (task.status === 'pending')
                pending++;
            else if (task.status === 'processing')
                processing++;
            else if (task.status === 'completed')
                completed++;
            else if (task.status === 'failed')
                failed++;
        });
        return {
            total: this.tasks.size,
            pending,
            processing,
            completed,
            failed,
        };
    }
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
}
