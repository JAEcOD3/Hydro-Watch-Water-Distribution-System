// Import the water calculation functions.
const {
    calculateWaterShortage,
    hasEnoughWater
} = require("./waterCalculator");

// Test 1: Station needs 1,000 but receives 800.
const shortage = calculateWaterShortage(1000, 800);

// Test 2: Station receives exactly what it needs.
const enoughWater = hasEnoughWater(1000, 1000);

// Test 3: Station receives less than it needs.
const notEnoughWater = hasEnoughWater(1000, 800);

// Display the test results.
console.log("TEST 1 - Water shortage:", shortage);
console.log("TEST 2 - Enough water:", enoughWater);
console.log("TEST 3 - Not enough water:", notEnoughWater);