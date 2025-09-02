-- Migration number: 0003 	 2025-09-02T23:16:38.351Z

-- migrations/0005_rebuild_activities_with_activities_number_not_null.sql

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- Recreate the table with the new NOT NULL column
CREATE TABLE activities_new (
  id TEXT PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  distance REAL NOT NULL,
  moving_time INTEGER NOT NULL,
  elapsed_time INTEGER NOT NULL,
  total_elevation_gain INTEGER NOT NULL,
  activity_date TEXT NOT NULL,
  inserted_at TEXT NOT NULL,
  activities_number INTEGER NOT NULL DEFAULT 1
);

-- If you have additional columns (e.g., "number"), add them above
-- and also include them in the INSERT SELECT below.

INSERT INTO activities_new (
  id, athlete_name, distance, moving_time, elapsed_time,
  total_elevation_gain, activity_date, inserted_at, activities_number
)
SELECT
  id, athlete_name, distance, moving_time, elapsed_time,
  total_elevation_gain, activity_date, inserted_at, 1
FROM activities;

DROP TABLE activities;
ALTER TABLE activities_new RENAME TO activities;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_athlete_name ON activities(athlete_name);

COMMIT;
PRAGMA foreign_keys=on;
