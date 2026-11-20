-- Up Migration
CREATE TABLE processed_events (
  event_id     uuid        PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Down Migration
DROP TABLE processed_events;