
const express = require("express");
// Import path to locate the frontend folder.
const path = require("path");
const cors = require("cors");
const pool = require("./config/db");
// Import the routes that retrieve water-system data.
const dataRoutes = require("./routes/dataRoutes");
// Import routes for the water network graph.
const graphRoutes = require("./routes/graphRoutes");
// Import routes for recursive water network routing.
const routeRoutes = require("./routes/routeRoutes");
// Import water supply and demand calculation routes.
const waterRoutes = require("./routes/waterRoutes");
// Import pipeline leak detection API routes.
const leakRoutes = require("./routes/leakRoutes");
// Import pipeline capacity checking API routes.
const capacityRoutes = require("./routes/capacityRoutes");
// Import infrastructure event logging API routes.
const infrastructureEventsRoutes = require("./routes/infastructureEvents");
// Import the network equipment API routes.
const networkEquipmentRoutes = require("./routes/networkEquipment");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve the frontend HTML, CSS, and JavaScript files.
app.use(express.static(path.join(__dirname, "../../frontend")));
// Register the water-system API routes.
// All routes will begin with /api.
app.use("/api", dataRoutes);
// Register the water network graph API routes.
app.use("/api", graphRoutes);
// Register the recursive route-finding API.
app.use("/api", routeRoutes);
// Register water supply and demand API routes.
app.use("/api", waterRoutes);
// Register pipeline leak detection API routes.
app.use("/api", leakRoutes);
// Register pipeline capacity checking API routes.
app.use("/api", capacityRoutes);
// Register infrastructure event logging API routes.
app.use("/api/infrastructure-events", infrastructureEventsRoutes);
// Register the network equipment API endpoint.
app.use("/api/network-equipment", networkEquipmentRoutes);





// Welcome route
app.get("/", (req, res) => {
    res.json({
        message: "Intelligent Water Distribution System API is running!"
    });
});

// Test PostgreSQL connection
app.get("/api/database-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "PostgreSQL connected successfully!",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
