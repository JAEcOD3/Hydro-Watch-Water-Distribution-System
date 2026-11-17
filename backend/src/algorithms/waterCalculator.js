// ==========================================
// WATER SUPPLY AND DEMAND CALCULATOR
// ==========================================

// Calculate how much water a station still needs.
function calculateWaterShortage(demand, currentSupply) {

    // Subtract the current water supply from total demand.
    const shortage = demand - currentSupply;

    // Return zero if the station already has enough water.
    return Math.max(0, shortage);
}

// Check whether a station has enough water.
function hasEnoughWater(demand, currentSupply) {

    // Return true when supply meets or exceeds demand.
    return currentSupply >= demand;
}

// Export both functions for use in other files.
module.exports = {
    calculateWaterShortage,
    hasEnoughWater
};