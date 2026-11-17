// ==========================================
// HYDROWATCH - NETWORK EQUIPMENT ROUTES
// Handles pumps, gate valves, and check valves.
// ==========================================

// Import Express to create API routes.
const express = require("express");

// Create a router for equipment-related requests.
const router = express.Router();

// Import the existing PostgreSQL database connection.
const pool = require("../config/db");

// ==========================================
// GET ALL NETWORK EQUIPMENT
// ==========================================

// Retrieve all pumps, gate valves, and check valves.
router.get("/", async (req, res) => {
    try {
        // Request all equipment records from PostgreSQL.
        const result = await pool.query(`
            SELECT *
            FROM network_equipment
            ORDER BY equipment_id ASC
        `);

        // Return the equipment records as JSON.
        res.json(result.rows);

    } catch (error) {
        // Display the error in the backend terminal.
        console.error("Error retrieving network equipment:", error);

        // Send an error response to the frontend.
        res.status(500).json({
            message: "Unable to retrieve network equipment."
        });
    }
});

// Export the router so server.js can use it.
module.exports = router;