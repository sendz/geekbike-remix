-- Migration number: 0001 	 2025-09-01T06:24:21.067Z

DROP TABLE IF EXISTS activities;

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  distance REAL NOT NULL,
  moving_time INTEGER NOT NULL,
  elapsed_time INTEGER NOT NULL,
  total_elevation_gain INTEGER NOT NULL,
  activity_date TEXT NOT NULL,
  inserted_at TEXT NOT NULL,
  UNIQUE(athlete_name, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_athlete_name ON activities(athlete_name);
