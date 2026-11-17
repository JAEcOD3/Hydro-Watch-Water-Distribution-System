
-- Connect pipelines to reservoirs
ALTER TABLE pipelines
ADD CONSTRAINT fk_pipeline_reservoir
FOREIGN KEY (source_reservoir_id)
REFERENCES reservoirs(reservoir_id);

-- Connect pipelines to distribution stations
ALTER TABLE pipelines
ADD CONSTRAINT fk_pipeline_station
FOREIGN KEY (destination_station_id)
REFERENCES distribution_stations(station_id);

-- Connect consumers to distribution stations
ALTER TABLE consumers
ADD CONSTRAINT fk_consumer_station
FOREIGN KEY (station_id)
REFERENCES distribution_stations(station_id);

