
// ==========================================
// HYDROWATCH - FRONTEND DASHBOARD
// Connects the dashboard to the existing Express API.
// ==========================================

// Set the address of the existing backend.
const API_URL = "http://localhost:5000/api";

// Store the water network data retrieved from the backend.
let reservoirs = [];
let pipelines = [];
let stations = [];
let consumers = [];
// Store pumps, gate valves, and check valves from the database.
let networkEquipment = [];
// Store the latest pipeline failure simulation results.
let failureSimulation = null;
// Track the current pipeline repair process.
let repairStatus = "normal";

// Track whether alternative routes are currently displayed.
let showAlternativeRoutes = false;

// Restore the backup route state when returning to the dashboard.
let backupPumpActive =
    localStorage.getItem("backupPumpActive") === "true";

    // Keep the alternative route visible if the backup pump is active.
showAlternativeRoutes = backupPumpActive;


// Restore the saved failure simulation when returning from the engineer page.
const savedFailure = localStorage.getItem("savedFailureSimulation");

// Recreate the previous failure information if it exists.
if (savedFailure) {
    failureSimulation = JSON.parse(savedFailure);
    repairStatus = "failed";
}


// Check whether the engineer approved the currently failed pipeline.
function checkEngineerApproval() {

    // Retrieve the pipeline currently awaiting repair.
    const failedPipelineId = failureSimulation?.failedPipeline;

    // Retrieve the pipeline ID approved by the engineer.
    const approvedPipelineId = localStorage.getItem(
        "maintenanceCompletePipelineId"
    );

    // Confirm that the approval belongs to the current failed pipeline.
    const isApproved = failedPipelineId &&
        approvedPipelineId === String(failedPipelineId);

    // Unlock the FIX button only when the engineer approved this pipeline.
    document.getElementById("fix-button").disabled = !isApproved;

    // Add a cyan glow when engineer approval unlocks the FIX button.
const fixButton = document.getElementById("fix-button");

if (isApproved) {
    fixButton.classList.add("fix-ready");
} else {
    fixButton.classList.remove("fix-ready");
}

    // Update the repair status when approval is valid.
    if (isApproved) {
        repairStatus = "repair-complete";

        document.getElementById("failure-diagnosis").textContent =
            "Engineer approval received. Pipeline ready for restoration.";
    }
}

// Pass the failed pipeline number to the engineer maintenance page.
document.querySelector(".engineer-link").addEventListener("click", () => {

    // Save the failed pipeline ID before opening the engineer page.
    if (failureSimulation?.failedPipeline) {
        localStorage.setItem(
            "failedPipelineId",
            String(failureSimulation.failedPipeline)
        );
    }

});

/// Define the positions of the water source, reservoirs, and stations.
const nodePositions = {
    W1: { x: 75, y: 220 },   // Main Water Treatment Plant
    R1: { x: 300, y: 110 },  // North Reservoir
    R2: { x: 300, y: 335 },  // South Reservoir
    S1: { x: 550, y: 110 },  // Central Station
    S2: { x: 800, y: 110 },  // East Station
    S3: { x: 550, y: 335 }   // West Station
};

// ==========================================
// 1. RETRIEVE DATA FROM THE BACKEND
// ==========================================

// Request JSON data from an existing API endpoint.
async function getAPIData(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);

    // Stop if the backend returns an error.
    if (!response.ok) {
        throw new Error(`API request failed: ${endpoint}`);
    }

    // Convert the response into JavaScript data.
    return await response.json();
}

// Retrieve all the information needed by the dashboard.
// Load all dashboard information from the backend.
async function loadDashboardData() {
    try {
        // Request all five datasets from the existing backend.
        const results = await Promise.all([
            getAPIData("/reservoirs"),
            getAPIData("/pipelines"),
            getAPIData("/stations"),
            getAPIData("/consumers"),
            getAPIData("/network-equipment")
        ]);

        // Store the returned information.
        reservoirs = results[0];
        pipelines = results[1];
        stations = results[2];
        consumers = results[3];
        networkEquipment = results[4];

        // Update the dashboard after data has loaded.
        updateStatistics();
        displayStations();
        displayPipelines();
        populatePipelineSelector();
        drawWaterNetwork();

    } catch (error) {
        // Show an error if the backend cannot be reached.
        console.error("Dashboard loading error:", error);

        document.getElementById("station-list").textContent =
            "Could not load station data. Check that the backend is running.";

        document.getElementById("pipeline-list").textContent =
            "Could not load pipeline data. Check that the backend is running.";
    }
}

// Check whether the engineer approved the failed pipeline.
checkEngineerApproval();
// ==========================================
// 2. UPDATE DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {
    // Display the number of reservoirs, pipelines, and stations.
    document.getElementById("reservoir-count").textContent =
        reservoirs.length;

    document.getElementById("pipeline-count").textContent =
        pipelines.length;

    document.getElementById("station-count").textContent =
        stations.length;

    // Count pipelines that may have leaks.
    const possibleLeaks = pipelines.filter(pipeline => {
        return Number(pipeline.current_flow) <
               Number(pipeline.expected_flow);
    });

    document.getElementById("leak-count").textContent =
        possibleLeaks.length;
}

// ==========================================
// 3. DISPLAY DISTRIBUTION STATIONS
// ==========================================

function displayStations() {
    const stationList = document.getElementById("station-list");

    // Clear the loading message.
    stationList.innerHTML = "";

    stations.forEach(station => {
        // Calculate how much water the station is missing.
        const shortage = Math.max(
            0,
            Number(station.demand) - Number(station.current_supply)
        );

        // Create a display row for this station.
        const row = document.createElement("div");
        row.className = "data-row";

        row.innerHTML = `
            <div>
                <strong>${station.name}</strong>
                <small>
                    Supply: ${Number(station.current_supply).toLocaleString()}
                    / ${Number(station.demand).toLocaleString()}
                </small>
                <small>
                    Shortage: ${shortage.toLocaleString()}
                </small>
            </div>

            <span class="data-status">
                ${shortage === 0 ? "SUFFICIENT" : "LOW SUPPLY"}
            </span>
        `;

        stationList.appendChild(row);
    });
}


// ==========================================
// 4. DISPLAY PIPELINE INFORMATION
// ==========================================

function displayPipelines() {
    const pipelineList = document.getElementById("pipeline-list");

    // Clear the previous pipeline information.
    pipelineList.innerHTML = "";

    pipelines.forEach(pipeline => {

        // Determine whether this pipeline is within its capacity.
        const withinCapacity =
            Number(pipeline.current_flow) <= Number(pipeline.capacity);

        // Determine whether the pipeline is active.
        const active = pipeline.is_active === true;

        // Check whether this pipeline failed in the latest simulation.
        const isFailed = failureSimulation &&
            Number(failureSimulation.failedPipeline) ===
            Number(pipeline.pipeline_id);

        // Determine the pipeline's displayed status.
        const status = isFailed
            ? "FAILED"
            : !active
                ? "INACTIVE"
                : withinCapacity
                    ? "NORMAL"
                    : "OVER CAPACITY";

        // Select a status color.
        const statusColor = isFailed
            ? "#ff334f"
            : !active || !withinCapacity
                ? "#ff5c75"
                : "#42e6a4";

        // Create a row for the pipeline.
        const row = document.createElement("div");
        row.className = "data-row";

        // Display the pipeline information and status.
        row.innerHTML = `
            <div>
                <strong>Pipeline ${pipeline.pipeline_id}</strong>
                <small>
                    Flow: ${Number(pipeline.current_flow).toLocaleString()}
                    / ${Number(pipeline.capacity).toLocaleString()}
                </small>
            </div>

            <span class="data-status"
                  style="color: ${statusColor}">
                ${status}
            </span>
        `;

        pipelineList.appendChild(row);
    });
}


// ==========================================
// 5. DRAW THE SVG WATER NETWORK
// ==========================================

function drawWaterNetwork() {
    const svg = document.getElementById("water-network");

    // Clear any previous network drawing.
    svg.innerHTML = "";

    // Define the SVG namespace required to create SVG elements.
    const svgNS = "http://www.w3.org/2000/svg";

    // Create a reusable SVG element.
    function createSVGElement(tag, attributes) {
        const element = document.createElementNS(svgNS, tag);

        // Apply each supplied SVG attribute.
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;
    }

    // Convert a database pipeline into its source node name.
   // Identify which network component supplies water to this pipeline.
function getSourceNode(pipeline) {

    // Check whether the pipeline starts at the water treatment plant.
    if (pipeline.source_water_source_id !== null &&
        pipeline.source_water_source_id !== undefined) {
        return `W${pipeline.source_water_source_id}`;
    }

    // Check whether the pipeline starts at a reservoir.
    if (pipeline.source_reservoir_id !== null &&
        pipeline.source_reservoir_id !== undefined) {
        return `R${pipeline.source_reservoir_id}`;
    }

    // Otherwise, the pipeline starts at another distribution station.
    if (pipeline.source_station_id !== null &&
        pipeline.source_station_id !== undefined) {
        return `S${pipeline.source_station_id}`;
    }

    return null;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////

    // Draw each pipeline before drawing the network nodes.
    pipelines.forEach(pipeline => {

        // Identify the pipeline's starting and ending locations.
        const source = getSourceNode(pipeline);
       // Identify whether the pipeline delivers water to a reservoir or station.
const destination = pipeline.destination_reservoir_id !== null &&
    pipeline.destination_reservoir_id !== undefined
    ? `R${pipeline.destination_reservoir_id}`
    : `S${pipeline.destination_station_id}`;

        // Get the coordinates of both locations.
        const start = nodePositions[source];
        const end = nodePositions[destination];

        // Skip pipelines with missing locations.
        if (!start || !end) return;

        // Identify whether this pipeline has failed.
        const isFailed = failureSimulation &&
            Number(failureSimulation.failedPipeline) ===
            Number(pipeline.pipeline_id);

        // Get the alternative route from the latest simulation.
        const alternativeRoute = failureSimulation?.alternativeRoute || [];

       // Highlight alternative routes only when the user requests them.
const isAlternative = showAlternativeRoutes &&
    !isFailed &&
    alternativeRoute.some(
        (node, index) =>
            node === source &&
            alternativeRoute[index + 1] === destination
    );

       
        // Give overlapping pipelines separate curved paths.
        const pipelineId = Number(pipeline.pipeline_id);

        // Define individual curve positions for overlapping pipelines.
        const curveControlPoints = {
            2: { x: 250, y: 15 },
            4: { x: 610, y: 70 },
            6: { x: 390, y: 222 },
            7: { x: 635, y: 270 },
            9: { x: 510, y: 222 },
            10: { x: 610, y: 150 },
            11: { x: 585, y: 175 }
        };

        // Check whether this pipeline needs a curved path.
        const isCurved = Boolean(curveControlPoints[pipelineId]);

        // Get the control point for the selected pipeline.
        const controlPoint = curveControlPoints[pipelineId];

        // Draw the curved pipeline while preserving its direction.
        const curvedPath = isCurved
            ? pipelineId === 2
                ? `M ${start.x} ${start.y} C 250 15, 635 15, ${end.x} ${end.y}`
                : `M ${start.x} ${start.y} Q ${controlPoint.x} ${controlPoint.y}, ${end.x} ${end.y}`
            : null;


        // Choose a color based on the simulation result.
        const pipeColor = isFailed
            ? "#ff334f"
            : isAlternative
                ? "#00f5ff"
                : pipeline.is_active ? "#1678aa" : "#ff5c75";

        // Draw the main pipeline.
        const pipe = createSVGElement(
            isCurved ? "path" : "line",
            isCurved
                ? {
                    d: curvedPath,
                    fill: "none",
                    stroke: pipeColor,
                    "stroke-width": isAlternative ? "13" : "9",
                    "stroke-linecap": "round",
                    opacity: isFailed || isAlternative ? "1" : "0.65"
                }
                : {
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y,
                    stroke: pipeColor,
                    "stroke-width": isAlternative ? "13" : "9",
                    "stroke-linecap": "round",
                    opacity: isFailed || isAlternative ? "1" : "0.65"
                }
        );

        svg.appendChild(pipe);

        // Check whether the pipeline currently has water flowing.
const hasWaterFlow = Number(pipeline.current_flow) > 0;

// Animate flowing pipelines and activated backup routes.
const shouldAnimateWater =
    pipeline.is_active &&
    !isFailed &&
    (hasWaterFlow || isAlternative);

if (shouldAnimateWater) {

    // Create the animated water line or curve.
    const water = createSVGElement(
        isCurved ? "path" : "line",
        isCurved
            ? {
                d: curvedPath,
                fill: "none",
                class: isAlternative
                    ? "backup-water-flow"
                    : "water-flow"
            }
            : {
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y,
                fill: "none",
                class: isAlternative
                    ? "backup-water-flow"
                    : "water-flow"
            }
    );

    // Add the animated water to the network.
    svg.appendChild(water);
}

        
       // Calculate the default label position.
let middleX = (start.x + end.x) / 2;
let middleY = (start.y + end.y) / 2;

// Move Pipeline 5's label away from Pipeline 8.
if (pipelineId === 5) {
    middleX -= 35;
    middleY -= 20;
}

// Move Pipeline 8's label away from Pipeline 5.
if (pipelineId === 8) {
    middleX += 35;
    middleY += 20;
}

// Position labels on curved pipelines using their curve midpoint.
if (isCurved && pipelineId !== 2) {
    middleX = 0.25 * start.x + 0.5 * controlPoint.x + 0.25 * end.x;
    middleY = 0.25 * start.y + 0.5 * controlPoint.y + 0.25 * end.y;
}

// Keep Pipeline 2's label above its curved path.
if (pipelineId === 2) {
    middleY = 43;
}


        // Create the pipeline identification label.
        const label = createSVGElement("text", {
            x: middleX,
            y: middleY - 13,
            fill: isFailed ? "#ff334f" : isAlternative ? "#00f5ff" : "#a9cde5",
            "font-size": "12",
            "text-anchor": "middle"
        });

        // Display the pipeline number.
        label.textContent = `P${pipeline.pipeline_id}`;
        svg.appendChild(label);
    });





    // ==========================================
// DRAW THE MAIN DISTRIBUTION PUMP
// ==========================================

// Set the pump's position between the treatment plant and reservoirs.
const pumpPosition = {
    x: 190,
    y: 220
};

// Find the Main Distribution Pump record from PostgreSQL.
const mainPumpEquipment = networkEquipment.find(
    equipment => Number(equipment.equipment_id) === 1
);

// Draw the circular pump housing.
const pumpCircle = createSVGElement("circle", {
    cx: pumpPosition.x,
    cy: pumpPosition.y,
    r: 17,
    fill: "#10283e",
// Gold means operational; red means the pump needs attention.
stroke: mainPumpEquipment?.status === "OPERATIONAL"
    ? "#f5c66b"
    : "#ff6b6b",
    "stroke-width": "3"
});

svg.appendChild(pumpCircle);

/// Draw a triangle representing the pump's water-flow direction.
const pumpSymbol = createSVGElement("path", {
    // Keep the SVG path on one line to avoid formatting issues.
    d: `M ${pumpPosition.x - 6} ${pumpPosition.y - 9} L ${pumpPosition.x + 9} ${pumpPosition.y} L ${pumpPosition.x - 6} ${pumpPosition.y + 9} Z`,
    fill: "#f5c66b"
});

svg.appendChild(pumpSymbol);

// Label the main distribution pump.
const pumpLabel = createSVGElement("text", {
    x: pumpPosition.x,
    y: pumpPosition.y + 34,
    fill: "#f5c66b",
    "font-size": "10",
    "text-anchor": "middle"
});

pumpLabel.textContent = "MAIN PUMP";
svg.appendChild(pumpLabel); 



// ==========================================
// DRAW THE NORTH SUPPLY GATE VALVE
// ==========================================

// Set the gate valve's position on the pipe leading to North Reservoir.
const northGatePosition = {
    x: 245,
    y: 155
};

// Find the North Gate Valve record from PostgreSQL.
const northGateEquipment = networkEquipment.find(
    equipment => Number(equipment.equipment_id) === 3
);

// Draw the gate valve as a diamond.
const northGateValve = createSVGElement("path", {
    d: `M ${northGatePosition.x} ${northGatePosition.y - 9}
        L ${northGatePosition.x + 9} ${northGatePosition.y}
        L ${northGatePosition.x} ${northGatePosition.y + 9}
        L ${northGatePosition.x - 9} ${northGatePosition.y} Z`,

    // Red means closed; gold means open.
    fill: northGateEquipment?.position === "CLOSED"
        ? "#ff6b6b"
        : "#f5c66b",

    stroke: "#ffffff",
    "stroke-width": "1.5"
});

svg.appendChild(northGateValve);

// Label the gate valve.
const northGateLabel = createSVGElement("text", {
    x: northGatePosition.x,
    y: northGatePosition.y - 15,
    fill: "#f5c66b",
    "font-size": "9",
    "text-anchor": "middle"
});

northGateLabel.textContent = "GATE";
svg.appendChild(northGateLabel);

// ==========================================
// DRAW THE SOUTH SUPPLY GATE VALVE
// ==========================================

// Set the gate valve's position on the pipe leading to South Reservoir.
const southGatePosition = {
    x: 245,
    y: 290
};


// Find the South Gate Valve record from PostgreSQL.
const southGateEquipment = networkEquipment.find(
    equipment => Number(equipment.equipment_id) === 5
);


// Draw the gate valve as a diamond.
const southGateValve = createSVGElement("path", {
    d: `M ${southGatePosition.x} ${southGatePosition.y - 9}
        L ${southGatePosition.x + 9} ${southGatePosition.y}
        L ${southGatePosition.x} ${southGatePosition.y + 9}
        L ${southGatePosition.x - 9} ${southGatePosition.y} Z`,

    // Red means closed; gold means open.
    fill: southGateEquipment?.position === "CLOSED"
        ? "#ff6b6b"
        : "#f5c66b",

    stroke: "#ffffff",
    "stroke-width": "1.5"
});

svg.appendChild(southGateValve);

// Label the gate valve.
const southGateLabel = createSVGElement("text", {
    x: southGatePosition.x,
    y: southGatePosition.y - 15,
    fill: "#f5c66b",
    "font-size": "9",
    "text-anchor": "middle"
});

southGateLabel.textContent = "GATE";
svg.appendChild(southGateLabel);
// ==========================================
// DRAW THE NORTH SUPPLY CHECK VALVE
// ==========================================

// Position the check valve on the North Reservoir supply pipe.
const northCheckPosition = {
    x: 145,
    y: 186
};

// Find the North Check Valve record from PostgreSQL.
const northCheckEquipment = networkEquipment.find(
    equipment => Number(equipment.equipment_id) === 4
);

// Draw a triangle showing the permitted water-flow direction.
const northCheckValve = createSVGElement("path", {
    d: `M ${northCheckPosition.x - 7} ${northCheckPosition.y - 8}
        L ${northCheckPosition.x + 7} ${northCheckPosition.y}
        L ${northCheckPosition.x - 7} ${northCheckPosition.y + 8} Z`,

    // Blue means operational; red means attention is needed.
    fill: northCheckEquipment?.status === "OPERATIONAL"
        ? "#54d6ff"
        : "#ff6b6b",

    stroke: "#ffffff",
    "stroke-width": "1.5"
});

svg.appendChild(northCheckValve);

// Add a label for the check valve.
const northCheckLabel = createSVGElement("text", {
    x: northCheckPosition.x,
    y: northCheckPosition.y - 13,
    fill: "#54d6ff",
    "font-size": "8",
    "text-anchor": "middle"
});

northCheckLabel.textContent = "CHECK";
svg.appendChild(northCheckLabel);
// ==========================================
// DRAW THE SOUTH SUPPLY CHECK VALVE
// ==========================================

// Position the check valve on the South Reservoir supply pipe.
const southCheckPosition = {
    x: 145,
    y: 254
};

// Find the South Check Valve record from PostgreSQL.
const southCheckEquipment = networkEquipment.find(
    equipment => Number(equipment.equipment_id) === 6
);

// Draw a triangle showing the permitted water-flow direction.
const southCheckValve = createSVGElement("path", {
    d: `M ${southCheckPosition.x - 7} ${southCheckPosition.y - 8}
        L ${southCheckPosition.x + 7} ${southCheckPosition.y}
        L ${southCheckPosition.x - 7} ${southCheckPosition.y + 8} Z`,

    // Blue means operational; red means attention is needed.
    fill: southCheckEquipment?.status === "OPERATIONAL"
        ? "#54d6ff"
        : "#ff6b6b",

    stroke: "#ffffff",
    "stroke-width": "1.5"
});

svg.appendChild(southCheckValve);

// Add a label for the check valve.
const southCheckLabel = createSVGElement("text", {
    x: southCheckPosition.x,
    y: southCheckPosition.y - 13,
    fill: "#54d6ff",
    "font-size": "8",
    "text-anchor": "middle"
});

southCheckLabel.textContent = "CHECK";
svg.appendChild(southCheckLabel);



    // Draw the main water treatment plant.
drawNode(
    "W1",
    "Main Water Treatment Plant",
    "#f5c66b",
    "WATER SOURCE"
);



    // Draw reservoir nodes.
    reservoirs.forEach(reservoir => {
        drawNode(
            `R${reservoir.reservoir_id}`,
            reservoir.name,
            "#20bfff",
            "RESERVOIR"
        );
    });

    // Draw distribution station nodes.
    stations.forEach(station => {
        drawNode(
            `S${station.station_id}`,
            station.name,
            "#42e6a4",
            "STATION"
        );
    });

    // Create and draw one network node.
    function drawNode(id, name, color, type) {
        const position = nodePositions[id];

// Skip the node if its position is not defined.
if (!position) return;

        // Draw a special treatment plant symbol instead of a regular circle.
if (id === "W1") {

    // Create the outer treatment plant building.
    const plant = createSVGElement("rect", {
        x: position.x - 28,
        y: position.y - 25,
        width: 56,
        height: 50,
        rx: 8,
        fill: "#10283e",
        stroke: color,
        "stroke-width": "3"
    });

    svg.appendChild(plant);

    // Add a water droplet symbol inside the plant.
    const waterDrop = createSVGElement("path", {
        d: `M ${position.x} ${position.y - 16}
            C ${position.x - 15} ${position.y + 2},
              ${position.x - 10} ${position.y + 14},
              ${position.x} ${position.y + 14}
            C ${position.x + 10} ${position.y + 14},
              ${position.x + 15} ${position.y + 2},
              ${position.x} ${position.y - 16} Z`,
        fill: color
    });

    svg.appendChild(waterDrop);

    // Display the treatment plant name below its symbol.
    const plantLabel = createSVGElement("text", {
        x: position.x,
        y: position.y + 43,
        fill: "#d9eaff",
        "font-size": "11",
        "text-anchor": "middle"
    });

    plantLabel.textContent = name;
    svg.appendChild(plantLabel);

    // Display the water source identification above the symbol.
    const plantType = createSVGElement("text", {
        x: position.x,
        y: position.y - 40,
        fill: color,
        "font-size": "9",
        "font-weight": "bold",
        "text-anchor": "middle"
    });

    plantType.textContent = type;
    svg.appendChild(plantType);

    // Stop here so the treatment plant is not drawn as a circle.
    return;
}


        // Create the glowing outer circle.
        const outer = createSVGElement("circle", {
            cx: position.x,
            cy: position.y,
            r: "34",
            fill: color,
            opacity: "0.13"
        });

        svg.appendChild(outer);

        // Create the main node circle.
        const circle = createSVGElement("circle", {
            cx: position.x,
            cy: position.y,
            r: "25",
            fill: "#10283e",
            stroke: color,
            "stroke-width": "2.5"
        });

        svg.appendChild(circle);

        // Add the node ID inside the circle.
        const idLabel = createSVGElement("text", {
            x: position.x,
            y: position.y + 5,
            fill: "#ffffff",
            "font-size": "15",
            "font-weight": "bold",
            "text-anchor": "middle"
        });

        idLabel.textContent = id;
        svg.appendChild(idLabel);

        // Add the node's full name below the circle.
        const nameLabel = createSVGElement("text", {
            x: position.x,
            y: position.y + 48,
            fill: "#d9eaff",
            "font-size": "11",
            "text-anchor": "middle"
        });

        nameLabel.textContent = name;
        svg.appendChild(nameLabel);

        // Add the node type above the circle.
        const typeLabel = createSVGElement("text", {
            x: position.x,
            y: position.y - 43,
            fill: color,
            "font-size": "9",
            "font-weight": "bold",
            "text-anchor": "middle",
            "letter-spacing": "1"
        });

        typeLabel.textContent = type;
        svg.appendChild(typeLabel);
    }
}

// ==========================================
// 6. POPULATE FAILURE SIMULATION SELECTOR
// ==========================================

function populatePipelineSelector() {
    const selector = document.getElementById("pipeline-select");

    // Clear the loading option.
    selector.innerHTML = "";

    pipelines.forEach(pipeline => {
        // Add one selectable option for each pipeline.
        const option = document.createElement("option");

        option.value = pipeline.pipeline_id;
        option.textContent = `Pipeline ${pipeline.pipeline_id}`;

        selector.appendChild(option);
    });
}

// ==========================================
// 7. RUN PIPELINE FAILURE SIMULATION
// ==========================================



// ==========================================
// HYDROWATCH - INFRASTRUCTURE EVENT LOGGER
// Sends system events to the PostgreSQL database.
// ==========================================

async function logInfrastructureEvent(
    eventType,
    severity,
    componentType,
    componentId,
    message,
    details = {}
) {
    try {
        // Send the event to the infrastructure logging API.
        const response = await fetch(
            `${API_URL}/infrastructure-events`,
            {
                method: "POST",

                // Tell Express that the request contains JSON.
                headers: {
                    "Content-Type": "application/json"
                },

                // Package the event information.
                body: JSON.stringify({
                    event_type: eventType,
                    severity: severity,
                    component_type: componentType,
                    component_id: componentId,
                    message: message,
                    details: details
                })
            }
        );

        // Check whether PostgreSQL saved the event.
        if (!response.ok) {
            throw new Error("Could not save infrastructure event.");
        }

        // Return the saved event.
        return await response.json();

    } catch (error) {
        // Report logging errors without stopping the dashboard.
        console.error("Infrastructure logging error:", error);

        return null;
    }
}


// ==========================================
// HYDROWATCH - LOAD INFRASTRUCTURE EVENTS
// Retrieves saved events from PostgreSQL.
// ==========================================

async function loadInfrastructureEvents() {

    // Find the activity log area on the dashboard.
    const eventList = document.getElementById(
        "infrastructure-event-list"
    );

    // Stop if the activity log does not exist.
    if (!eventList) return;

    try {

        // Request the latest saved events from the backend.
        const response = await fetch(
            `${API_URL}/infrastructure-events`
        );

        // Check whether the backend returned successfully.
        if (!response.ok) {
            throw new Error("Could not load infrastructure events.");
        }

        // Convert the response into JavaScript data.
        const events = await response.json();

        // Clear the previous events before displaying new ones.
        eventList.replaceChildren();

        // Display a message if there are no saved events.
        if (events.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "No infrastructure events recorded yet.";

            eventList.appendChild(emptyMessage);
            return;
        }

        // Display each saved event.
        events.forEach(event => {

            // Create the event row.
            const row = document.createElement("div");
            row.className = "data-row";

            // Create the event information container.
            const information = document.createElement("div");

            // Create the component heading.
            const heading = document.createElement("strong");

            // Format the component name.
            const componentName =
                event.component_type === "PIPELINE"
                    ? `Pipeline P${event.component_id}`
                    : event.component_id
                        ? `${event.component_type} ${event.component_id}`
                        : event.component_type;

            heading.textContent = componentName;

            // Create the event description.
            const message = document.createElement("small");
            message.textContent = event.message;

            // Create the event timestamp.
            const timestamp = document.createElement("small");
            timestamp.textContent = new Date(
                event.created_at
            ).toLocaleString();

            // Create the event severity label.
            const severity = document.createElement("span");
            severity.className =
                `event-severity ${String(event.severity).toLowerCase()}`;
            severity.textContent = event.severity;

            // Assemble the event information.
            information.append(
                heading,
                message,
                timestamp
            );

            // Assemble the complete event row.
            row.append(information, severity);

            // Add the event to the dashboard.
            eventList.appendChild(row);
        });

    } catch (error) {

        // Display an error if the events cannot be loaded.
        console.error("Activity log error:", error);

        eventList.textContent =
            "Unable to load infrastructure events.";
    }
}




// Simulate a failure using the backend API.
async function simulatePipelineFailure() {

    // Get the pipeline selector and result display.
    const selector = document.getElementById("pipeline-select");
    const result = document.getElementById("simulation-result");

    // Get the selected pipeline ID.
    const pipelineId = Number(selector.value);

    // Make sure a pipeline was selected.
    if (!pipelineId) {
        result.textContent = "Please select a pipeline first.";
        return;
    }

    // Find the selected pipeline in the database data loaded earlier.
    const selectedPipeline = pipelines.find(
        pipeline => Number(pipeline.pipeline_id) === pipelineId
    );

    // Check that the selected pipeline exists.
    if (!selectedPipeline) {
        result.textContent = "Could not find the selected pipeline.";
        return;
    }

    // Determine where the selected pipeline starts.
    const startNode = selectedPipeline.source_reservoir_id
        ? `R${selectedPipeline.source_reservoir_id}`
        : `S${selectedPipeline.source_station_id}`;

    // Determine the destination station.
    const targetNode = `S${selectedPipeline.destination_station_id}`;

    // Show that the simulation is running.
    result.textContent = "Simulating pipeline failure...";

    try {
        // Send the selected pipeline information to the backend.
        const response = await fetch(`${API_URL}/simulate-failure`, {
            method: "POST",

            // Tell the backend that we are sending JSON.
            headers: {
                "Content-Type": "application/json"
            },

            // Send the pipeline ID and route locations.
            body: JSON.stringify({
                pipelineId: pipelineId,
                startNode: startNode,
                targetNode: targetNode
            })
        });

        // Read the response from the backend.
        const data = await response.json();

        // Display an error if the backend rejected the request.
        if (!response.ok) {
            throw new Error(data.error || "Simulation failed.");
        }

// Save the latest failure simulation results.
failureSimulation = data;

// Require physical repair only when an abnormal flow condition exists.
repairStatus = "normal";

// Hide alternative routes until the user requests them.
showAlternativeRoutes = false;

// Make sure a previous backup pump is switched off for the new simulation.
backupPumpActive = false;

// Save the inactive pump status.
localStorage.setItem("backupPumpActive", "false");

// Close any previous backup pump confirmation popup.
document.getElementById("pump-confirmation").hidden = true;

// Reset the alternative route button.
document.getElementById("alternative-button").textContent =
    "SHOW ALTERNATIVE ROUTES";

/// Compare actual water flow against expected water flow.
const currentFlow = Number(selectedPipeline.current_flow);
const expectedFlow = Number(selectedPipeline.expected_flow);

// Treat the pipeline as failed when the simulation finds an alternative route.
const hasIssue = Boolean(data.alternativeRouteAvailable);

// Mark the pipeline as failed when an alternative route is available.
repairStatus = Boolean(data.alternativeRouteAvailable) ? "failed" : "normal";

// ==========================================
// SAVE THE PIPELINE FAILURE SIMULATION
// ==========================================

// Compare the current flow with the expected flow.
const lowFlowDetected =
    expectedFlow > 0 && currentFlow < expectedFlow;

// Describe what the simulation found without claiming
// that a real leak has been physically confirmed.
const eventMessage = lowFlowDetected
    ? `LOW FLOW DETECTED on Pipeline P${pipelineId}. Current flow: ${currentFlow}; expected flow: ${expectedFlow}.`
    : `Failure scenario simulated for Pipeline P${pipelineId}. Current flow: ${currentFlow}; expected flow: ${expectedFlow}.`;

// Permanently save the simulation event in PostgreSQL.
await logInfrastructureEvent(
    lowFlowDetected ? "LOW_FLOW_DETECTED" : "FAILURE_SIMULATION",
    lowFlowDetected ? "WARNING" : "INFO",
    "PIPELINE",
    pipelineId,
    eventMessage,
    {
        currentFlow: currentFlow,
        expectedFlow: expectedFlow,
        alternativeRouteAvailable: data.alternativeRouteAvailable,
        originalRoute: data.originalRoute || [],
        alternativeRoute: data.alternativeRoute || []
    }
);

// Identify the likely failure type.
const failureType = !hasIssue
    ? "NO LEAKAGE OR BLOCKAGE DETECTED"
    : currentFlow === 0
        ? "POSSIBLE BLOCKAGE"
        : "POSSIBLE LEAK";

// Display the failure diagnosis.
document.getElementById("failure-diagnosis").textContent =
    `Pipeline ${pipelineId}: ${failureType}`;

// Activate engineer confirmation only when an issue exists.
document.getElementById("repair-complete-button").disabled = !hasIssue;

// Keep pipeline restoration disabled until repair is confirmed.
document.getElementById("fix-button").disabled = true;

// Enable the alternative route button when the backend finds a backup route.
document.getElementById("alternative-button").disabled =
    !data.alternativeRouteAvailable;

// Display the diagnosis.
document.getElementById("failure-diagnosis").textContent =
    `Pipeline ${pipelineId}: ${failureType}. Physical inspection required.`;

// Redraw the network.
drawWaterNetwork();

// Refresh the pipeline status panel.
displayPipelines();

        // Display the original route.
        const original = data.originalRoute
            ? data.originalRoute.join(" → ")
            : "No original route found";

        // Display the alternative route.
        const alternative = data.alternativeRoute
            ? data.alternativeRoute.join(" → ")
            : "No alternative route available";

        // Show the complete simulation results.
        result.textContent =
            `Failed Pipeline: P${data.failedPipeline}\n` +
            `Original Route: ${original}\n` +
            `Alternative Route: ${alternative}\n` +
            `Alternative Route Available: ${data.alternativeRouteAvailable ? "YES" : "NO"}`;

    } catch (error) {
        // Display any communication or server errors.
        console.error("Failure simulation error:", error);
        result.textContent = `Simulation error: ${error.message}`;
    }
}

// ==========================================
// 8. PIPELINE REPAIR AND ROUTE CONTROLS
// ==========================================

/// Open the backup pump confirmation popup when requested.
document.getElementById("alternative-button").addEventListener("click", () => {

    // Display the popup asking whether to activate the backup pump.
    document.getElementById("pump-confirmation").hidden = false;

});

// Activate the backup water route when the operator clicks YES.
document.getElementById("activate-pump-button").addEventListener("click", async () => {

    // Close the confirmation popup.
    document.getElementById("pump-confirmation").hidden = true;

    // Activate the alternative water route display.
    showAlternativeRoutes = true;

    // Save the backup pump status so it remains active after page navigation.
backupPumpActive = true;
localStorage.setItem("backupPumpActive", "true");

    // Update the route button to show that the backup route is active.
    document.getElementById("alternative-button").textContent =
        "BACKUP WATER ROUTE ACTIVE";

    // Redraw the network to highlight the alternative pipelines.
    drawWaterNetwork();

    // Save the backup pump activation in the infrastructure event log.
const activatedPipelineId = failureSimulation?.failedPipeline ?? null;

await logInfrastructureEvent(
    "BACKUP_PUMP_ON",
    "WARNING",
    "PIPELINE",
    activatedPipelineId,
    `Backup route activated for Pipeline P${activatedPipelineId}.`,
    {
        alternativeRoute: failureSimulation?.alternativeRoute || []
    }
);

    // Display the backup pump activation status.
    document.getElementById("simulation-result").textContent =
        "BACKUP PUMP ACTIVATED — Water is being redirected through the alternative route.";
});

// Close the popup without activating the backup pump when the operator clicks NO.
document.getElementById("cancel-pump-button").addEventListener("click", () => {

    // Hide the confirmation popup.
    document.getElementById("pump-confirmation").hidden = true;

});

// Open the separate engineer maintenance page.
document.getElementById("repair-complete-button").addEventListener("click", () => {

    // Only allow maintenance when a pipeline failure has been detected.
    if (repairStatus !== "failed") return;

    // Save the failed pipeline ID for the engineer.
    localStorage.setItem(
        "failedPipelineId",
        String(failureSimulation.failedPipeline)
    );

    // Remove any previous approval so it cannot authorize a new repair.
localStorage.removeItem("maintenanceCompletePipelineId");

// Preserve the current failure simulation before leaving the dashboard.
localStorage.setItem(
    "savedFailureSimulation",
    JSON.stringify(failureSimulation)
);

// Open the engineer maintenance page.
window.location.href = "engineer.html";

});

// Restore the repaired pipeline and deactivate the backup water route.
document.getElementById("fix-button").addEventListener("click", async () => {

    // Do not restore the pipeline before engineer approval.
    if (repairStatus !== "repair-complete") return;


    // ==========================================
// RECORD PIPELINE REPAIR AND BACKUP SHUTDOWN
// ==========================================

// Save the repaired pipeline ID before clearing the simulation.
const repairedPipelineId =
    failureSimulation?.failedPipeline ??
    Number(localStorage.getItem("failedPipelineId"));

// Record when the backup pump is switched OFF.
if (backupPumpActive) {
    await logInfrastructureEvent(
        "BACKUP_PUMP_OFF",
        "INFO",
        "PIPELINE",
        repairedPipelineId,
        `Backup route deactivated for Pipeline P${repairedPipelineId}.`,
        {
            reason: "Engineer approved pipeline repair."
        }
    );
}

// Record that the original pipeline has been restored.
await logInfrastructureEvent(
    "PIPELINE_RESTORED",
    "INFO",
    "PIPELINE",
    repairedPipelineId,
    `Pipeline P${repairedPipelineId} repaired. Original water route restored.`,
    {
        repairApproved: true,
        backupPumpDeactivated: backupPumpActive
    }
);

    // Clear the failed pipeline simulation.
    failureSimulation = null;

    // Reset the repair process.
    repairStatus = "normal";

    // Deactivate the backup water route.
    showAlternativeRoutes = false;

    // Mark the backup pump as inactive.
backupPumpActive = false;

// Save the inactive pump status.
localStorage.setItem("backupPumpActive", "false");

    // Remove saved failure and engineer approval information.
    localStorage.removeItem("savedFailureSimulation");
    localStorage.removeItem("failedPipelineId");
    localStorage.removeItem("maintenanceCompletePipelineId");

    // Close the backup pump confirmation popup.
    document.getElementById("pump-confirmation").hidden = true;

    // Update the failure diagnosis.
    document.getElementById("failure-diagnosis").textContent =
        "Pipeline restored. Original water route operating normally.";

    // Display the restored network status.
    document.getElementById("simulation-result").textContent =
        "REPAIR COMPLETE — Backup route deactivated. Original pipeline restored.";

    // Reset the alternative route button.
    document.getElementById("alternative-button").disabled = true;
    document.getElementById("alternative-button").textContent =
        "SHOW ALTERNATIVE ROUTES";

    // Disable repair controls until another failure occurs.
    document.getElementById("repair-complete-button").disabled = true;
    document.getElementById("fix-button").disabled = true;

    // Redraw the network without the failure or backup route.
    drawWaterNetwork();

    // Refresh pipeline statuses after the repair.
displayPipelines();
});

// Connect the simulation button to its function.
document.getElementById("simulate-button").addEventListener(
    "click",
    simulatePipelineFailure
);

// ==========================================
// 8. START THE DASHBOARD
// ==========================================

// Load the database information when the page opens.
loadDashboardData();

 // Load infrastructure events when the dashboard opens.
loadInfrastructureEvents();

// Refresh the activity log every 5 seconds.
setInterval(loadInfrastructureEvents, 5000);
