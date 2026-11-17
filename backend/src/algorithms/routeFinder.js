
// ==========================================
// RECURSIVE SHORTEST ROUTE FINDER
// ==========================================

// Find the shortest available route between two locations.
function findRoute(graph, currentNode, targetNode, visited = []) {

    // If we reached the destination, return the completed route.
    if (currentNode === targetNode) {
        return [...visited, currentNode];
    }

    // Add the current location to the visited list.
    const updatedVisited = [...visited, currentNode];

    // Get all outgoing pipelines from the current location.
    const pipelines = graph.adjacencyList[currentNode] || [];

    // Store every valid route discovered from this location.
    const possibleRoutes = [];

    // Examine each outgoing pipeline.
    for (const pipeline of pipelines) {

        // Skip pipelines that are inactive.
        if (!pipeline.isActive) {
            continue;
        }

        // Skip locations that have already been visited.
        if (updatedVisited.includes(pipeline.destination)) {
            continue;
        }

        // Recursively search from the next location.
        const route = findRoute(
            graph,
            pipeline.destination,
            targetNode,
            updatedVisited
        );

        // Save the route if the destination was found.
        if (route !== null) {
            possibleRoutes.push(route);
        }
    }

    // Return null if no valid route was discovered.
    if (possibleRoutes.length === 0) {
        return null;
    }

    // Sort routes by number of connections, shortest first.
    possibleRoutes.sort((a, b) => a.length - b.length);

    // Return the shortest available route.
    return possibleRoutes[0];
}

// Export the function for use in other files.
module.exports = findRoute;
