// ==========================================
// WATER PIPELINE FAILURE SIMULATOR
// ==========================================

// Import the recursive route-finding algorithm.
const findRoute = require("./routeFinder");

// Simulate a pipeline failure and check its impact.
function simulateFailure(graph, pipelineId, startNode, targetNode) {

    // Find the original route before the failure.
    const originalRoute = findRoute(
        graph,
        startNode,
        targetNode
    );

    // Create a separate copy of the graph so the original stays unchanged.
    const simulatedGraph = {
        adjacencyList: {}
    };

    // Copy every node and its pipeline connections.
    for (const node in graph.adjacencyList) {
        simulatedGraph.adjacencyList[node] =
            graph.adjacencyList[node].map((pipeline) => {

                // Copy each pipeline's information.
                return {
                    ...pipeline,

                    // Deactivate only the pipeline being tested.
                    isActive: pipeline.pipelineId === pipelineId
                        ? false
                        : pipeline.isActive
                };
            });
    }

    // Find a route after simulating the pipeline failure.
    const alternativeRoute = findRoute(
        simulatedGraph,
        startNode,
        targetNode
    );

    // Return the results of the failure simulation.
    return {
        failedPipeline: pipelineId,
        originalRoute: originalRoute,
        alternativeRoute: alternativeRoute,
        alternativeRouteAvailable: alternativeRoute !== null
    };
}

// Export the simulator for use in other files.
module.exports = simulateFailure;