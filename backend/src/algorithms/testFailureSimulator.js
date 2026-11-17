// Import the water graph class.
const WaterGraph = require("./waterGraph");

// Import the failure simulation algorithm.
const simulateFailure = require("./failureSimulator");

// Create a sample water network.
const graph = new WaterGraph();


// Add Pipeline 2: Reservoir 1 to Station 2.
graph.addEdge("R1", "S2", 20000, 2, true);

// Add Pipeline 1: Reservoir 1 to Station 1.
graph.addEdge("R1", "S1", 30000, 1, true);

// Add Pipeline 4: Station 1 to Station 2.
graph.addEdge("S1", "S2", 10000, 4, true);

// Simulate the failure of Pipeline 2.
const result = simulateFailure(graph, 2, "R1", "S2");

// Display the simulation results.
console.log("FAILURE SIMULATION RESULTS");
console.log("Failed pipeline:", result.failedPipeline);
console.log("Original route:", result.originalRoute);
console.log("Alternative route:", result.alternativeRoute);
console.log("Alternative route available:", result.alternativeRouteAvailable);