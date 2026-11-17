
-- ==============================================
-- PIPELINE ROUTE UPGRADE
-- Allow pipelines to connect stations to stations.
-- ==============================================

-- Allow a pipeline to have no reservoir as its source.
-- This is necessary for station-to-station connections.
ALTER TABLE pipelines
ALTER COLUMN source_reservoir_id DROP NOT NULL;

-- Add a column for a distribution station as a source.
ALTER TABLE pipelines
ADD COLUMN source_station_id INTEGER;

-- Connect the new source station column to the stations table.
ALTER TABLE pipelines
ADD CONSTRAINT fk_pipeline_source_station
FOREIGN KEY (source_station_id)
REFERENCES distribution_stations(station_id);

-- Require every pipeline to have exactly one starting point:
-- either a reservoir OR a distribution station, but not both.
ALTER TABLE pipelines
ADD CONSTRAINT chk_pipeline_source
CHECK (
    (source_reservoir_id IS NOT NULL AND source_station_id IS NULL)
    OR
    (source_reservoir_id IS NULL AND source_station_id IS NOT NULL)
);
