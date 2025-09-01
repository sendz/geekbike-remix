-- Migration number: 0001 	 2025-09-01T06:24:21.067Z

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  distance REAL NOT NULL,
  moving_time INTEGER NOT NULL,
  elapsed_time INTEGER NOT NULL,
  elevation_gain INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_athlete_name ON activities(athlete_name);
