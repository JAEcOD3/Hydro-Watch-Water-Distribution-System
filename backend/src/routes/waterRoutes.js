// Import Express to create API routes.
const express = require("express");

// Create a router for water calculation endpoints.
const router = express.Router();

// Import the water calculation functions.
const {
    calculateWaterShortage,
    hasEnoughWater
} = require("../algorithms/waterCalculator");

// Import PostgreSQL connection pool.
const pool = require("../config/db");

// Create an endpoint to calculate water supply and demand.
router.get("/water-status/:stationId", async (req, res) => {
    try {
        // Get the station ID from the URL.
        const stationId = req.params.stationId;

        // Retrieve the station's demand and current supply.
        const result = await pool.query(
            "SELECT * FROM distribution_stations WHERE station_id = $1",
            [stationId]
        );

        // Check whether the requested station exists.
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Distribution station not found."
            });
        }

        // Store the station information.
        const station = result.rows[0];

        // Calculate the station's water shortage.
        const shortage = calculateWaterShortage(
            station.demand,
            station.current_supply
        );

        // Check whether the station has enough water.
        const enoughWater = hasEnoughWater(
            station.demand,
            station.current_supply
        );

        // Return the water status as JSON.
        res.json({
            station: station.name,
            demand: station.demand,
            currentSupply: station.current_supply,
            shortage: shortage,
            enoughWater: enoughWater
        });

    } catch (error) {
        // Log the error and return a server error response.
        console.error("Water calculation error:", error.message);

        res.status(500).json({
            error: "Unable to calculate water status."
        });
    }
});

// Export the router for use in server.js.
module.exports = router;