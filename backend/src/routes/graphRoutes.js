
// Import Express to create API routes.
const express = require("express");

// Create a router for graph-related endpoints.
const router = express.Router();

// Import the function that builds our water network graph.
const buildWaterGraph = require("../algorithms/graphService");

// Create an endpoint to retrieve the complete water network graph.
router.get("/graph", async (req, res) => {
    try {
        // Build the graph using data from PostgreSQL.
        const graph = await buildWaterGraph();

        // Return the graph as JSON.
        res.json(graph.adjacencyList);

    } catch (error) {
        // Log the error and send a server error response.
        console.error("Graph creation error:", error.message);

        res.status(500).json({
            error: "Unable to build the water distribution graph."
        });
    }
});

// Export the router so server.js can register it.
module.exports = router;
