#!/usr/bin/env node

import { runFlowDAGTests } from '../src/flow-dag/flow-tests.js';

// Run the test suite
console.log('\n🚀 Starting Flow DAG Test Suite\n');
runFlowDAGTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
