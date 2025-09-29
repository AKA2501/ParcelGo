CREATE TABLE IF NOT EXISTS driver_schedule (
  id BIGSERIAL PRIMARY KEY,
  driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,  -- 0..6
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIME,
  end_time TIME
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_driver_day ON driver_schedule(driver_id, day_of_week);
