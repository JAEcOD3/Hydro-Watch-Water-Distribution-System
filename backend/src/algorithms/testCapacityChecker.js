// Import the pipeline capacity checker.
const checkCapacity = require("./capacityChecker");

// Test 1: Current flow is below maximum capacity.
const test1 = checkCapacity(800, 1000);

// Test 2: Current flow equals maximum capacity.
const test2 = checkCapacity(1000, 1000);

// Test 3: Current flow exceeds maximum capacity.
const test3 = checkCapacity(1200, 1000);

// Display all test results.
console.log("TEST 1 - Within capacity:", test1);
console.log("TEST 2 - At maximum capacity:", test2);
console.log("TEST 3 - Over capacity:", test3);