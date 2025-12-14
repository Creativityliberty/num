// System Integration Test Script - Verify all agents have access to all handlers

import { runSystemIntegrationTest } from '../src/flow-dag/system-integration-test.js';

const apiKey = process.argv[2] || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY not provided');
  console.error('Usage: ts-node test-system-integration.ts <API_KEY>');
  console.error('Or set GEMINI_API_KEY environment variable');
  process.exit(1);
}

console.log('🔑 Using Gemini API Key:', apiKey.substring(0, 10) + '...');
console.log('');

runSystemIntegrationTest(apiKey).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
