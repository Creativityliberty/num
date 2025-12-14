import * as path from 'path';
import { AgentProcessor } from '../src/agent-manager/processor';
import { AgentQueue } from '../src/agent-manager/queue';
import { WorkerPool } from '../src/agent-manager/worker';

async function main() {
  const customModesDir = path.join(__dirname, '../custom_modes.d');
  const poolSize = 5; // Number of parallel workers

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Num Agents - Parallel Processing System`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Initialize queue and discover agents
    console.log(`📂 Discovering agents in: ${customModesDir}\n`);
    const queue = new AgentQueue(customModesDir);

    const stats = queue.getStats();
    console.log(`📊 Found ${stats.total} agents to process\n`);

    // Initialize processor
    const processor = new AgentProcessor({
      validateOnly: false,
      dryRun: false,
    });

    // Create and run worker pool
    const workerPool = new WorkerPool(poolSize, queue, processor);
    await workerPool.run();

    // Print final report
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Processing Complete`);
    console.log(`${'='.repeat(60)}\n`);

    const finalStats = queue.getStats();
    const allTasks = queue.getAllTasks();

    // Print summary
    console.log(`📈 Summary:`);
    console.log(`  Total:     ${finalStats.total}`);
    console.log(`  Completed: ${finalStats.completed} ✅`);
    console.log(`  Failed:    ${finalStats.failed} ❌`);
    console.log(`  Success Rate: ${((finalStats.completed / finalStats.total) * 100).toFixed(1)}%\n`);

    // Print failed tasks if any
    const failedTasks = allTasks.filter(t => t.status === 'failed');
    if (failedTasks.length > 0) {
      console.log(`⚠️  Failed Tasks:`);
      failedTasks.forEach(task => {
        console.log(`  - ${task.agentId}: ${task.error}`);
      });
      console.log();
    }

    // Print timing stats
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, t) => {
        return sum + ((t.endTime || 0) - (t.startTime || 0));
      }, 0);
      const avgTime = totalTime / completedTasks.length;
      console.log(`⏱️  Timing:`);
      console.log(`  Average time per agent: ${avgTime.toFixed(0)}ms`);
      console.log(`  Total processing time: ${totalTime}ms\n`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`Fatal error: ${error}`);
  process.exit(1);
});
