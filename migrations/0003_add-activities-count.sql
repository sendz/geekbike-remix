-- Migration number: 0003 	 2025-09-02T23:16:38.351Z

-- migrations/0005_rebuild_activities_with_activities_number_not_null.sql

-- 1) Add the column as nullable
ALTER TABLE activities
ADD COLUMN activities_number INTEGER;

-- 2) Backfill existing rows with default 0
UPDATE activities
SET activities_number = 1
WHERE activities_number IS NULL;

