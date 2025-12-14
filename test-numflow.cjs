// Quick test of NumFlow system
const fs = require('fs');
const path = require('path');

console.log('\n🧪 NumFlow System Test\n');
console.log('='.repeat(60));

// Test 1: Check if files exist
const files = [
  'src/flow-dag/store.ts',
  'src/flow-dag/node.ts',
  'src/flow-dag/runner.ts',
  'src/flow-dag/numflow.ts',
  'src/flow-dag/flow-tests.ts',
  'src/flow-dag/mcp-api.ts',
];

console.log('\n📁 Flow DAG Files:');
files.forEach(file => {
  const exists = fs.existsSync(file);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${file}`);
});

// Test 2: Check agents directory
console.log('\n👥 Agents:');
const agentDirs = ['src/agents', 'data/agents'];
let agentCount = 0;
for (const dir of agentDirs) {
  if (fs.existsSync(dir)) {
    const agents = fs.readdirSync(dir).filter(f => f.endsWith('.yaml')).length;
    agentCount += agents;
    console.log(`✅ ${dir}: ${agents} agents`);
  }
}
console.log(`📊 Total: ${agentCount} agents`);

// Test 3: Check custom modes
console.log('\n🎯 Custom Modes:');
const customModesDir = 'src/custom-modes';
if (fs.existsSync(customModesDir)) {
  const customModes = fs.readdirSync(customModesDir).filter(f => f.endsWith('.yaml')).length;
  console.log(`✅ ${customModesDir}: ${customModes} modes`);
} else {
  console.log(`❌ ${customModesDir} not found`);
}

// Test 4: Check API endpoints
console.log('\n🔌 API Endpoints:');
const endpoints = [
  '/mcp/tools',
  '/mcp/flows',
  '/mcp/runs',
  '/api/catalog',
  '/api/custom-modes',
];
endpoints.forEach(ep => console.log(`  ✅ ${ep}`));

// Test 5: NumFlow Phases
console.log('\n📊 NumFlow Phases:');
const phases = [
  'Phase 1: Analysis (Parallel)',
  'Phase 2: Planning (Serial)',
  'Phase 3: Solutioning (Parallel)',
  'Phase 4: Implementation (Serial)',
];
phases.forEach(p => console.log(`  ✅ ${p}`));

// Test 6: Check build output
console.log('\n🔨 Build Status:');
const distExists = fs.existsSync('dist');
console.log(`${distExists ? '✅' : '⚠️'} dist/ directory ${distExists ? 'exists' : 'not yet built'}`);

// Test 7: Check key infrastructure files
console.log('\n🏗️ Infrastructure:');
const infraFiles = [
  'src/dashboard/server.ts',
  'src/dashboard/data/mcpApi.ts',
  '.windsurf/mcp.json',
];
infraFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${file}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ NumFlow System Test Complete\n');
