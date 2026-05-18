-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

-- Add trip_id column to existing travel_days table
ALTER TABLE travel_days ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;

-- Migrate existing days: create a default trip and assign unassigned days to it
INSERT INTO trips (id, name, created_at)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'Mi viaje',
  EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
WHERE EXISTS (SELECT 1 FROM travel_days WHERE trip_id IS NULL);

UPDATE travel_days
SET trip_id = '00000000-0000-0000-0000-000000000001'
WHERE trip_id IS NULL;
