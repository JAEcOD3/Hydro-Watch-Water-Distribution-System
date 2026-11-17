
-- 1. Add reservoirs
INSERT INTO reservoirs
(name, location, total_capacity, current_water_level)
VALUES
('North Reservoir', 'North District', 100000, 80000),
('South Reservoir', 'South District', 75000, 60000);

-- 2. Add distribution stations
INSERT INTO distribution_stations
(name, location, demand, current_supply)
VALUES
('Central Station', 'Central District', 15000, 14000),
('East Station', 'East District', 8000, 7000),
('West Station', 'West District', 6000, 5000);

-- 3. Add pipelines
INSERT INTO pipelines
(source_reservoir_id, destination_station_id, capacity, current_flow)
VALUES
(
    (SELECT reservoir_id FROM reservoirs
     WHERE name = 'North Reservoir'),
    (SELECT station_id FROM distribution_stations
     WHERE name = 'Central Station'),
    30000, 14000
),
(
    (SELECT reservoir_id FROM reservoirs
     WHERE name = 'North Reservoir'),
    (SELECT station_id FROM distribution_stations
     WHERE name = 'East Station'),
    20000, 7000
),
(
    (SELECT reservoir_id FROM reservoirs
     WHERE name = 'South Reservoir'),
    (SELECT station_id FROM distribution_stations
     WHERE name = 'West Station'),
    15000, 5000
);

-- 4. Add consumers
INSERT INTO consumers
(station_id, name, consumer_type, water_demand, current_supply)
VALUES
(
    (SELECT station_id FROM distribution_stations
     WHERE name = 'Central Station'),
    'Central Homes', 'Residential', 10000, 9000
),
(
    (SELECT station_id FROM distribution_stations
     WHERE name = 'Central Station'),
    'Central Hospital', 'Healthcare', 5000, 5000
),
(
    (SELECT station_id FROM distribution_stations
     WHERE name = 'East Station'),
    'East Homes', 'Residential', 8000, 7000
),
(
    (SELECT station_id FROM distribution_stations
     WHERE name = 'West Station'),
    'West School', 'Education', 6000, 5000
);

