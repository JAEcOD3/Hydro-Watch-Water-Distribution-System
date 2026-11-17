
// Import Express to create API routes.
const express = require("express");

// Create a router for route-finding endpoints.
const router = express.Router();

// Import the function that builds our water network graph.
const buildWaterGraph = require("../algorithms/graphService");

// Import our recursive route-finding algorithm.
const findRoute = require("../algorithms/routeFinder");
// Import the algorithm that simulates a pipeline failure.
const simulateFailure = require("../algorithms/failureSimulator");

// Create an endpoint for finding a route between two locations.
router.get("/route/:start/:destination", async (req, res) => {
    try {
        // Read the starting and destination locations from the URL.
        const { start, destination } = req.params;

        // Build the latest graph using PostgreSQL data.
        const graph = await buildWaterGraph();

        // Search for an available route.
        const route = findRoute(graph, start, destination);

        // Return a helpful response if no route exists.
        if (route === null) {
            return res.status(404).json({
                message: "No available route found."
            });
        }

        // Return the route when one is found.
        res.json({
            start: start,
            destination: destination,
            route: route
        });

    } catch (error) {
        // Log errors and return a server error response.
        console.error("Route finding error:", error.message);

        res.status(500).json({
            error: "Unable to find a route."
        });
    }
});
// Create an endpoint for simulating a pipeline failure.
router.post("/simulate-failure", async (req, res) => {
    try {
        // Read the selected pipeline and route locations from the request.
        const { pipelineId, startNode, targetNode } = req.body;

        // Check that all required information was provided.
        if (
            pipelineId === undefined ||
            !startNode ||
            !targetNode
        ) {
            return res.status(400).json({
                error: "Pipeline ID, starting node, and target node are required."
            });
        }

        // Build the latest water network graph from PostgreSQL.
        const graph = await buildWaterGraph();

        // Run the failure simulation without changing the real database.
        const result = simulateFailure(
            graph,
            Number(pipelineId),
            startNode,
            targetNode
        );

        // Send the simulation results back to the frontend.
        res.json(result);

    } catch (error) {
        // Log the error to help with debugging.
        console.error("Failure simulation error:", error.message);

        // Return an error response.
        res.status(500).json({
            error: "Unable to simulate pipeline failure."
        });
    }
});
// Export the router for registration in server.js.
module.exports = router;
