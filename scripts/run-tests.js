#!/usr/bin/env node
// Test Runner - Execute all integration tests

const path = require('path');
const { spawn } = require('child_process');

const apiKey = process.argv[2] || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY not provided');
  console.error('Usage: node run-tests.js <API_KEY>');
  console.error('Or set GEMINI_API_KEY environment variable');
  process.exit(1);
}

console.log('🔑 Using Gemini API Key:', apiKey.substring(0, 10) + '...');
console.log('');

// Run tests sequentially
const tests = [
  {
    name: 'Gemini Integration Tests',
    file: 'test-gemini.ts',
  },
  {
    name: 'Agent Access & Prompt Engineering Tests',
    file: 'test-agent-access.ts',
  },
  {
    name: 'System Integration Tests',
    file: 'test-system-integration.ts',
  },
];

let currentTest = 0;

function runNextTest() {
  if (currentTest >= tests.length) {
    console.log('\n✅ All tests completed!\n');
    process.exit(0);
  }

  const test = tests[currentTest];
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 Running: ${test.name}`);
  console.log(`${'='.repeat(80)}\n`);

  const testPath = path.join(__dirname, test.file);
  const child = spawn('npx', ['ts-node', testPath, apiKey], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });

  child.on('close', code => {
    if (code !== 0) {
      console.error(`\n❌ Test failed with exit code ${code}`);
      process.exit(1);
    }
    currentTest++;
    runNextTest();
  });

  child.on('error', err => {
    console.error(`\n❌ Error running test: ${err.message}`);
    process.exit(1);
  });
}

runNextTest();
