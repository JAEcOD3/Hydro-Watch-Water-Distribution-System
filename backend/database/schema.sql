CREATE TABLE reservoirs (
    reservoir_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    current_water_level INTEGER NOT NULL CHECK (current_water_level >= 0),
    CONSTRAINT valid_water_level
        CHECK (current_water_level <= total_capacity)
);

CREATE TABLE pipelines (
    pipeline_id SERIAL PRIMARY KEY,
    source_reservoir_id INTEGER NOT NULL,
    destination_station_id INTEGER NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_flow INTEGER NOT NULL DEFAULT 0 CHECK (current_flow >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT valid_pipeline_flow
        CHECK (current_flow <= capacity)
);

CREATE TABLE distribution_stations (
    station_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    demand INTEGER NOT NULL CHECK (demand >= 0),
    current_supply INTEGER NOT NULL DEFAULT 0
        CHECK (current_supply >= 0),
    CONSTRAINT valid_station_supply
        CHECK (current_supply <= demand)
);



CREATE TABLE consumers (
    consumer_id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    consumer_type VARCHAR(50) NOT NULL,
    water_demand INTEGER NOT NULL CHECK (water_demand >= 0),
    current_supply INTEGER NOT NULL DEFAULT 0
        CHECK (current_supply >= 0),
    CONSTRAINT valid_consumer_supply
        CHECK (current_supply <= water_demand)
);
