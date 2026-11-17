
// ==========================================
// HYDROWATCH - INFRASTRUCTURE EVENT LOG
// Handles saving and retrieving system events.
// ==========================================

// Import the Express framework.
const express = require("express");

// Create an Express router.
const router = express.Router();

// Import the existing PostgreSQL connection pool.
const pool = require("../config/db");

// ==========================================
// GET ALL INFRASTRUCTURE EVENTS
// ==========================================

// Retrieve the latest infrastructure events.
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM infrastructure_events
            ORDER BY created_at DESC
            LIMIT 100
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error retrieving infrastructure events:", error);

        res.status(500).json({
            message: "Unable to retrieve infrastructure events."
        });
    }
});

// ==========================================
// SAVE A NEW INFRASTRUCTURE EVENT
// ==========================================

// Receive and save an event from the dashboard.
router.post("/", async (req, res) => {
    try {
        const {
            event_type,
            severity,
            component_type,
            component_id,
            message,
            details
        } = req.body;

        // Check that required event information exists.
        if (!event_type || !severity || !component_type || !message) {
            return res.status(400).json({
                message: "Missing required event information."
            });
        }

        // Insert the event into PostgreSQL.
        const result = await pool.query(
            `INSERT INTO infrastructure_events
            (event_type, severity, component_type, component_id, message, details)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                event_type,
                severity,
                component_type,
                component_id || null,
                message,
                details || {}
            ]
        );

        // Return the saved event.
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error saving infrastructure event:", error);

        res.status(500).json({
            message: "Unable to save infrastructure event."
        });
    }
});

// Export the router for the main server.
module.exports = router;

