// Import our leak detection function.
const detectLeak = require("./leakDetection");

// Test 1: Expected flow is 1,000, but actual flow is 800.
const test1 = detectLeak(1000, 800);

// Test 2: Expected flow is 1,000, and actual flow is 1,000.
const test2 = detectLeak(1000, 1000);

// Display the test results.
console.log("TEST 1 - Possible leak:", test1);
console.log("TEST 2 - Possible leak:", test2);