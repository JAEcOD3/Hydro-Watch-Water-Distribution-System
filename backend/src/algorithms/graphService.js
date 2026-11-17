
// Import the PostgreSQL connection pool.
const pool = require("../config/db");

// Import our WaterGraph class.
const WaterGraph = require("./waterGraph");

// Build a graph using the data stored in PostgreSQL.
async function buildWaterGraph() {

    // Create a new, empty water network graph.
    const graph = new WaterGraph();

    // Retrieve all reservoirs from the database.
    const reservoirs = await pool.query(
        "SELECT * FROM reservoirs ORDER BY reservoir_id"
    );

    // Retrieve all distribution stations from the database.
    const stations = await pool.query(
        "SELECT * FROM distribution_stations ORDER BY station_id"
    );

    // Retrieve all pipelines from the database.
    const pipelines = await pool.query(
        "SELECT * FROM pipelines ORDER BY pipeline_id"
    );

    // Add each reservoir as a node in the graph.
    reservoirs.rows.forEach((reservoir) => {
        graph.addNode(`R${reservoir.reservoir_id}`);
    });

    // Add each distribution station as a node in the graph.
    stations.rows.forEach((station) => {
        graph.addNode(`S${station.station_id}`);
    });

    // Convert every database pipeline into a directed graph edge.
    pipelines.rows.forEach((pipeline) => {

        // Identify whether the pipeline starts at a reservoir or station.
        const source = pipeline.source_reservoir_id !== null
            ? `R${pipeline.source_reservoir_id}`
            : `S${pipeline.source_station_id}`;

        // Identify the destination distribution station.
        const destination = `S${pipeline.destination_station_id}`;

        // Add the pipeline and its properties to the graph.
        graph.addEdge(
            source,
            destination,
            pipeline.capacity,
            pipeline.pipeline_id,
            pipeline.is_active
        );
    });

    // Return the completed graph.
    return graph;
}

// Export the function so other files can build the graph.
module.exports = buildWaterGraph;
