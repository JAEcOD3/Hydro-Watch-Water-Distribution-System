
// ==========================================
// WATER DISTRIBUTION GRAPH
// ==========================================

// Create a class to represent the water network.
class WaterGraph {

    // Initialize an empty graph.
    constructor() {
        // Store every location and its outgoing pipelines.
        this.adjacencyList = {};
    }

    // Add a location (reservoir or station) to the graph.
    addNode(node) {
        // Only create the node if it does not already exist.
        if (!this.adjacencyList[node]) {
            this.adjacencyList[node] = [];
        }
    }

    // Add a directed pipeline between two locations.
    addEdge(source, destination, capacity, pipelineId, isActive) {

        // Make sure both locations exist in the graph.
        this.addNode(source);
        this.addNode(destination);

        // Store the pipeline information under its starting location.
        this.adjacencyList[source].push({
            destination: destination,
            capacity: capacity,
            pipelineId: pipelineId,
            isActive: isActive
        });
    }

    // Display the complete graph in the terminal.
    displayGraph() {
        console.log("WATER DISTRIBUTION NETWORK");
        console.log(this.adjacencyList);
    }
}

// Export the class so other JavaScript files can use it.
module.exports = WaterGraph;
