
// Import Express so we can create API routes.
const express = require("express");

// Create a router to organize our API endpoints.
const router = express.Router();

// Import our PostgreSQL connection pool.
const pool = require("../config/db");


// ==========================================
// 1. GET ALL RESERVOIRS
// ==========================================

// This route retrieves every reservoir from the database.
router.get("/reservoirs", async (req, res) => {
    try {
        // Query PostgreSQL and sort reservoirs by their ID.
        const result = await pool.query(
            "SELECT * FROM reservoirs ORDER BY reservoir_id"
        );

        // Send the retrieved reservoir records as JSON.
        res.json(result.rows);

    } catch (error) {
        // Return an error response if the database query fails.
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 2. GET ALL PIPELINES
// ==========================================

// This route retrieves every pipeline in the network.
router.get("/pipelines", async (req, res) => {
    try {
        // Retrieve pipelines and sort them by pipeline ID.
        const result = await pool.query(
            "SELECT * FROM pipelines ORDER BY pipeline_id"
        );

        // Send the pipeline records to whoever requested them.
        res.json(result.rows);

    } catch (error) {
        // Handle any database errors.
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 3. GET ALL DISTRIBUTION STATIONS
// ==========================================

// This route retrieves all water distribution stations.
router.get("/stations", async (req, res) => {
    try {
        // Retrieve stations and sort them by station ID.
        const result = await pool.query(
            "SELECT * FROM distribution_stations ORDER BY station_id"
        );

        // Return all station records as JSON.
        res.json(result.rows);

    } catch (error) {
        // Handle any database errors.
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 4. GET ALL CONSUMERS
// ==========================================

// This route retrieves all consumers receiving water.
router.get("/consumers", async (req, res) => {
    try {
        // Retrieve consumers and sort them by consumer ID.
        const result = await pool.query(
            "SELECT * FROM consumers ORDER BY consumer_id"
        );

        // Return all consumer records as JSON.
        res.json(result.rows);

    } catch (error) {
        // Handle any database errors.
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// EXPORT ROUTER
// ==========================================

// Export the router so server.js can use these endpoints.
module.exports = router;
