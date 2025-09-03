-- Migration number: 0004 	 2025-09-02T23:37:42.243Z

UPDATE activities
SET activities_number = 1
WHERE activities_number IS NULL;