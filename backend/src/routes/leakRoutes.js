// Import Express to create API routes.
const express = require("express");

// Create a router for leak detection endpoints.
const router = express.Router();

// Import our leak detection algorithm.
const detectLeak = require("../algorithms/leakDetection");

// Import the PostgreSQL connection pool.
const pool = require("../config/db");

// Create an endpoint to check a pipeline for possible leaks.
router.get("/leak-check/:pipelineId", async (req, res) => {
    try {
        // Get the pipeline ID from the URL.
        const pipelineId = req.params.pipelineId;

        // Retrieve the selected pipeline from PostgreSQL.
        const result = await pool.query(
            "SELECT * FROM pipelines WHERE pipeline_id = $1",
            [pipelineId]
        );

        // Check whether the pipeline exists.
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pipeline not found."
            });
        }

        // Store the pipeline information.
        const pipeline = result.rows[0];

        // Compare expected and actual water flow.
        // Compare expected normal flow against measured actual flow.
const possibleLeak = detectLeak(
    pipeline.expected_flow,
    pipeline.current_flow
);

        // Return the pipeline's leak status.
        res.json({
            pipelineId: pipeline.pipeline_id,
            // Display the expected normal flow from PostgreSQL.
expectedFlow: pipeline.expected_flow,
            actualFlow: pipeline.current_flow,
            possibleLeak: possibleLeak
        });

    } catch (error) {
        // Log errors and return a server error response.
        console.error("Leak detection error:", error.message);

        res.status(500).json({
            error: "Unable to check pipeline for leaks."
        });
    }
});

// Export the router for use in server.js.
module.exports = router;