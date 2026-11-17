// ==========================================
// WATER PIPELINE LEAK DETECTION
// ==========================================

// Check whether a pipeline may have a leak.
function detectLeak(expectedFlow, actualFlow) {

    // Compare expected water flow with the measured water flow.
    if (actualFlow < expectedFlow) {
        // Return true when less water arrives than expected.
        return true;
    }

    // Return false when the measured flow meets expectations.
    return false;
}

// Export the function so other files can use it.
module.exports = detectLeak;