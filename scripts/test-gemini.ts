#!/usr/bin/env ts-node
// Gemini Integration Test Script - Run all handler tests with API key

import { runGeminiTests } from '../src/flow-dag/gemini-test.js';

// API Key from environment or argument
const apiKey = process.argv[2] || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY not provided');
  console.error('Usage: ts-node test-gemini.ts <API_KEY>');
  console.error('Or set GEMINI_API_KEY environment variable');
  process.exit(1);
}

console.log('🔑 Using Gemini API Key:', apiKey.substring(0, 10) + '...');
console.log('');

// Run tests
runGeminiTests(apiKey).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
