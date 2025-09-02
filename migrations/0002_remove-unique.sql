-- Migration number: 0002 	 2025-09-02T05:21:45.899Z

PRAGMA foreign_keys=off;

-- 1. Create new table without UNIQUE
CREATE TABLE IF NOT EXISTS activities_new (
  id TEXT PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  distance REAL NOT NULL,
  moving_time INTEGER NOT NULL,
  elapsed_time INTEGER NOT NULL,
  total_elevation_gain INTEGER NOT NULL,
  activity_date TEXT NOT NULL,
  inserted_at TEXT NOT NULL
);

-- 2. Copy data
INSERT INTO activities_new
SELECT id, athlete_name, distance, moving_time, elapsed_time, total_elevation_gain, activity_date, inserted_at
FROM activities;

-- 3. Drop old table
DROP TABLE activities;

-- 4. Rename new table
ALTER TABLE activities_new RENAME TO activities;

-- 5. Recreate index
CREATE INDEX IF NOT EXISTS idx_athlete_name ON activities(athlete_name);

PRAGMA foreign_keys=on;