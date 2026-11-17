// Import Express to create API routes.
const express = require("express");

// Create a router for pipeline capacity endpoints.
const router = express.Router();

// Import the pipeline capacity checking algorithm.
const checkCapacity = require("../algorithms/capacityChecker");

// Import the PostgreSQL connection pool.
const pool = require("../config/db");

// Create an endpoint to check a pipeline's capacity.
router.get("/capacity-check/:pipelineId", async (req, res) => {
    try {
        // Get the pipeline ID from the URL.
        const pipelineId = req.params.pipelineId;

        // Retrieve pipeline capacity and current flow from PostgreSQL.
        const result = await pool.query(
            `SELECT pipeline_id, capacity, current_flow, is_active
             FROM pipelines
             WHERE pipeline_id = $1`,
            [pipelineId]
        );

        // Check whether the pipeline exists.
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pipeline not found."
            });
        }

        // Store the selected pipeline information.
        const pipeline = result.rows[0];

        // Check whether current flow exceeds maximum capacity.
        const withinCapacity = checkCapacity(
            pipeline.current_flow,
            pipeline.capacity
        );

        // Return the capacity check results.
        res.json({
            pipelineId: pipeline.pipeline_id,
            maximumCapacity: pipeline.capacity,
            currentFlow: pipeline.current_flow,
            withinCapacity: withinCapacity
        });

    } catch (error) {
        // Log errors and return a server error response.
        console.error("Capacity check error:", error.message);

        res.status(500).json({
            error: "Unable to check pipeline capacity."
        });
    }
});

// Export the router for registration in server.js.
module.exports = router;