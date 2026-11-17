// ==========================================
// PIPELINE CAPACITY CHECKER
// ==========================================

// Check whether a pipeline is operating within its capacity.
function checkCapacity(currentFlow, maximumCapacity) {

    // A pipeline must never carry more water than its capacity.
    if (currentFlow > maximumCapacity) {
        // Return false if the pipeline exceeds its capacity.
        return false;
    }

    // Return true if the pipeline is within its capacity.
    return true;
}

// Export the function for use in other files.
module.exports = checkCapacity;